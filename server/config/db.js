const mongoose = require('mongoose');

let lastDbError = null;

/**
 * Clean URI: strips accidental surrounding quotes and whitespaces
 */
const cleanURI = (raw) => {
  if (!raw || typeof raw !== 'string') return '';
  return raw.trim().replace(/^['"]+|['"]+$/g, '');
};

/**
 * Mask sensitive credentials in MongoDB connection string for safe logging.
 */
const maskConnectionString = (uri) => {
  if (!uri) return 'NOT_CONFIGURED';
  try {
    return uri.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@');
  } catch {
    return '***';
  }
};

/**
 * Resolve MongoDB URI in order of priority:
 * 1. process.env.MONGODB_URI (standard / required on Render)
 * 2. process.env.MONGO_URI (common alias)
 * 3. process.env.MONGODB_URL (common alias)
 * 4. Local development fallback (only outside production)
 */
const getMongoURI = () => {
  const primary = cleanURI(process.env.MONGODB_URI);
  if (primary) return primary;

  const alias1 = cleanURI(process.env.MONGO_URI);
  if (alias1) return alias1;

  const alias2 = cleanURI(process.env.MONGODB_URL);
  if (alias2) return alias2;

  if (process.env.NODE_ENV === 'production') {
    return '';
  }

  return 'mongodb://127.0.0.1:27017/campus_skill_exchange';
};

// Register persistent Mongoose connection event handlers once
let listenersRegistered = false;
let reconnectTimer = null;

const registerConnectionListeners = () => {
  if (listenersRegistered) return;
  listenersRegistered = true;

  mongoose.connection.on('connected', () => {
    lastDbError = null;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    console.log('[MongoDB Event] Mongoose connection state: CONNECTED (readyState: 1)');
  });

  mongoose.connection.on('error', (err) => {
    lastDbError = {
      name: err.name,
      message: err.message,
      timestamp: new Date().toISOString(),
    };
    console.error(`[MongoDB Event] Connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB Event] Mongoose connection state: DISCONNECTED (readyState: 0)');
    // Auto-reconnect retry with 5s backoff to heal transient network disconnects on Render
    if (!reconnectTimer && getMongoURI()) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        if (mongoose.connection.readyState === 0) {
          console.log('[MongoDB Event] Triggering automatic reconnection...');
          connectDB().catch(() => {});
        }
      }, 5000);
    }
  });

  mongoose.connection.on('reconnected', () => {
    lastDbError = null;
    console.log('[MongoDB Event] Mongoose connection state: RECONNECTED');
  });
};

/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
  registerConnectionListeners();

  const uri = getMongoURI();

  if (!uri) {
    lastDbError = {
      name: 'ConfigurationError',
      message: 'MONGODB_URI is not configured in environment variables.',
      timestamp: new Date().toISOString(),
    };
    console.error('\n================================================================');
    console.error('[MongoDB ERROR] MONGODB_URI is not configured in environment!');
    console.error('In production (Render), set MONGODB_URI in Render Environment Variables:');
    console.error('  Key:   MONGODB_URI');
    console.error('  Value: mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority');
    console.error('Ensure IP 0.0.0.0/0 is allowed in MongoDB Atlas Network Access.');
    console.error('================================================================\n');
    return null;
  }

  // Check for common typo: user forgot to replace template placeholders
  if (
    uri.includes('<username>') ||
    uri.includes('<password>') ||
    uri.includes('<cluster>') ||
    uri.includes('<dbname>')
  ) {
    lastDbError = {
      name: 'ConfigurationError',
      message: 'MONGODB_URI contains unreplaced template placeholders (<username> or <password>).',
      timestamp: new Date().toISOString(),
    };
    console.error('\n================================================================');
    console.error('[MongoDB ERROR] MONGODB_URI contains literal template brackets (<username>/<password>)!');
    console.error('Please replace <username> and <password> with your actual MongoDB Atlas database user credentials.');
    console.error('================================================================\n');
    return null;
  }

  console.log(`[MongoDB] Initiating connection to: ${maskConnectionString(uri)}`);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      autoIndex: process.env.NODE_ENV !== 'production',
    });

    lastDbError = null;
    console.log(`[MongoDB] Connected successfully!`);
    console.log(`[MongoDB] Cluster Host: ${conn.connection.host}`);
    console.log(`[MongoDB] Database Name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    lastDbError = {
      name: error.name,
      message: error.message,
      timestamp: new Date().toISOString(),
    };
    console.error('\n================================================================');
    console.error(`[MongoDB Connection Error] ${error.name}: ${error.message}`);
    console.error('Troubleshooting Checklist:');
    console.error(' 1. MongoDB Atlas Network Access: Ensure IP 0.0.0.0/0 (Allow Access from Anywhere) is active.');
    console.error(' 2. Render Environment Variables: Ensure MONGODB_URI is set correctly in Render Dashboard.');
    console.error(' 3. Atlas Database User: Ensure the database user has "Read and write to any database" privileges.');
    console.error(' 4. Special Characters: If the password contains special characters (@, #, %, etc.), ensure they are URL-encoded.');
    console.error('================================================================\n');
    return null;
  }
};

/**
 * Check if MongoDB connection is currently established
 */
const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Detailed diagnostics for /api/health
 */
const getDbDiagnostics = () => {
  const uri = getMongoURI();
  let uriSource = 'none';
  if (process.env.MONGODB_URI) uriSource = 'MONGODB_URI';
  else if (process.env.MONGO_URI) uriSource = 'MONGO_URI';
  else if (process.env.MONGODB_URL) uriSource = 'MONGODB_URL';
  else if (process.env.NODE_ENV !== 'production') uriSource = 'local_fallback';

  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    readyState: mongoose.connection.readyState,
    status: stateMap[mongoose.connection.readyState] || 'unknown',
    connected: mongoose.connection.readyState === 1,
    hasMongoUri: Boolean(process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB_URL),
    uriSource,
    maskedUri: maskConnectionString(uri),
    lastDbError,
    host: mongoose.connection.host || null,
    dbName: mongoose.connection.name || null,
  };
};

module.exports = {
  connectDB,
  isDbConnected,
  getMongoURI,
  maskConnectionString,
  getDbDiagnostics,
};
