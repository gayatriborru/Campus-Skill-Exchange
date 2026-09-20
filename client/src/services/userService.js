import api from './api';

export const userService = {
  getUsers: async (params = {}) => {
    const res = await api.get('/users', { params });
    return res.data;
  },

  getUserById: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res.data.student || res.data.user;
  },

  getMySkills: async () => {
    const res = await api.get('/users/skills');
    return res.data;
  },

  addStudentSkill: async (skillData) => {
    const res = await api.post('/users/skills', skillData);
    return res.data;
  },

  deleteStudentSkill: async (id) => {
    const res = await api.delete(`/users/skills/${id}`);
    return res.data;
  },
};
