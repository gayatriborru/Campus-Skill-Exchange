const path = require('path');
const dotenv = require('dotenv');

// Load environment variables for local development before any other modules load
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config(); // Fallback to current working directory

const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const fs = require('fs');

const { connectDB, getDbDiagnostics } = require('./config/db');
const { verifyDbConnection } = require('./middleware/dbCheckMiddleware');
const { initializeSocket } = require('./socket/socketHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const skillRoutes = require('./routes/skillRoutes');
const matchRoutes = require('./routes/matchRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const messageRoutes = require('./routes/messageRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const badgeRoutes = require('./routes/badgeRoutes');
const contactRoutes = require('./routes/contactRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const server = http.createServer(app);

// CORS configuration (supports Localhost, Vercel, and Render deployments)
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server, curl, mobile, and health check requests without origin
    if (!origin) return callback(null, true);

    const isExplicitlyAllowed = allowedOrigins.some(
      (allowed) => allowed && origin.toLowerCase() === allowed.toLowerCase()
    );
    if (isExplicitlyAllowed) return callback(null, true);

    try {
      const url = new URL(origin);
      if (
        url.hostname.endsWith('.vercel.app') ||
        url.hostname.endsWith('.onrender.com') ||
        url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1'
      ) {
        return callback(null, true);
      }
    } catch {
      // Ignore URL parsing errors
    }

    // Permissive fallback so legitimate client deployments are not blocked by CORS
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Initialize Socket.IO with matching CORS (supporting Vercel and localhost)
const io = new Server(server, {
  cors: corsOptions,
});

initializeSocket(io);

// Make socket.io instance accessible in Express routes
app.set('io', io);

// Health Check Endpoint (always accessible even when DB is connecting/disconnected)
app.get('/api/health', (req, res) => {
  const dbDiag = getDbDiagnostics();

  res.status(200).json({
    status: 'online',
    platform: 'Campus Skill Exchange API',
    database: dbDiag.status,
    mongoReadyState: dbDiag.readyState,
    dbConnected: dbDiag.connected,
    hasMongoUri: dbDiag.hasMongoUri,
    uriSource: dbDiag.uriSource,
    maskedUri: dbDiag.maskedUri,
    lastDbError: dbDiag.lastDbError,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// Verify MongoDB connection before executing any API queries
app.use('/api', verifyDbConnection);

// Mount REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/contact', contactRoutes);

// Optional: Serve static React build in production (single-service deployment)
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Global Error Handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server after attempting MongoDB connection
const startServer = async () => {
  console.log('\n================================================================');
  console.log('[Server Startup] Initializing Campus Skill Exchange Backend...');
  console.log(`[Server Startup] Node Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('================================================================');

  try {
    await connectDB();
  } catch (err) {
    console.error('[Server Startup] Initial database connection attempt caught:', err.message);
  }

  server.listen(PORT, () => {
    const isConnected = mongoose.connection.readyState === 1;
    console.log('\n================================================================');
    console.log(`[Server] Campus Skill Exchange API listening on port ${PORT}`);
    console.log(`[Server] Health Check URL: http://localhost:${PORT}/api/health`);
    console.log(`[Server] MongoDB Status:  ${isConnected ? 'CONNECTED' : 'DISCONNECTED'}`);
    if (!isConnected) {
      console.warn('[Server] Tip: Set MONGODB_URI in Render Environment Variables and whitelist 0.0.0.0/0 in Atlas.');
    }
    console.log('================================================================\n');
  });
};

if (require.main === module) {
  startServer();
}

module.exports = { app, server, startServer };
