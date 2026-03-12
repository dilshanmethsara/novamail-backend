const axios = require('axios');

// Mail.tm API base URL
const API_BASE_URL = process.env.MAILTM_API_BASE_URL || 'https://api.mail.tm';

/**
 * Utility functions to interact with Mail.tm API
 * All functions include error handling and return consistent responses
 */

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

/**
 * Get available domains from Mail.tm
 * @returns {Promise<Object>} - Response with domains or error
 */
const getDomains = async () => {
  try {
    const response = await apiClient.get('/domains');
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status || 500
    };
  }
};

/**
 * Create a new account with Mail.tm
 * @param {string} email - Email address
 * @param {string} password - Password for the account
 * @returns {Promise<Object>} - Response with account data or error
 */
const createAccount = async (email, password) => {
  try {
    const response = await apiClient.post('/accounts', {
      address: email,
      password: password
    });
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status || 500
    };
  }
};

/**
 * Get authentication token for an account
 * @param {string} email - Email address
 * @param {string} password - Password for the account
 * @returns {Promise<Object>} - Response with token or error
 */
const getAuthToken = async (email, password) => {
  try {
    const response = await apiClient.post('/token', {
      address: email,
      password: password
    });
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status || 500
    };
  }
};

/**
 * Get inbox messages for an authenticated account
 * @param {string} token - JWT token
 * @returns {Promise<Object>} - Response with messages or error
 */
const getMessages = async (token) => {
  try {
    const response = await apiClient.get('/messages', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status || 500
    };
  }
};

/**
 * Get a single message by ID
 * @param {string} messageId - ID of the message
 * @param {string} token - JWT token
 * @returns {Promise<Object>} - Response with message or error
 */
const getMessageById = async (messageId, token) => {
  try {
    const response = await apiClient.get(`/messages/${messageId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status || 500
    };
  }
};

/**
 * Generate a random string for email and password
 * @param {number} length - Length of the string
 * @returns {string} - Random string
 */
const generateRandomString = (length = 8) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

module.exports = {
  getDomains,
  createAccount,
  getAuthToken,
  getMessages,
  getMessageById,
  generateRandomString
};
