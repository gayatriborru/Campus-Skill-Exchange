import api from './api';

export const authService = {
  register: async (data) => {
    const res = await api.post('/auth/register', data);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    return res.data;
  },

  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get('/auth/profile');
    return res.data.user;
  },

  updateProfile: async (data) => {
    const res = await api.put('/auth/profile', data);
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};
