import api from './api';

export const authService = {
  register: async (data) => {
    const res = await api.post('/auth/register', data);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    if (res.data.user) {
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    if (res.data.user) {
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get('/auth/profile');
    if (res.data?.user) {
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data.user;
  },

  updateProfile: async (data) => {
    const res = await api.put('/auth/profile', data);
    if (res.data?.user) {
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getStoredUser: () => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },
};

