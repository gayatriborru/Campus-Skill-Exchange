import api from './api';

export const sessionService = {
  createSession: async (sessionData) => {
    const res = await api.post('/sessions', sessionData);
    return res.data;
  },

  getSessions: async (params = {}) => {
    const res = await api.get('/sessions', { params });
    return res.data.sessions;
  },

  updateSession: async (id, updateData) => {
    const res = await api.put(`/sessions/${id}`, updateData);
    return res.data.session;
  },
};
