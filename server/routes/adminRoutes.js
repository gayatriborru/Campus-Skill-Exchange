const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAnalytics,
  getStudents,
  toggleStudentSuspension,
  getReports,
  updateReportStatus,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/users', getStudents);
router.put('/users/:id/status', toggleStudentSuspension);
router.get('/reports', getReports);
router.put('/reports/:id', updateReportStatus);

module.exports = router;
