const { loadAnalyticsData, getGeolocationData } = require('../middleware/analytics');

/**
 * Admin dashboard controller functions
 */

/**
 * Get comprehensive analytics data
 */
const getAnalytics = async (req, res) => {
  try {
    const analytics = await loadAnalyticsData();
    
    // Calculate statistics
    const stats = calculateAnalyticsStats(analytics);
    
    // Get recent activity
    const recentActivity = analytics.slice(-50).reverse();
    
    // Get unique users and IPs
    const uniqueIPs = [...new Set(analytics.map(entry => entry.ip))];
    const uniqueSessions = [...new Set(analytics.map(entry => entry.sessionId))];
    
    // Get geographic distribution
    const geoDistribution = calculateGeoDistribution(analytics);
    
    // Get endpoint usage
    const endpointUsage = calculateEndpointUsage(analytics);
    
    // Get hourly usage pattern
    const hourlyUsage = calculateHourlyUsage(analytics);
    
    res.status(200).json({
      success: true,
      data: {
        stats,
        recentActivity,
        uniqueIPs: uniqueIPs.length,
        uniqueSessions: uniqueSessions.length,
        geoDistribution,
        endpointUsage,
        hourlyUsage,
        totalRequests: analytics.length
      },
      message: 'Analytics data retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve analytics',
      message: error.message
    });
  }
};

/**
 * Get detailed IP information
 */
const getIPDetails = async (req, res) => {
  try {
    const { ip } = req.params;
    const analytics = await loadAnalyticsData();
    
    // Filter entries for this IP
    const ipEntries = analytics.filter(entry => entry.ip === ip);
    
    if (ipEntries.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'IP not found',
        message: 'No activity found for this IP address'
      });
    }
    
    // Get detailed information
    const ipInfo = {
      ip,
      firstSeen: ipEntries[0].timestamp,
      lastSeen: ipEntries[ipEntries.length - 1].timestamp,
      totalRequests: ipEntries.length,
      endpoints: [...new Set(ipEntries.map(entry => entry.endpoint))],
      userAgents: [...new Set(ipEntries.map(entry => entry.userAgent))],
      events: ipEntries.map(entry => ({
        timestamp: entry.timestamp,
        endpoint: entry.endpoint,
        method: entry.method,
        event: entry.event || 'request',
        userAgent: entry.userAgent
      })),
      geolocation: ipEntries[0].geolocation || {}
    };
    
    res.status(200).json({
      success: true,
      data: ipInfo,
      message: 'IP details retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting IP details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve IP details',
      message: error.message
    });
  }
};

/**
 * Get all unique IPs with basic info
 */
const getAllIPs = async (req, res) => {
  try {
    const analytics = await loadAnalyticsData();
    const ipMap = new Map();
    
    // Aggregate data for each IP
    analytics.forEach(entry => {
      if (!ipMap.has(entry.ip)) {
        ipMap.set(entry.ip, {
          ip: entry.ip,
          firstSeen: entry.timestamp,
          lastSeen: entry.timestamp,
          requestCount: 1,
          endpoints: new Set([entry.endpoint]),
          events: new Set(),
          geolocation: entry.geolocation || {}
        });
      } else {
        const ipData = ipMap.get(entry.ip);
        ipData.lastSeen = entry.timestamp;
        ipData.requestCount++;
        ipData.endpoints.add(entry.endpoint);
        if (entry.event) ipData.events.add(entry.event);
      }
    });
    
    // Convert to array and sort by request count
    const ipList = Array.from(ipMap.values())
      .map(ip => ({
        ...ip,
        endpoints: Array.from(ip.endpoints),
        events: Array.from(ip.events)
      }))
      .sort((a, b) => b.requestCount - a.requestCount);
    
    res.status(200).json({
      success: true,
      data: {
        ips: ipList,
        total: ipList.length
      },
      message: 'IP list retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting IP list:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve IP list',
      message: error.message
    });
  }
};

