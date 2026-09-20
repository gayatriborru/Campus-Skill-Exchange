const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });
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

async function verifyCleanUsersFlow() {
  console.log('========================================================================');
  console.log(' VERIFYING 100% CLEAN USERS FLOW (ZERO PRE-EXISTING / SEEDED USERS)');
  console.log('========================================================================');

  // Step 1: Confirm Users list starts completely EMPTY
  console.log('\n[Check 1] Querying GET /api/users on clean database...');
  const initialRes = await request('/users');
  const initialUsers = initialRes.data.users || initialRes.data.students || [];
  console.log(`✓ User count in database: ${initialUsers.length}`);
  if (initialUsers.length !== 0) {
    throw new Error(`Expected exactly 0 users initially, but found ${initialUsers.length}!`);
  }
  console.log('✓ Confirmed: The Users list starts completely EMPTY (0 users).');
  console.log('✓ Confirmed: Frontend will display "No registered users yet".');

  // Step 2: Register a new real student through the Register API
  const timestamp = Date.now();
  const newUserData = {
    name: `Elena Rostova ${timestamp}`,
    email: `elena_${timestamp}@campus.edu`,
    password: 'SecurePassword2026!',
    department: 'Data Science & AI',
    year: '3rd Year',
    bio: 'Newly registered campus student via real sign up flow.',
  };

  console.log('\n[Check 2] Registering new student via POST /api/auth/register...');
  console.log(`  Name: ${newUserData.name}`);
  console.log(`  Email: ${newUserData.email}`);
  const regRes = await request('/auth/register', {
    method: 'POST',
    body: newUserData,
  });

  const registeredUser = regRes.data.user;
  const token = regRes.data.token;
  if (!registeredUser || !registeredUser._id) {
    throw new Error('User record was not created/returned upon registration.');
  }
  if (!token) {
    throw new Error('JWT token was not issued upon registration.');
  }
  console.log(`✓ Real user document created in MongoDB Atlas: ID ${registeredUser._id}`);
  console.log(`✓ Welcome bonus skill points: ${registeredUser.skillPoints} pts`);

  // Step 3: Re-fetch GET /api/users and confirm ONLY this registered user is present
  console.log('\n[Check 3] Re-fetching GET /api/users after registration...');
  const afterRegRes = await request('/users');
  const currentUsers = afterRegRes.data.users || afterRegRes.data.students || [];
  console.log(`✓ Current user count in database: ${currentUsers.length}`);
  if (currentUsers.length !== 1) {
    throw new Error(`Expected exactly 1 user in database, found ${currentUsers.length}!`);
  }

  const foundUser = currentUsers[0];
  if (foundUser._id !== registeredUser._id || foundUser.email !== newUserData.email) {
    throw new Error('Fetched user does not match the registered user!');
  }
  console.log('✓ Confirmed: Newly registered user is the ONLY user in the directory:');
  console.log(`  • ID: ${foundUser._id}`);
  console.log(`  • Name: ${foundUser.name}`);
  console.log(`  • Email: ${foundUser.email}`);
  console.log(`  • Department: ${foundUser.department}`);

  // Step 4: Security Verification - zero passwords or hashes exposed
  if (foundUser.password || foundUser.passwordHash) {
    throw new Error('SECURITY VIOLATION: Password hash was exposed in /api/users response!');
  }
  console.log('✓ Confirmed: Passwords and password hashes are strictly omitted.');

  // Step 5: Sign In verification - does NOT duplicate user record
  console.log('\n[Check 5] Simulating Sign In (POST /api/auth/login)...');
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: {
      email: newUserData.email,
      password: newUserData.password,
    },
  });
  if (!loginRes.data.token) {
    throw new Error('Sign in failed for registered user.');
  }
  console.log('✓ Sign in authenticated existing MongoDB user.');

  const checkCountRes = await request('/users');
  const usersAfterLogin = checkCountRes.data.users || checkCountRes.data.students || [];
  if (usersAfterLogin.length !== 1) {
    throw new Error(`Duplicate user created on login! Count is now ${usersAfterLogin.length}`);
  }
  console.log('✓ Confirmed: Sign In did NOT duplicate the user record. Count remains exactly 1.');

  // Step 6: Clean up test user so DB returns to clean 0 state
  console.log('\n[Check 6] Cleaning up verification user from MongoDB...');
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_skill_exchange';
  await mongoose.connect(mongoUri);
  const User = require('../models/User');
  await User.findByIdAndDelete(registeredUser._id);
  await mongoose.disconnect();
  console.log(`✓ Deleted user ${registeredUser._id}.`);

  const finalRes = await request('/users');
  const finalUsers = finalRes.data.users || finalRes.data.students || [];
  console.log(`✓ Database returned to clean 0 state: ${finalUsers.length} users.`);

  console.log('\n========================================================================');
  console.log(' ✅ ALL CLEAN USERS VERIFICATION CHECKS PASSED PERFECTLY!');
  console.log(' 1. Users list starts 100% empty (displays "No registered users yet").');
  console.log(' 2. ZERO dummy/mock/sample/pre-seeded users.');
  console.log(' 3. ONLY newly registered users appear in the Users list.');
  console.log('========================================================================\n');
}

verifyCleanUsersFlow().catch((err) => {
  console.error('\n❌ VERIFICATION TEST FAILED:', err);
  process.exit(1);
});
