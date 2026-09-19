import api from './api';

export const badgeService = {
  getAllBadges: async () => {
    const res = await api.get('/badges');
    return res.data.badges;
  },
};
