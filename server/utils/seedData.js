const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Skill = require('../models/Skill');
const StudentSkill = require('../models/StudentSkill');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const Session = require('../models/Session');
const Rating = require('../models/Rating');

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

    // 1. Clear existing collections
    console.log('[Seeder] Cleaning existing test collections...');
    await Promise.all([
      User.deleteMany(),
      Skill.deleteMany(),
      StudentSkill.deleteMany(),
      Badge.deleteMany(),
      UserBadge.deleteMany(),
      Session.deleteMany(),
      Rating.deleteMany(),
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
    const badgeMap = {};
    createdBadges.forEach((b) => (badgeMap[b.code] = b._id));

    // 4. Seed Users (Admin + Students)
    console.log('[Seeder] Creating demo users...');
    const users = [
      {
        name: 'Campus Administrator',
        email: 'admin@campus.edu',
        password: 'password123',
        department: 'Computer Science & Engineering',
        year: 'Postgraduate',
        bio: 'Official Campus Skill Exchange Moderator & Safety Lead.',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        role: 'admin',
        skillPoints: 1000,
        averageRating: 5.0,
      },
      {
        name: 'Aarav Patel',
        email: 'aarav@campus.edu',
        password: 'password123',
        department: 'Computer Science & Engineering',
        year: '3rd Year',
        bio: 'Full-stack builder passionate about Python, clean backend architecture, and database tuning. Looking to level up my UI/UX design craft!',
        profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
        role: 'student',
        skillPoints: 340,
        averageRating: 4.9,
        ratingsCount: 8,
        completedSessionsCount: 9,
        availability: 'Flexible',
      },
      {
        name: 'Sneha Sharma',
        email: 'sneha@campus.edu',
        password: 'password123',
        department: 'Design & Media',
        year: '3rd Year',
        bio: 'Figma enthusiast, design systems creator, and visual storyteller. Super eager to learn Python and backend basics to build my own apps!',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
        role: 'student',
        skillPoints: 290,
        averageRating: 4.8,
        ratingsCount: 6,
        completedSessionsCount: 7,
        availability: 'Flexible',
      },
      {
        name: 'Rohan Verma',
        email: 'rohan@campus.edu',
        password: 'password123',
        department: 'Information Technology',
        year: '4th Year',
        bio: 'React and Node.js developer. I build real-time web products. Excited to learn Machine Learning from campus peers.',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        role: 'student',
        skillPoints: 210,
        averageRating: 4.7,
        ratingsCount: 4,
        completedSessionsCount: 5,
        availability: 'Weekends',
      },
      {
        name: 'Ananya Iyer',
        email: 'ananya@campus.edu',
        password: 'password123',
        department: 'Business Administration',
        year: '2nd Year',
        bio: 'TEDx college speaker, debate champion. Happy to mentor in public speaking and business pitching in exchange for video editing tips.',
        profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        role: 'student',
        skillPoints: 175,
        averageRating: 5.0,
        ratingsCount: 3,
        completedSessionsCount: 4,
        availability: 'Evenings',
      },
      {
        name: 'Vikram Singh',
        email: 'vikram@campus.edu',
        password: 'password123',
        department: 'Data Science & AI',
        year: '4th Year',
        bio: 'Deep learning researcher and Kaggle contributor. Teaching ML models and looking for frontend React mentorship.',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        role: 'student',
        skillPoints: 310,
        averageRating: 4.9,
        ratingsCount: 7,
        completedSessionsCount: 8,
        availability: 'Weekdays',
      },
    ];

    const createdUsers = [];
    for (const u of users) {
      const userDoc = await User.create(u);
      createdUsers.push(userDoc);
    }

    const [admin, aarav, sneha, rohan, ananya, vikram] = createdUsers;

    // 5. Seed StudentSkills (Teach & Learn)
    console.log('[Seeder] Mapping skill competencies (Teach & Learn)...');
    const studentSkillsData = [
      // Aarav (Python/SQL Teacher, UI/UX & React Learner)
      { student: aarav._id, skill: skillMap['Python'], type: 'teach', level: 'Expert', notes: 'Core algorithms & problem solving' },
      { student: aarav._id, skill: skillMap['SQL & Database Design'], type: 'teach', level: 'Advanced', notes: 'Schema design & indexing' },
      { student: aarav._id, skill: skillMap['UI/UX Design'], type: 'learn', level: 'Beginner', notes: 'Figma component libraries' },
      { student: aarav._id, skill: skillMap['React.js'], type: 'learn', level: 'Intermediate', notes: 'Performance tuning' },

      // Sneha (UI/UX & Graphic Design Teacher, Python & SQL Learner) -> PERFECT MATCH WITH AARAV!
      { student: sneha._id, skill: skillMap['UI/UX Design'], type: 'teach', level: 'Expert', notes: 'Wireframing, typography, Figma' },
      { student: sneha._id, skill: skillMap['Graphic Design'], type: 'teach', level: 'Advanced', notes: 'Illustrator & visual hierarchy' },
      { student: sneha._id, skill: skillMap['Python'], type: 'learn', level: 'Beginner', notes: 'Basics & scripting for design tools' },
      { student: sneha._id, skill: skillMap['SQL & Database Design'], type: 'learn', level: 'Beginner', notes: 'Understanding relational data' },

      // Rohan (React/Node Teacher, Machine Learning Learner)
      { student: rohan._id, skill: skillMap['React.js'], type: 'teach', level: 'Expert', notes: 'Modern hooks, Redux, Tailwind' },
      { student: rohan._id, skill: skillMap['Node.js'], type: 'teach', level: 'Advanced', notes: 'REST APIs & WebSockets' },
      { student: rohan._id, skill: skillMap['Machine Learning'], type: 'learn', level: 'Beginner', notes: 'Neural networks & Python ML' },

      // Ananya (Public Speaking Teacher, Video Editing Learner)
      { student: ananya._id, skill: skillMap['Public Speaking'], type: 'teach', level: 'Expert', notes: 'Debating, pacing, body language' },
      { student: ananya._id, skill: skillMap['Business Communication'], type: 'teach', level: 'Advanced', notes: 'Resume, pitching & interviews' },
      { student: ananya._id, skill: skillMap['Video Editing'], type: 'learn', level: 'Beginner', notes: 'Reels and YouTube editing' },

      // Vikram (Machine Learning Teacher, React Learner) -> MATCH WITH ROHAN!
      { student: vikram._id, skill: skillMap['Machine Learning'], type: 'teach', level: 'Expert', notes: 'Regression, Classification & NLP' },
      { student: vikram._id, skill: skillMap['Python'], type: 'teach', level: 'Advanced', notes: 'Numpy, Pandas, Matplotlib' },
      { student: vikram._id, skill: skillMap['React.js'], type: 'learn', level: 'Beginner', notes: 'Building web dashboards for ML' },
    ];

    await StudentSkill.insertMany(studentSkillsData);

    // 6. Award Initial Badges
    console.log('[Seeder] Assigning earned badges...');
    await UserBadge.create([
      { user: aarav._id, badge: badgeMap['FIRST_TEACHER'] },
      { user: aarav._id, badge: badgeMap['SKILL_MENTOR'] },
      { user: aarav._id, badge: badgeMap['TOP_CONTRIBUTOR'] },
      { user: sneha._id, badge: badgeMap['FIRST_TEACHER'] },
      { user: sneha._id, badge: badgeMap['FIRST_LEARNER'] },
      { user: rohan._id, badge: badgeMap['FIRST_TEACHER'] },
      { user: ananya._id, badge: badgeMap['COMMUNITY_HELPER'] },
      { user: vikram._id, badge: badgeMap['SKILL_MENTOR'] },
    ]);

    // 7. Seed Sample Completed Sessions and Ratings
    console.log('[Seeder] Creating sample sessions and reviews...');
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 3);

    const completedSession = await Session.create({
      teacher: aarav._id,
      learner: sneha._id,
      skill: skillMap['Python'],
      date: pastDate,
      startTime: '16:00',
      endTime: '17:00',
      status: 'Completed',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      topic: 'Introduction to Python variables, loops and functions',
      notes: 'Sneha learned basic Python syntax and wrote her first scripts.',
      rated: true,
    });

    await Rating.create({
      session: completedSession._id,
      teacher: aarav._id,
      learner: sneha._id,
      skillKnowledge: 5,
      communication: 5,
      helpfulness: 5,
      overallRating: 5.0,
      feedback: 'Aarav is an incredible teacher! He broke down Python loops with clear visuals that made coding feel intuitive. Highly recommend learning from him!',
    });

    // Upcoming Session
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);

    await Session.create({
      teacher: sneha._id,
      learner: aarav._id,
      skill: skillMap['UI/UX Design'],
      date: futureDate,
      startTime: '15:00',
      endTime: '16:00',
      status: 'Scheduled',
      meetingLink: 'https://meet.google.com/xyz-uvwx-rst',
      topic: 'Figma Auto-Layout & Design Tokens Crash Course',
      notes: 'Mutual skill exchange session scheduled.',
    });

    console.log('----------------------------------------------------');
    console.log('✅ Campus Skill Exchange Platform Seeded Successfully!');
    console.log('----------------------------------------------------');
    console.log('Demo Accounts:');
    console.log('👑 Admin:   admin@campus.edu    / password123');
    console.log('🎓 Student: aarav@campus.edu    / password123 (Python teacher, UI/UX learner)');
    console.log('🎓 Student: sneha@campus.edu    / password123 (UI/UX teacher, Python learner - 95%+ Match!)');
    console.log('🎓 Student: rohan@campus.edu    / password123 (React developer)');
    console.log('🎓 Student: ananya@campus.edu   / password123 (Public speaker)');
    console.log('🎓 Student: vikram@campus.edu   / password123 (ML researcher)');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
