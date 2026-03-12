const fs = require('fs').promises;
const path = require('path');

// Simple file-based analytics storage (for production, use a proper database)
const ANALYTICS_FILE = path.join(__dirname, '../data/analytics.json');
const GEOLOCATION_FILE = path.join(__dirname, '../data/geolocation.json');

/**
 * Analytics middleware to track user requests, IPs, and usage
 */
const analyticsMiddleware = async (req, res, next) => {
  try {
    const timestamp = new Date().toISOString();
    const ip = getClientIP(req);
    const userAgent = req.get('User-Agent') || '';
    const method = req.method;
    const endpoint = req.path;
    const referer = req.get('Referer') || '';

    // Get basic geolocation data (simplified)
    const geoData = await getGeolocationData(ip);

    // Create analytics entry
    const analyticsEntry = {
      timestamp,
      ip,
      userAgent,
      method,
      endpoint,
      referer,
      geolocation: geoData,
      sessionId: req.sessionID || generateSessionId(),
    };

    // Track specific events
    if (endpoint.includes('generate-email')) {
      analyticsEntry.event = 'email_generated';
    } else if (endpoint.includes('messages')) {
      analyticsEntry.event = 'messages_fetched';
    } else if (endpoint.includes('message')) {
      analyticsEntry.event = 'message_viewed';
    }

    // Store analytics data
    await storeAnalyticsData(analyticsEntry);

    // Add analytics info to request for other middleware
    req.analytics = analyticsEntry;

    next();
  } catch (error) {
    console.error('Analytics middleware error:', error);
    next(); // Continue even if analytics fails
  }
};

/**
 * Get client IP address from request
 */
const getClientIP = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0] : req.connection.remoteAddress;
  return ip || 'unknown';
};

/**
 * Generate a simple session ID
 */
const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Get geolocation data for an IP (simplified version)
 */
const getGeolocationData = async (ip) => {
  try {
    // Check if we have cached geolocation data
    const geoCache = await loadGeolocationCache();
    
    if (geoCache[ip]) {
      return geoCache[ip];
    }

    // For demo purposes, return basic info
    // In production, you'd use a service like ip-api.com, maxmind, etc.
    const geoData = {
      ip,
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      latitude: 0,
      longitude: 0,
      isp: 'Unknown',
    };

    // Cache the result
    geoCache[ip] = geoData;
    await saveGeolocationCache(geoCache);

    return geoData;
  } catch (error) {
    console.error('Geolocation error:', error);
    return {
      ip,
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      latitude: 0,
      longitude: 0,
      isp: 'Unknown',
    };
  }
};

/**
 * Store analytics data to file
 */
const storeAnalyticsData = async (entry) => {
  try {
    let analytics = await loadAnalyticsData();
    analytics.push(entry);
    
    // Keep only last 10000 entries to prevent file from growing too large
    if (analytics.length > 10000) {
      analytics = analytics.slice(-10000);
    }
    
    await fs.writeFile(ANALYTICS_FILE, JSON.stringify(analytics, null, 2));
  } catch (error) {
    console.error('Error storing analytics:', error);
  }
};

/**
 * Load analytics data from file
 */
const loadAnalyticsData = async () => {
  try {
    const data = await fs.readFile(ANALYTICS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    return [];
  }
};

/**
 * Load geolocation cache
 */
const loadGeolocationCache = async () => {
  try {
    const data = await fs.readFile(GEOLOCATION_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
};

/**
 * Save geolocation cache
 */
const saveGeolocationCache = async (cache) => {
  try {
    await fs.writeFile(GEOLOCATION_FILE, JSON.stringify(cache, null, 2));
  } catch (error) {
    console.error('Error saving geolocation cache:', error);
  }
};

/**
 * Admin authentication middleware
 */
const adminAuth = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
  const expectedKey = process.env.ADMIN_KEY || 'nova-mail-admin-2024';

  if (adminKey !== expectedKey) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized access',
      message: 'Valid admin key required'
    });
  }

  next();
};

module.exports = {
  analyticsMiddleware,
  adminAuth,
  loadAnalyticsData,
  getClientIP,
  getGeolocationData,
};
