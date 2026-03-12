const {
  getDomains,
  createAccount,
  getAuthToken,
  getMessages,
  getMessageById,
  generateRandomString
} = require('../utils/mailtmAPI');

/**
 * Controller functions for handling email-related requests
 * Each function includes proper error handling and HTTP status codes
 */

/**
 * Health check endpoint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const healthCheck = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Nova Mail Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
};

/**
 * Get available domains from Mail.tm
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAvailableDomains = async (req, res) => {
  try {
    const result = await getDomains();
    
    if (result.success) {
      res.status(result.status).json({
        success: true,
        data: result.data,
        message: 'Domains retrieved successfully'
      });
    } else {
      res.status(result.status).json({
        success: false,
        error: result.error,
        message: 'Failed to retrieve domains'
      });
    }
  } catch (error) {
    console.error('Error in getAvailableDomains:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve domains'
    });
  }
};

/**
 * Generate a new temporary email account
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateEmail = async (req, res) => {
  try {
    // Get available domains first
    const domainsResult = await getDomains();
    
    if (!domainsResult.success) {
      return res.status(domainsResult.status).json({
        success: false,
        error: domainsResult.error,
        message: 'Failed to get available domains'
      });
    }

    // Extract domains from the response
    const domains = domainsResult.data['hydra:member'];
    
    if (!domains || domains.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No available domains',
        message: 'No domains are currently available'
      });
    }

    // Choose a random domain
    const randomDomain = domains[Math.floor(Math.random() * domains.length)].domain;
    
    // Generate random email and password
    const randomUsername = generateRandomString(10);
    const email = `${randomUsername}@${randomDomain}`;
    const password = generateRandomString(12);

    // Create the account
    const accountResult = await createAccount(email, password);
    
    if (accountResult.success) {
      res.status(201).json({
        success: true,
        data: {
          email: email,
          password: password,
          accountId: accountResult.data.id
        },
        message: 'Temporary email account created successfully'
      });
    } else {
      res.status(accountResult.status).json({
        success: false,
        error: accountResult.error,
        message: 'Failed to create temporary email account'
      });
    }
  } catch (error) {
    console.error('Error in generateEmail:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to generate temporary email'
    });
  }
};

/**
 * Get authentication token for an account
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getToken = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Email and password are required'
      });
    }

    const result = await getAuthToken(email, password);
    
    if (result.success) {
      res.status(result.status).json({
        success: true,
        data: {
          token: result.data.token,
          expiresAt: result.data.expiresAt
        },
        message: 'Authentication token retrieved successfully'
      });
    } else {
      res.status(result.status).json({
        success: false,
        error: result.error,
        message: 'Failed to authenticate'
      });
    }
  } catch (error) {
    console.error('Error in getToken:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to get authentication token'
    });
  }
};

/**
 * Get inbox messages for an account
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getInboxMessages = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Email and password are required'
      });
    }

    // First get authentication token
    const tokenResult = await getAuthToken(email, password);
    
    if (!tokenResult.success) {
      return res.status(tokenResult.status).json({
        success: false,
        error: tokenResult.error,
        message: 'Failed to authenticate'
      });
    }

    // Get messages using the token
    const messagesResult = await getMessages(tokenResult.data.token);
    
    if (messagesResult.success) {
      res.status(messagesResult.status).json({
        success: true,
        data: messagesResult.data,
        message: 'Inbox messages retrieved successfully'
      });
    } else {
      res.status(messagesResult.status).json({
        success: false,
        error: messagesResult.error,
        message: 'Failed to retrieve inbox messages'
      });
    }
  } catch (error) {
    console.error('Error in getInboxMessages:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve inbox messages'
    });
  }
};

/**
 * Get a single message by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSingleMessage = async (req, res) => {
  try {
    const { email, password, messageId } = req.body;
    
    // Validate input
    if (!email || !password || !messageId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Email, password, and messageId are required'
      });
    }

    // First get authentication token
    const tokenResult = await getAuthToken(email, password);
    
    if (!tokenResult.success) {
      return res.status(tokenResult.status).json({
        success: false,
        error: tokenResult.error,
        message: 'Failed to authenticate'
      });
    }

    // Get the message using the token
    const messageResult = await getMessageById(messageId, tokenResult.data.token);
    
    if (messageResult.success) {
      res.status(messageResult.status).json({
        success: true,
        data: messageResult.data,
        message: 'Message retrieved successfully'
      });
    } else {
      res.status(messageResult.status).json({
        success: false,
        error: messageResult.error,
        message: 'Failed to retrieve message'
      });
    }
  } catch (error) {
    console.error('Error in getSingleMessage:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve message'
    });
  }
};

module.exports = {
  healthCheck,
  getAvailableDomains,
  generateEmail,
  getToken,
  getInboxMessages,
  getSingleMessage
};
