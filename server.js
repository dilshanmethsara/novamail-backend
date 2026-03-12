require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mailRoutes = require('./routes/mailRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { analyticsMiddleware } = require('./middleware/analytics');

// Initialize Express app
const app = express();

// Middleware setup
const corsOptions = {
  origin: [
    'http://localhost:8080',
    'https://novamailfront.vercel.app',
    'https://novamailfront-1b1n2nl8w-alans-projects-97b09bca.vercel.app',
    'https://nova-mail-backend.up.railway.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Key']
};

app.use(cors(corsOptions)); // Enable CORS with specific options
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Analytics middleware - track all requests
app.use(analyticsMiddleware);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.analytics?.ip || 'unknown'}`);
  next();
});

// API Routes
app.use('/api', mailRoutes);
app.use('/admin', adminRoutes);

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `The route ${req.method} ${req.originalUrl} does not exist`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'Something went wrong on the server'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    Nova Mail Backend Started                 ║
╠══════════════════════════════════════════════════════════════╣
║ Status: ${NODE_ENV.toUpperCase()}                                         ║
║ Port: ${PORT}                                                    ║
║ Time: ${new Date().toLocaleString()}                            ║
╚══════════════════════════════════════════════════════════════╝
`);
  console.log('Available endpoints:');
  console.log('  GET  /api/health          - Health check');
  console.log('  GET  /api/domains         - Get available domains');
  console.log('  POST /api/generate-email   - Generate temporary email');
  console.log('  POST /api/token           - Get auth token');
  console.log('  POST /api/messages        - Get inbox messages');
  console.log('  POST /api/message         - Get single message');
  console.log('');
  console.log('Admin endpoints (require admin key):');
  console.log('  GET  /admin/dashboard     - Real-time dashboard data');
  console.log('  GET  /admin/analytics     - Comprehensive analytics');
  console.log('  GET  /admin/ips           - All unique IPs');
  console.log('  GET  /admin/ips/:ip       - IP details');
  console.log('');
  console.log('Admin authentication: Use X-Admin-Key header or ?adminKey= query parameter');
  console.log('Default admin key: nova-mail-admin-2024');
});

module.exports = app;
