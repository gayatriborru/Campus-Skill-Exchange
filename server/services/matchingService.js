const StudentSkill = require('../models/StudentSkill');
const User = require('../models/User');

const calculateSkillMatch = async (currentUserId, options = {}) => {
  // 1. Fetch current user's skills
  const mySkills = await StudentSkill.find({ student: currentUserId }).populate('skill');
  const currentUser = await User.findById(currentUserId);

  const myLearnSkills = mySkills.filter((s) => s.type === 'learn' && s.skill);
  const myTeachSkills = mySkills.filter((s) => s.type === 'teach' && s.skill);

  const myLearnSkillIds = myLearnSkills.map((s) => s.skill._id.toString());
  const myTeachSkillIds = myTeachSkills.map((s) => s.skill._id.toString());

  // 2. Query other active students
  const query = {
    _id: { $ne: currentUserId },
    isBlocked: false,
  };

  if (currentUser?.blockedUsers?.length) {
    query._id.$nin = [currentUserId, ...currentUser.blockedUsers];
  }

  // Optional filters (department, year, rating)
  if (options.department && options.department !== 'All') {
    query.department = options.department;
  }
  if (options.year && options.year !== 'All') {
    query.year = options.year;
  }
  if (options.minRating) {
    query.averageRating = { $gte: Number(options.minRating) };
  }

  const otherStudents = await User.find(query).select(
    'name email department year bio profileImage averageRating ratingsCount completedSessionsCount availability skillPoints gender'
  );

  // 3. For each student, analyze skill overlap & calculate affinity
  const matchResults = [];

  for (const student of otherStudents) {
    const theirSkills = await StudentSkill.find({ student: student._id }).populate('skill');
    const theirTeachSkills = theirSkills.filter((s) => s.type === 'teach' && s.skill);
    const theirLearnSkills = theirSkills.filter((s) => s.type === 'learn' && s.skill);

    // Skills they can teach me
    const theyCanTeachMe = theirTeachSkills.filter((ts) =>
      myLearnSkillIds.includes(ts.skill._id.toString())
    );

    // Skills I can teach them
    const iCanTeachThem = myTeachSkills.filter((ts) =>
      theirLearnSkills.some((ls) => ls.skill._id.toString() === ts.skill._id.toString())
    );

    // Skip if there is zero skill intersection (unless in general discovery mode without filters)
    if (theyCanTeachMe.length === 0 && iCanTeachThem.length === 0 && !options.includeAll) {
      continue;
    }

    let score = 0;
    const reasons = [];

    // Factor 1: They teach what I want to learn (Base: up to 45%)
    if (theyCanTeachMe.length > 0) {
      const teachMeCount = Math.min(theyCanTeachMe.length, 3);
      score += 25 + teachMeCount * 10;
      reasons.push(`Can teach you: ${theyCanTeachMe.map((s) => s.skill.name).join(', ')}`);
    }

    // Factor 2: Bidirectional match (I teach what they want to learn - up to 35%)
    if (iCanTeachThem.length > 0) {
      const teachThemCount = Math.min(iCanTeachThem.length, 3);
      score += 20 + teachThemCount * 8;
      reasons.push(`Wants to learn from you: ${iCanTeachThem.map((s) => s.skill.name).join(', ')}`);
    }

    // Factor 3: Level Compatibility (e.g. Beginner learner + Advanced/Expert teacher)
    let levelBonus = 0;
    theyCanTeachMe.forEach((ts) => {
      const myWantedSkill = myLearnSkills.find(
        (ls) => ls.skill._id.toString() === ts.skill._id.toString()
      );
      if (myWantedSkill) {
        if (
          (myWantedSkill.level === 'Beginner' && ['Advanced', 'Expert'].includes(ts.level)) ||
          (myWantedSkill.level === 'Intermediate' && ['Advanced', 'Expert'].includes(ts.level))
        ) {
          levelBonus = Math.max(levelBonus, 10);
        } else {
          levelBonus = Math.max(levelBonus, 5);
        }
      }
    });

    if (levelBonus > 0) {
      score += levelBonus;
      reasons.push('Compatible skill mastery levels');
    }

    // Factor 4: Availability alignment
    if (
      currentUser?.availability === 'Flexible' ||
      student.availability === 'Flexible' ||
      currentUser?.availability === student.availability
    ) {
      score += 8;
      reasons.push(`Matching availability (${student.availability || 'Flexible'})`);
    }

    // Factor 5: High rating bonus
    if (student.averageRating >= 4.5 && student.ratingsCount > 0) {
      score += 5;
      reasons.push(`Top-rated student mentor (★ ${student.averageRating.toFixed(1)})`);
    }

    // Compute final percentage (0 if no score)
    const finalScore = Math.min(Math.round(score), 100);

    matchResults.push({
      student,
      matchPercentage: finalScore,
      isMutualMatch: theyCanTeachMe.length > 0 && iCanTeachThem.length > 0,
      skillsTheyTeach: theirTeachSkills.map((s) => ({
        name: s.skill.name,
        category: s.skill.category,
        level: s.level,
      })),
      skillsTheyLearn: theirLearnSkills.map((s) => ({
        name: s.skill.name,
        category: s.skill.category,
        level: s.level,
      })),
      matchedSkillsToLearn: theyCanTeachMe.map((s) => s.skill.name),
      matchedSkillsToTeach: iCanTeachThem.map((s) => s.skill.name),
      reasons,
    });
  }

  // Sort by highest match percentage
  matchResults.sort((a, b) => b.matchPercentage - a.matchPercentage);

  return matchResults;
};

module.exports = { calculateSkillMatch };
