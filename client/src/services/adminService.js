import api from './api';

export const adminService = {
  getDashboardStats: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data.stats;
  },

  getAnalytics: async () => {
    const res = await api.get('/admin/analytics');
    return res.data.analytics;
  },

  getStudents: async (params = {}) => {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  toggleStudentSuspension: async (id) => {
    const res = await api.put(`/admin/users/${id}/status`);
    return res.data;
  },

  getReports: async () => {
    const res = await api.get('/admin/reports');
    return res.data.reports;
  },

  updateReportStatus: async (id, data) => {
    const res = await api.put(`/admin/reports/${id}`, data);
    return res.data;
  },
};
