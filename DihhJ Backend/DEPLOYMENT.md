# DihhJ Backend Deployment Guide

## 🚀 Quick Deployment to Render

### Step 1: Prepare Repository
1. **Commit all changes** to your repository:
   ```bash
   git add .
   git commit -m "Complete Node.js backend rewrite"
   git push origin main
   ```

### Step 2: Deploy to Render
1. **Go to Render Dashboard**: https://render.com/
2. **Create New Web Service**
3. **Connect Repository**: Select your DihhJ repository
4. **Configure Service**:
   - **Name**: `dihhj-backend`
   - **Environment**: `Node`
   - **Root Directory**: `DihhJ Backend` (IMPORTANT!)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 3: Set Environment Variables
In Render dashboard, add these environment variables:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URL` | `mongodb+srv://chulbuleMishraJi:<db_password>@chulbulemishraji.8mcwh5g.mongodb.net/?retryWrites=true&w=majority&appName=chulbuleMishraJi` |
| `DB_PASSWORD` | `your_actual_mongodb_password` |
| `DATABASE_NAME` | `dihhj_backend` |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:3001,https://dihhjbitchin-ido5.onrender.com` |
| `BCRYPT_ROUNDS` | `12` |

### Step 4: Deploy
1. **Click Deploy** - Render will automatically build and deploy
2. **Wait for deployment** to complete (usually 2-5 minutes)
3. **Test the deployment** using the provided URL

## 🔧 Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB credentials
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Test the API**:
   ```bash
   npm test
   ```

## 📊 API Endpoints

### Health & Info
- `GET /` - API information
- `GET /health` - Health check

### Authentication
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user

### Tea Posts
- `GET /tea/list` - Get tea posts (with pagination/filtering)
- `POST /tea/create?username={username}` - Create tea post
- `GET /tea/tags` - Get available tags
- `GET /tea/batches` - Get batch statistics
- `GET /tea/user/{username}` - Get user's tea posts
- `GET /tea/{id}` - Get specific tea post
- `PUT /tea/{id}?username={username}` - Update tea post (owner only)
- `DELETE /tea/{id}?username={username}` - Delete tea post (owner only)
- `POST /tea/{id}/vote?username={username}` - Vote on tea post
- `GET /tea/{id}/user-vote?username={username}` - Get user's vote

### Comments (Bitchin)
- `GET /bitch/{teaId}/list` - Get comments for tea
- `POST /bitch/{teaId}/create?username={username}` - Create comment
- `PUT /bitch/comment/{commentId}?username={username}` - Update comment
- `DELETE /bitch/comment/{commentId}?username={username}` - Delete comment
- `POST /bitch/comment/{commentId}/vote?username={username}&vote_type={type}` - Vote on comment
- `GET /bitch/comment/{commentId}/user-vote?username={username}` - Get comment vote
- `GET /bitch/user/{username}` - Get user's comments

## 🔍 Testing Deployment

### Automated Test
```bash
# Test local backend
npm test

# Test deployed backend
API_BASE=https://your-backend-url.onrender.com npm test
```

### Manual Test
1. **Health Check**: `GET https://your-backend-url.onrender.com/health`
2. **API Info**: `GET https://your-backend-url.onrender.com/`
3. **Tea List**: `GET https://your-backend-url.onrender.com/tea/list`
4. **Tags**: `GET https://your-backend-url.onrender.com/tea/tags`

## 🔒 Security Features

- **CORS Protection**: Configured for specific origins
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet**: Security headers
- **Password Hashing**: bcrypt with 12 rounds
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error responses

## 🗄️ Database

### MongoDB Atlas
- **Connection**: Automatic with fallback to in-memory for testing
- **Collections**: users, teas, votes, comments, comment_votes
- **Indexes**: Optimized for performance

### In-Memory Fallback
- **Used when**: MongoDB connection fails
- **Purpose**: Local testing and development
- **Limitation**: Data doesn't persist between restarts

## 🎯 Frontend Integration

This backend is designed to work seamlessly with:
- **Development**: `http://localhost:3000`
- **Production**: `https://dihhjbitchin-ido5.onrender.com`

All API endpoints match exactly what the frontend expects.

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check `MONGODB_URL` and `DB_PASSWORD` environment variables
   - Verify MongoDB Atlas credentials
   - Backend will fall back to in-memory database for testing

2. **CORS Errors**
   - Verify `CORS_ORIGINS` includes your frontend URL
   - Check browser console for specific CORS errors

3. **404 Errors on Specific Routes**
   - Ensure routes are defined in correct order
   - Check that specific routes (like `/tags`) come before parameterized routes (like `/:id`)

4. **Build Failures on Render**
   - Check Node.js version compatibility
   - Verify all dependencies are in `package.json`
   - Check build logs for specific errors

### Debug Commands
```bash
# Check server logs
npm start

# Test specific endpoints
curl https://your-backend-url.onrender.com/health

# Run full test suite
npm test
```

## 📝 Next Steps

After successful deployment:

1. **Update Frontend**: Ensure frontend `.env` points to new backend URL
2. **Test Integration**: Verify frontend-backend communication
3. **Monitor Performance**: Check Render logs for any issues
4. **Set Up MongoDB**: Configure proper MongoDB Atlas credentials

Your backend should now be fully functional and ready to serve your DihhJ Bitchers frontend!
