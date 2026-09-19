import api from './api';

export const ratingService = {
  createRating: async (data) => {
    const res = await api.post('/ratings', data);
    return res.data;
  },

  getStudentRatings: async (studentId) => {
    const res = await api.get(`/ratings/${studentId}`);
    return res.data.ratings;
  },
};
