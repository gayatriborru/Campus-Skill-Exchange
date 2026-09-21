import api from './api';

export const contactService = {
  submitContactMessage: async (formData) => {
    const res = await api.post('/contact', formData);
    return res.data;
  },
};
