const notFound = (req, res, next) => {
  const error = new Error(`Route Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found: Invalid ID format';
  }

  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists.`;
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors || {})
      .map((val) => val.message)
      .join(', ');
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired, please log in again.';
  }

  // Handle Mongoose / MongoDB connection errors
  const isDbConnectionError =
    (err.message && (
      err.message.includes('buffering timed out') ||
      err.message.includes('ECONNREFUSED') ||
      err.message.includes('server selection') ||
      err.message.includes('topology was destroyed')
    )) ||
    err.name === 'MongooseServerSelectionError' ||
    err.name === 'MongoServerSelectionError' ||
    err.name === 'MongoNetworkError';

  if (isDbConnectionError) {
    statusCode = 503;
    message =
      'Database is currently unreachable. Please ensure MONGODB_URI is configured in Render Environment Variables and IP 0.0.0.0/0 is allowed in MongoDB Atlas Network Access.';
    console.error(`[Database Error] ${req.method} ${req.originalUrl}:`, err.message);
  } else {
    console.error(`[API Error] ${req.method} ${req.originalUrl} (${statusCode}):`, message);
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
