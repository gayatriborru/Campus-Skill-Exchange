import api from './api';

export const skillService = {
  getSkills: async (params = {}) => {
    const res = await api.get('/skills', { params });
    return res.data.skills;
  },

  addSkill: async (skillData) => {
    const res = await api.post('/skills', skillData);
    return res.data.skill;
  },

  getCategories: async () => {
    const res = await api.get('/skills/categories');
    return res.data.categories;
  },
};

