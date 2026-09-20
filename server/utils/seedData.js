const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Skill = require('../models/Skill');
const Badge = require('../models/Badge');

dotenv.config({ path: '../.env' });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: '.env' });
}

const seedDatabase = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_skill_exchange';

    console.log(`[Seeder] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('[Seeder] Connected successfully.');

    // 1. Reset Skill & Badge taxonomy collections (Users are NEVER seeded)
    console.log('[Seeder] Refreshing campus taxonomy collections...');
    await Promise.all([
      Skill.deleteMany(),
      Badge.deleteMany(),
    ]);

    // 2. Seed Skills
    console.log('[Seeder] Creating campus skills taxonomy...');
    const skillsData = [
      { name: 'Python', category: 'Programming', description: 'Data structures, scripting, algorithms and OOP in Python.' },
      { name: 'Java', category: 'Programming', description: 'Core Java, Spring Boot, and Enterprise Application Design.' },
      { name: 'React.js', category: 'Web Development', description: 'Modern frontend development with hooks, state management, and Tailwind.' },
      { name: 'Node.js', category: 'Web Development', description: 'REST APIs, Express, MongoDB, and asynchronous microservices.' },
      { name: 'SQL & Database Design', category: 'Data & AI', description: 'Relational query design, normalization, indexing and optimization.' },
      { name: 'Machine Learning', category: 'Data & AI', description: 'Scikit-learn, supervised learning, and predictive modeling.' },
      { name: 'UI/UX Design', category: 'Design', description: 'User flows, wireframing, high-fidelity prototypes in Figma and design systems.' },
      { name: 'Graphic Design', category: 'Design', description: 'Brand identity, typography, vector assets, and visual composition.' },
      { name: 'Video Editing', category: 'Media & Arts', description: 'Premiere Pro, DaVinci Resolve, narrative storytelling, and pacing.' },
      { name: 'Public Speaking', category: 'Communication', description: 'Stage presence, pitching presentations, confidence, and rhetorical pacing.' },
      { name: 'Business Communication', category: 'Communication', description: 'Professional email etiquette, negotiation, and corporate networking.' },
      { name: 'Cloud & DevOps', category: 'Programming', description: 'Docker, AWS fundamentals, CI/CD pipelines, and Linux server management.' },
    ];

    const createdSkills = await Skill.insertMany(skillsData);
    const skillMap = {};
    createdSkills.forEach((s) => (skillMap[s.name] = s._id));

    // 3. Seed Badges
    console.log('[Seeder] Creating gamification badges...');
    const badgesData = [
      {
        name: 'First Teacher',
        code: 'FIRST_TEACHER',
        description: 'Completed your first session teaching a campus peer.',
        icon: 'GraduationCap',
        category: 'Teaching',
        criteriaType: 'TEACH_COUNT',
        criteriaThreshold: 1,
      },
      {
        name: 'First Learner',
        code: 'FIRST_LEARNER',
        description: 'Attended your first learning exchange session.',
        icon: 'BookOpen',
        category: 'Learning',
        criteriaType: 'LEARN_COUNT',
        criteriaThreshold: 1,
      },
      {
        name: 'Skill Mentor',
        code: 'SKILL_MENTOR',
        description: 'Guided and taught 5 or more student sessions.',
        icon: 'Award',
        category: 'Teaching',
        criteriaType: 'TEACH_COUNT',
        criteriaThreshold: 5,
      },
      {
        name: 'Active Learner',
        code: 'ACTIVE_LEARNER',
        description: 'Attended 5 or more skill discovery sessions.',
        icon: 'Sparkles',
        category: 'Learning',
        criteriaType: 'LEARN_COUNT',
        criteriaThreshold: 5,
      },
      {
        name: 'Top Contributor',
        code: 'TOP_CONTRIBUTOR',
        description: 'Accumulated 250 or more campus skill points.',
        icon: 'Flame',
        category: 'Excellence',
        criteriaType: 'POINTS_THRESHOLD',
        criteriaThreshold: 250,
      },
      {
        name: 'Community Helper',
        code: 'COMMUNITY_HELPER',
        description: 'Maintained an outstanding 4.8+ rating across sessions.',
        icon: 'HeartHandshake',
        category: 'Community',
        criteriaType: 'RATING_THRESHOLD',
        criteriaThreshold: 4.8,
      },
      {
        name: 'Knowledge Sharer',
        code: 'KNOWLEDGE_SHARER',
        description: 'Registered 3 or more distinct skills you can teach.',
        icon: 'Share2',
        category: 'Teaching',
        criteriaType: 'SESSIONS_COUNT',
        criteriaThreshold: 3,
      },
    ];

    const createdBadges = await Badge.insertMany(badgesData);
    console.log(`[Seeder] Created ${createdSkills.length} skills and ${createdBadges.length} badges.`);
    console.log('[Seeder] NO users seeded. Users list remains 100% empty for user registrations.');

    console.log('----------------------------------------------------');
    console.log('✅ Campus Skill Exchange Platform Taxonomies Seeded!');
    console.log('Zero demo/mock users created. Users list starts empty.');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();

