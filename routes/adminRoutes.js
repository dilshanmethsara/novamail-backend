const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/analytics');
const {
  getAnalytics,
  getIPDetails,
  getAllIPs,
  getDashboardData
} = require('../controllers/adminController');

/**
 * Admin dashboard routes
 * All routes require admin authentication
 */

// Get comprehensive analytics data
router.get('/analytics', adminAuth, getAnalytics);

// Get real-time dashboard data
router.get('/dashboard', adminAuth, getDashboardData);

// Get all unique IPs with basic info
router.get('/ips', adminAuth, getAllIPs);

// Get detailed information for a specific IP
router.get('/ips/:ip', adminAuth, getIPDetails);

module.exports = router;
