const express = require('express');
const router = express.Router();
const {
  healthCheck,
  getAvailableDomains,
  generateEmail,
  getToken,
  getInboxMessages,
  getSingleMessage
} = require('../controllers/mailController');

/**
 * Mail routes for Nova Mail backend
 * All routes are prefixed with /api
 */

// Health check route
router.get('/health', healthCheck);

// Get available domains from Mail.tm
router.get('/domains', getAvailableDomains);

// Generate a new temporary email account
router.post('/generate-email', generateEmail);

// Get authentication token for an account
router.post('/token', getToken);

// Get inbox messages for an account
router.post('/messages', getInboxMessages);

// Get a single message by ID
router.post('/message', getSingleMessage);

module.exports = router;
