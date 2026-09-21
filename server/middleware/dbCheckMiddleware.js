const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

/**
 * Middleware to verify MongoDB database connection readiness before executing API queries.
 * If database is disconnected or connecting, triggers connection attempt and waits before fast-failing.
 */
const verifyDbConnection = async (req, res, next) => {
  // Allow health checks through regardless of DB status so Render and monitors can diagnose the system
  if (req.path === '/health' || req.originalUrl === '/api/health') {
    return next();
  }

  // readyState values: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  // If disconnected, trigger connection attempt
  if (mongoose.connection.readyState === 0) {
    console.log(`[DB Check] Database disconnected. Attempting auto-reconnect for ${req.method} ${req.originalUrl}...`);
    connectDB().catch(() => {});
  }

  // If connecting or just started, wait up to 4000ms for connection to establish
  if (mongoose.connection.readyState === 2 || mongoose.connection.readyState === 0) {
    try {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          cleanup();
          reject(new Error('Connection wait timeout'));
        }, 4000);

        const onConnected = () => {
          clearTimeout(timer);
          cleanup();
          resolve();
        };

        const onError = (err) => {
          clearTimeout(timer);
          cleanup();
          reject(err);
        };

        const cleanup = () => {
          mongoose.connection.removeListener('connected', onConnected);
          mongoose.connection.removeListener('error', onError);
        };

        mongoose.connection.once('connected', onConnected);
        mongoose.connection.once('error', onError);
      });

      if (mongoose.connection.readyState === 1) {
        return next();
      }
    } catch {
      // Proceed to send 503 below
    }
  }

  console.error(`[DB Check] Rejected ${req.method} ${req.originalUrl} - Database is not connected (readyState: ${mongoose.connection.readyState})`);

  return res.status(503).json({
    success: false,
    message:
      'Database is currently unreachable. Please ensure MONGODB_URI is configured in Render Environment Variables and IP 0.0.0.0/0 is allowed in MongoDB Atlas Network Access.',
    dbConnected: false,
    readyState: mongoose.connection.readyState,
  });
};

module.exports = { verifyDbConnection };
