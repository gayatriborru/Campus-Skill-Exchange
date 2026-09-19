import api from './api';

export const analyticsService = {
  getPlatformStats: async () => {
    const res = await api.get('/analytics/platform-stats');
    return res.data.stats;
  },

  getMyAnalytics: async () => {
    const res = await api.get('/analytics/me');
    return res.data.data;
  },
};
