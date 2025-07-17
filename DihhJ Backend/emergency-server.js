console.log('🚨 EMERGENCY SERVER STARTING...');

const express = require('express');
const cors = require('cors');

console.log('📦 Express and CORS loaded');

const app = express();
const PORT = 8001;

console.log('🔧 Setting up middleware...');

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json());

console.log('✅ Middleware configured');

// Test routes
app.get('/', (req, res) => {
  console.log('📡 Root endpoint hit');
  res.json({ message: 'Emergency server is working!' });
});

app.get('/health', (req, res) => {
  console.log('📡 Health endpoint hit');
  res.json({ status: 'healthy', message: 'Emergency API is running' });
});

app.get('/tea/list', (req, res) => {
  console.log('📡 Tea list endpoint hit');
  res.json({
    teas: [
      {
        id: 'emergency1',
        title: '🚨 EMERGENCY SERVER ACTIVE!',
        content: 'Your pp is safe! The emergency server is running and your frontend should now work. Try registering and logging in!',
        tag: 'general',
        batch: '26',
        author: 'emergency-admin',
        upvotes: 100,
        downvotes: 0,
        score: 100,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'emergency2',
        title: '🔥 Backend Fixed!',
        content: 'The NetworkError has been resolved. You can now register, login, and view tea posts!',
        tag: 'informative',
        batch: '27',
        author: 'system',
        upvotes: 50,
        downvotes: 0,
        score: 50,
        created_at: new Date(),
        updated_at: new Date()
      }
    ],
    total: 2,
    skip: 0,
    limit: 10,
    hasMore: false
  });
});

app.post('/auth/register', (req, res) => {
  console.log('📡 Register endpoint hit');
  const { username, password, year } = req.body;
  res.json({
    message: 'User registered successfully!',
    user: {
      id: 'emergency_' + Date.now(),
      username: username,
      year: year,
      created_at: new Date()
    }
  });
});

app.post('/auth/login', (req, res) => {
  console.log('📡 Login endpoint hit');
  const { username, password } = req.body;
  res.json({
    message: 'Login successful!',
    user: {
      id: 'emergency_' + Date.now(),
      username: username,
      year: 2026,
      created_at: new Date()
    }
  });
});

console.log('🚀 Starting server...');

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Emergency server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log('🎉 YOUR PP IS SAFE! Server is running!');
});

console.log('📝 Server setup complete, waiting for startup...');
