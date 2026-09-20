const Skill = require('../models/Skill');
const StudentSkill = require('../models/StudentSkill');
const { checkAndAwardBadges } = require('../services/gamificationService');

// @desc    Get all available skills in platform
// @route   GET /api/skills
const getSkills = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }
    if (search && search.trim()) {
      query.name = new RegExp(search.trim(), 'i');
    }

    const skills = await Skill.find(query).sort({ popularityCount: -1, name: 1 });

    return res.status(200).json({
      success: true,
      count: skills.length,
      skills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new skill to directory (Admin or Student suggested)
// @route   POST /api/skills
const addSkill = async (req, res, next) => {
  try {
    const { name, category, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Skill name is required' });
    }

    const existingSkill = await Skill.findOne({
      name: new RegExp(`^${name.trim()}$`, 'i'),
    });

    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: 'This skill already exists in the campus directory.',
      });
    }

    const skill = await Skill.create({
      name: name.trim(),
      category: category || 'Other',
      description: description || '',
    });

    return res.status(201).json({
      success: true,
      message: 'Skill added successfully!',
      skill,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's skills
// @route   GET /api/users/skills
const getMySkills = async (req, res, next) => {
  try {
    const studentSkills = await StudentSkill.find({ student: req.user._id }).populate('skill');

    return res.status(200).json({
      success: true,
      skillsTeach: studentSkills.filter((s) => s.type === 'teach'),
      skillsLearn: studentSkills.filter((s) => s.type === 'learn'),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add skill to teach or learn
// @route   POST /api/users/skills
const addStudentSkill = async (req, res, next) => {
  try {
    const { skillId, skillName, category, type, level, notes } = req.body;

    if (!type || !['teach', 'learn'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Skill type must be either 'teach' or 'learn'",
      });
    }

    let targetSkillId = skillId;

    // If skill does not exist by ID, create it dynamically
    if (!targetSkillId && skillName) {
      let skill = await Skill.findOne({
        name: new RegExp(`^${skillName.trim()}$`, 'i'),
      });
      if (!skill) {
        skill = await Skill.create({
          name: skillName.trim(),
          category: category || 'Other',
        });
      }
      targetSkillId = skill._id;
    }

    if (!targetSkillId) {
      return res.status(400).json({ success: false, message: 'Skill identification is required' });
    }

    // Check for existing duplicate
    const existing = await StudentSkill.findOne({
      student: req.user._id,
      skill: targetSkillId,
      type,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `You have already added this skill to your "${type}" list.`,
      });
    }

    const studentSkill = await StudentSkill.create({
      student: req.user._id,
      skill: targetSkillId,
      type,
      level: level || 'Intermediate',
      notes: notes || '',
    });

    // Increment skill popularity
    await Skill.findByIdAndUpdate(targetSkillId, { $inc: { popularityCount: 1 } });

    // Check if badges earned (e.g. Knowledge Sharer for registering 3+ teach skills)
    await checkAndAwardBadges(req.user._id);

    const populated = await StudentSkill.findById(studentSkill._id).populate('skill');

    const io = req.app.get('io');
    if (io) {
      io.emit('stats:updated');
      io.emit('user:skillsUpdated', { userId: req.user._id });
    }

    return res.status(201).json({
      success: true,
      message: `Skill added to "${type}" list successfully!`,
      studentSkill: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove skill from teach or learn
// @route   DELETE /api/users/skills/:id
const deleteStudentSkill = async (req, res, next) => {
  try {
    const studentSkill = await StudentSkill.findOneAndDelete({
      _id: req.params.id,
      student: req.user._id,
    });

    if (!studentSkill) {
      return res.status(404).json({ success: false, message: 'Skill entry not found' });
    }

    // Decrement popularity
    await Skill.findByIdAndUpdate(studentSkill.skill, { $inc: { popularityCount: -1 } });

    const io = req.app.get('io');
    if (io) {
      io.emit('stats:updated');
      io.emit('user:skillsUpdated', { userId: req.user._id });
    }

    return res.status(200).json({
      success: true,
      message: 'Skill removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all distinct skill categories from MongoDB
// @route   GET /api/skills/categories
const getCategories = async (req, res, next) => {
  try {
    const rawCategories = await Skill.distinct('category');
    const categories = rawCategories.filter(Boolean);
    return res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSkills,
  addSkill,
  getMySkills,
  addStudentSkill,
  deleteStudentSkill,
  getCategories,
};

