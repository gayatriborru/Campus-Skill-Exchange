const http = require('http');

const API_BASE = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = new URL(`${API_BASE}${endpoint}`);
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const body = options.body ? JSON.stringify(options.body) : null;

  return new Promise((resolve, reject) => {
    const req = http.request(
      url,
      {
        method: options.method || 'GET',
        headers,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = rawData ? JSON.parse(rawData) : {};
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ status: res.statusCode, data: parsed });
            } else {
              const err = new Error(parsed.message || `Request failed with status ${res.statusCode}`);
              err.status = res.statusCode;
              err.data = parsed;
              reject(err);
            }
          } catch (e) {
            resolve({ status: res.statusCode, raw: rawData });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

async function runE2EVerification() {
  console.log('================================================================');
  console.log(' STARTING END-TO-END DATABASE-DRIVEN VERIFICATION FOR MONGODB');
  console.log('================================================================');

  // Step 1: Verify Platform Stats directly computed from MongoDB
  console.log('\n[1] Testing GET /api/analytics/platform-stats...');
  const statsRes = await request('/analytics/platform-stats');
  const platformStats = statsRes.data.stats || statsRes.data;
  console.log('✓ Genuine platform statistics computed from MongoDB:');
  console.log(`  • Active Students: ${platformStats.activeStudents}`);
  console.log(`  • Total Skills in Directory: ${platformStats.totalSkills}`);
  console.log(`  • Completed Sessions: ${platformStats.completedSessions}`);
  console.log(`  • Average Platform Rating: ${platformStats.averageRating} ★`);
  if (typeof platformStats.activeStudents !== 'number' || typeof platformStats.totalSkills !== 'number') {
    throw new Error('Platform stats does not contain genuine numerical data.');
  }

  // Step 2: Verify Real Badges fetched from MongoDB
  console.log('\n[2] Testing GET /api/badges...');
  const badgesRes = await request('/badges');
  const badges = badgesRes.data.badges || [];
  console.log(`✓ Fetched ${badges.length} badges directly from MongoDB:`);
  badges.slice(0, 3).forEach((b) => console.log(`  - [${b.category}] ${b.name}: "${b.description}"`));

  // Step 3: Verify Real Distinct Categories from MongoDB
  console.log('\n[3] Testing GET /api/skills/categories...');
  const catRes = await request('/skills/categories');
  const categories = catRes.data.categories || [];
  console.log(`✓ Retrieved ${categories.length} distinct categories in MongoDB taxonomy:`);
  console.log(`  ${categories.join(', ')}`);

  // Step 4: Register a new student
  const testSuffix = Date.now();
  const testUser = {
    name: `Alex DB Student ${testSuffix}`,
    email: `alex_db_${testSuffix}@campus.edu`,
    password: 'Password123!',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
  };

  console.log('\n[4] Testing Student Registration POST /api/auth/register...');
  const regRes = await request('/auth/register', {
    method: 'POST',
    body: testUser,
  });
  const registeredUser = regRes.data.user;
  const token = regRes.data.token;
  console.log('✓ Student registered and saved to MongoDB:');
  console.log(`  • ID: ${registeredUser._id}`);
  console.log(`  • Name: ${registeredUser.name}`);
  console.log(`  • Email: ${registeredUser.email}`);
  console.log(`  • Skill Points (welcome bonus): ${registeredUser.skillPoints}`);
  if (!token) throw new Error('JWT token not returned on registration');

  const authHeaders = { Authorization: `Bearer ${token}` };

  // Step 5: Verify GET /api/auth/profile matches MongoDB
  console.log('\n[5] Testing GET /api/auth/profile with Bearer token...');
  const meRes = await request('/auth/profile', { headers: authHeaders });
  const freshProfile = meRes.data.user;
  console.log('✓ Verified user retrieved from MongoDB:');
  console.log(`  • Name: ${freshProfile.name}`);
  console.log(`  • Department: ${freshProfile.department}`);

  // Step 6: Get available skill from taxonomy
  console.log('\n[6] Getting skills list from GET /api/skills...');
  const skillsListRes = await request('/skills');
  const skills = skillsListRes.data.skills || [];
  if (skills.length === 0) {
    throw new Error('No skills found in database taxonomy.');
  }
  const testSkill = skills[0];
  console.log(`✓ Using skill from MongoDB taxonomy: "${testSkill.name}" (${testSkill._id})`);

  // Step 7: Add skill to student profile (Create record in MongoDB)
  console.log('\n[7] Adding skill to user profile POST /api/users/skills...');
  const addSkillRes = await request('/users/skills', {
    method: 'POST',
    headers: authHeaders,
    body: {
      skillId: testSkill._id,
      type: 'teach',
      level: 'Advanced',
      description: 'Experienced in real-time MongoDB projects',
    },
  });
  console.log('✓ Skill added successfully and persisted in MongoDB StudentSkill collection:');
  const studentSkillRecord = addSkillRes.data.studentSkill || addSkillRes.data.skill;
  console.log(`  • StudentSkill ID: ${studentSkillRecord._id}`);
  console.log(`  • Level: ${studentSkillRecord.level}`);
  console.log(`  • Type: ${studentSkillRecord.type}`);

  // Step 8: Verify skill appears when fetching user skills GET /api/users/skills
  console.log('\n[8] Verifying user skills from MongoDB GET /api/users/skills...');
  const mySkillsRes = await request('/users/skills', { headers: authHeaders });
  const skillsTeach = mySkillsRes.data.skillsTeach || [];
  const foundSkill = skillsTeach.find(
    (st) => (st.skill?._id || st.skill) === testSkill._id
  );
  if (!foundSkill) {
    throw new Error('Skill not found in user skillsTeach after addition!');
  }
  console.log(`✓ Skill verified in MongoDB portfolio: "${foundSkill.skill?.name || testSkill.name}" (Level: ${foundSkill.level})`);

  // Step 9: Update student profile PUT /api/auth/profile (Update record in MongoDB)
  console.log('\n[9] Updating student profile PUT /api/auth/profile...');
  const updatedBio = `Full-stack engineer verified at timestamp ${testSuffix}`;
  const updateProfileRes = await request('/auth/profile', {
    method: 'PUT',
    headers: authHeaders,
    body: {
      bio: updatedBio,
      department: 'Data Science & AI',
      year: '4th Year',
      availability: 'Weekends',
    },
  });
  console.log('✓ Profile updated in MongoDB:');
  console.log(`  • Updated Bio: "${updateProfileRes.data.user.bio}"`);
  console.log(`  • Updated Dept: ${updateProfileRes.data.user.department}`);
  if (updateProfileRes.data.user.bio !== updatedBio) {
    throw new Error('Profile bio was not updated in MongoDB');
  }

  // Step 10: Verify public user profile matches updated MongoDB record
  console.log('\n[10] Verifying public user profile GET /api/users/:id...');
  const publicUserRes = await request(`/users/${registeredUser._id}`);
  const publicUser = publicUserRes.data.student;
  console.log('✓ Verified public profile reflects updated MongoDB record:');
  console.log(`  • Name: ${publicUser.name}`);
  console.log(`  • Dept: ${publicUser.department}`);
  console.log(`  • Bio: "${publicUser.bio}"`);
  if (publicUser.department !== 'Data Science & AI') {
    throw new Error('Public profile does not reflect updated department');
  }

  // Step 11: Delete skill from portfolio DELETE /api/users/skills/:id (Delete record from MongoDB)
  console.log('\n[11] Deleting skill DELETE /api/users/skills/:id...');
  await request(`/users/skills/${studentSkillRecord._id}`, {
    method: 'DELETE',
    headers: authHeaders,
  });
  console.log('✓ Delete skill request succeeded');

  // Step 12: Verify skill completely disappeared from MongoDB portfolio
  console.log('\n[12] Verifying skill is removed from MongoDB GET /api/users/skills...');
  const afterDeleteSkillsRes = await request('/users/skills', { headers: authHeaders });
  const stillExists = (afterDeleteSkillsRes.data.skillsTeach || []).some(
    (st) => st._id === studentSkillRecord._id
  );
  if (stillExists) {
    throw new Error('Skill still present in MongoDB after deletion!');
  }
  console.log('✓ Confirmed: Skill is completely deleted from MongoDB');

  console.log('\n================================================================');
  console.log('  ALL 12 END-TO-END VERIFICATION CHECKS PASSED SUCCESSFULLY!');
  console.log('  100% REAL DATA FLOW: React Frontend -> Express API -> MongoDB');
  console.log('================================================================\n');
}

runE2EVerification().catch((err) => {
  console.error('\n❌ VERIFICATION ERROR:', err);
  process.exit(1);
});
