import api from './api';

export const matchService = {
  getMatches: async (params = {}) => {
    const res = await api.get('/matches', { params });
    return res.data.matches;
  },

  getMatchWithStudent: async (studentId) => {
    const res = await api.get(`/matches/${studentId}`);
    return res.data.match;
  },
};
