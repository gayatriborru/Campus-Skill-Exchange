import api from './api';

export const reportService = {
  createReport: async (reportData) => {
    const res = await api.post('/reports', reportData);
    return res.data;
  },

  toggleBlockUser: async (targetUserId) => {
    const res = await api.post('/reports/block', { targetUserId });
    return res.data;
  },
};
