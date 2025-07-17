const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8000;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json());

// Test routes
app.get('/', (req, res) => {
  res.json({ message: 'Test server is working!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', message: 'Test API is running' });
});

app.get('/tea/list', (req, res) => {
  res.json({
    teas: [
      {
        id: 'test1',
        title: '🔥 Test Tea Post - Connection Working!',
        content: 'This is a test tea post to verify connectivity.',
        tag: 'general',
        batch: '26',
        author: 'testuser',
        upvotes: 5,
        downvotes: 1,
        score: 4,
        created_at: new Date(),
        updated_at: new Date()
      }
    ],
    total: 1,
    skip: 0,
    limit: 10,
    hasMore: false
  });
});

app.post('/auth/register', (req, res) => {
  const { username, password, year } = req.body;
  res.json({
    message: 'User registered successfully!',
    user: {
      id: 'test123',
      username: username,
      year: year,
      created_at: new Date()
    }
  });
});

app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  res.json({
    message: 'Login successful!',
    user: {
      id: 'test123',
      username: username,
      year: 2026,
      created_at: new Date()
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
