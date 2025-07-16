# DihhJ Backend

A Node.js backend for DihhJ Bitchers - A tea blog platform where users can share tea posts, vote, and comment.

## 🚀 Features

- **User Authentication**: Registration and login system
- **Tea Posts**: Create, read, update, and delete tea posts
- **Voting System**: Upvote/downvote tea posts and comments
- **Comments (Bitchin)**: Comment on tea posts with voting
- **Tags & Batches**: Organize posts with tags and batch numbers
- **MongoDB Integration**: Persistent data storage
- **CORS Enabled**: Ready for frontend integration
- **Rate Limiting**: Protection against spam
- **Security**: Helmet, bcrypt password hashing

## 📋 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/profile/:username` - Get user profile

### Tea Posts
- `GET /tea/list` - Get paginated tea posts with filtering
- `POST /tea/create?username={username}` - Create new tea post
- `GET /tea/:id` - Get specific tea post
- `POST /tea/:id/vote?username={username}` - Vote on tea post
- `GET /tea/:id/user-vote?username={username}` - Get user's vote status
- `GET /tea/tags` - Get available tags
- `GET /tea/batches` - Get batch statistics

### Comments (Bitchin)
- `GET /bitch/:teaId/list` - Get comments for tea post
- `POST /bitch/:teaId/create?username={username}` - Create comment
- `PUT /bitch/comment/:commentId?username={username}` - Update comment
- `DELETE /bitch/comment/:commentId?username={username}` - Delete comment
- `POST /bitch/comment/:commentId/vote?username={username}&vote_type={type}` - Vote on comment
- `GET /bitch/comment/:commentId/user-vote?username={username}` - Get user's comment vote
- `GET /bitch/user/:username` - Get user's comments

### Health & Info
- `GET /` - API information
- `GET /health` - Health check

## 🛠️ Setup

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- npm or yarn

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd "DihhJ Backend"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your MongoDB password:
   ```env
   MONGODB_URL=mongodb+srv://chulbuleMishraJi:<db_password>@chulbulemishraji.8mcwh5g.mongodb.net/?retryWrites=true&w=majority&appName=chulbuleMishraJi
   DB_PASSWORD=your_actual_mongodb_password
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

5. **Test the API**
   ```bash
   npm test
   ```

## 🌐 Deployment

### Render Deployment

1. **Connect your repository** to Render
2. **Set environment variables** in Render dashboard:
   - `NODE_ENV=production`
   - `MONGODB_URL=your_mongodb_connection_string`
   - `DB_PASSWORD=your_mongodb_password`
   - `DATABASE_NAME=dihhj_backend`
   - `CORS_ORIGINS=https://dihhjbitchin-ido5.onrender.com`

3. **Deploy** - Render will automatically build and deploy

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB connection string | Required |
| `DB_PASSWORD` | MongoDB password | Required |
| `DATABASE_NAME` | Database name | `dihhj_backend` |
| `PORT` | Server port | `8000` |
| `NODE_ENV` | Environment | `development` |
| `CORS_ORIGINS` | Allowed origins (comma-separated) | localhost + frontend URL |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` |

## 🗄️ Database Schema

### Collections

#### Users
```javascript
{
  _id: ObjectId,
  username: String (lowercase, unique),
  originalUsername: String (display name),
  password: String (hashed),
  year: Number,
  created_at: Date,
  updated_at: Date,
  last_login: Date
}
```

#### Teas
```javascript
{
  _id: ObjectId,
  title: String,
  content: String,
  tag: String,
  batch: String,
  author: String,
  upvotes: Number,
  downvotes: Number,
  score: Number,
  created_at: Date,
  updated_at: Date
}
```

#### Votes
```javascript
{
  _id: ObjectId,
  user_id: String,
  tea_id: String,
  vote_type: String ('upvote' | 'downvote'),
  created_at: Date,
  updated_at: Date
}
```

#### Comments
```javascript
{
  _id: ObjectId,
  content: String,
  author: String,
  tea_id: String,
  upvotes: Number,
  downvotes: Number,
  score: Number,
  created_at: Date,
  updated_at: Date
}
```

#### Comment Votes
```javascript
{
  _id: ObjectId,
  user_id: String,
  comment_id: String,
  vote_type: String ('upvote' | 'downvote'),
  created_at: Date,
  updated_at: Date
}
```

## 🔧 Development

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run API tests

### Project Structure
```
DihhJ Backend/
├── config/
│   └── database.js      # MongoDB connection
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── tea.js           # Tea post routes
│   └── bitch.js         # Comment routes
├── server.js            # Main server file
├── test.js              # API test suite
├── package.json         # Dependencies
├── .env                 # Environment variables
└── README.md           # This file
```

## 🎯 Frontend Integration

This backend is designed to work with the DihhJ frontend at:
- **Development**: `http://localhost:3000`
- **Production**: `https://dihhjbitchin-ido5.onrender.com`

The API endpoints match exactly what the frontend expects, ensuring seamless integration.

## 🔒 Security Features

- **CORS Protection**: Configured for specific origins
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet**: Security headers
- **Password Hashing**: bcrypt with 12 rounds
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error responses

## 📝 License

MIT License - Feel free to use this project for your own purposes.