/**
 * Get real-time dashboard data
 */
const getDashboardData = async (req, res) => {
  try {
    const analytics = await loadAnalyticsData();
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Filter last 24 hours
    const recentAnalytics = analytics.filter(entry => 
      new Date(entry.timestamp) > last24Hours
    );
    
    // Calculate real-time stats
    const stats = {
      totalRequests24h: recentAnalytics.length,
      uniqueIPs24h: [...new Set(recentAnalytics.map(entry => entry.ip))].length,
      emailsGenerated24h: recentAnalytics.filter(entry => entry.event === 'email_generated').length,
      messagesFetched24h: recentAnalytics.filter(entry => entry.event === 'messages_fetched').length,
      messagesViewed24h: recentAnalytics.filter(entry => entry.event === 'message_viewed').length,
      activeSessions: [...new Set(recentAnalytics.map(entry => entry.sessionId))].length,
      topCountries: calculateTopCountries(recentAnalytics),
      recentActivity: recentAnalytics.slice(-10).reverse()
    };
    
    res.status(200).json({
      success: true,
      data: stats,
      message: 'Dashboard data retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard data',
      message: error.message
    });
  }
};

/**
 * Calculate analytics statistics
 */
const calculateAnalyticsStats = (analytics) => {
  const totalRequests = analytics.length;
  const uniqueIPs = [...new Set(analytics.map(entry => entry.ip))];
  const uniqueSessions = [...new Set(analytics.map(entry => entry.sessionId))];
  
  const events = analytics.filter(entry => entry.event);
  const emailsGenerated = events.filter(entry => entry.event === 'email_generated').length;
  const messagesFetched = events.filter(entry => entry.event === 'messages_fetched').length;
  const messagesViewed = events.filter(entry => entry.event === 'message_viewed').length;
  
  // Calculate average requests per session
  const avgRequestsPerSession = uniqueSessions.length > 0 ? 
    (totalRequests / uniqueSessions.length).toFixed(2) : 0;
  
  return {
    totalRequests,
    uniqueIPs: uniqueIPs.length,
    uniqueSessions: uniqueSessions.length,
    emailsGenerated,
    messagesFetched,
    messagesViewed,
    avgRequestsPerSession: parseFloat(avgRequestsPerSession)
  };
};

/**
 * Calculate geographic distribution
 */
const calculateGeoDistribution = (analytics) => {
  const countryCount = {};
  
  analytics.forEach(entry => {
    const country = entry.geolocation?.country || 'Unknown';
    countryCount[country] = (countryCount[country] || 0) + 1;
  });
  
  return Object.entries(countryCount)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 countries
};

/**
 * Calculate endpoint usage
 */
const calculateEndpointUsage = (analytics) => {
  const endpointCount = {};
  
  analytics.forEach(entry => {
    const endpoint = entry.endpoint;
    endpointCount[endpoint] = (endpointCount[endpoint] || 0) + 1;
  });
  
  return Object.entries(endpointCount)
    .map(([endpoint, count]) => ({ endpoint, count }))
    .sort((a, b) => b.count - a.count);
};

/**
 * Calculate hourly usage pattern
 */
const calculateHourlyUsage = (analytics) => {
  const hourlyCount = new Array(24).fill(0);
  
  analytics.forEach(entry => {
    const hour = new Date(entry.timestamp).getHours();
    hourlyCount[hour]++;
  });
  
  return hourlyCount.map((count, hour) => ({
    hour: hour.toString().padStart(2, '0') + ':00',
    count
  }));
};

/**
 * Calculate top countries
 */
const calculateTopCountries = (analytics) => {
  const countryCount = {};
  
  analytics.forEach(entry => {
    const country = entry.geolocation?.country || 'Unknown';
    countryCount[country] = (countryCount[country] || 0) + 1;
  });
  
  return Object.entries(countryCount)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 countries
};

module.exports = {
  getAnalytics,
  getIPDetails,
  getAllIPs,
  getDashboardData
};
