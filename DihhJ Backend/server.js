const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const teaRoutes = require('./routes/tea');
const bitchRoutes = require('./routes/bitch');
const { connectDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 8000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://dihhjbitchin-ido5.onrender.com',
    'https://your-backend-app.onrender.com'
  ],
  credentials: false, // Set to false to avoid CORS credential issues
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`🔥 ${new Date().toISOString()} - ${req.method} ${req.url} from ${req.ip}`);
  console.log('Headers:', req.headers);
  next();
});

// Disable ETag caching for development
app.set('etag', false);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
connectDB();

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to DihhJ Backend API!',
    status: 'healthy',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      register: '/auth/register',
      login: '/auth/login',
      tea: '/tea',
      docs: '/docs'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'API is running',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/tea', teaRoutes);
app.use('/bitch', bitchRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      'GET /',
      'GET /health',
      'POST /auth/register',
      'POST /auth/login',
      'GET /tea/list',
      'POST /tea/create',
      'GET /tea/tags',
      'GET /tea/batches',
      'GET /tea/user/:username',
      'GET /tea/:id',
      'PUT /tea/:id',
      'DELETE /tea/:id',
      'POST /tea/:id/vote',
      'GET /tea/:id/user-vote'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      error: 'Duplicate entry',
      message: 'This username is already taken'
    });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      message: err.message
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 DihhJ Backend running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 CORS enabled for: ${corsOptions.origin.join(', ')}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
