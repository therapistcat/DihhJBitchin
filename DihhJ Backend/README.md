# DihhJ Backend - Reddit-like Tea Sharing Platform 🍵

A FastAPI-based backend for a Reddit-like platform where users can share "tea" (stories/posts) with advanced features like voting, commenting, tagging, and batch-based communities.

## 🚀 Features

### Core Features
- **User Authentication**: Registration and login system with batch-based organization
- **Tea Posts**: Create, read, update, delete tea posts (like Reddit posts)
- **Voting System**: Upvote/downvote tea posts and comments (Reddit-style)
- **Nested Comments**: Threaded comment system called "bitch" comments
- **Batch-based Communities**: Separate spaces for different batches (25, 26, 27, 28, 29)
- **Advanced Tagging**: Rich tagging system with 20+ predefined categories
- **Image Support**: Optional image uploads for tea posts
- **Search & Filtering**: Search posts and filter by tags, batch, etc.

### Reddit-like Features
- **Hot/New/Top Sorting**: Multiple sorting algorithms
- **Score System**: Upvotes - downvotes scoring
- **Comment Threading**: Nested replies with depth tracking
- **Trending Tags**: Track popular tags over time
- **Batch Statistics**: View activity stats for each batch

## 📋 Available Tags

The platform includes a comprehensive tagging system:

- `general` - General discussions and everyday topics
- `informative` - Educational or informative content
- `hari-bitch` - Daily complaints and minor frustrations
- `snitching-on-my-bestie` - Sharing secrets about friends (anonymously)
- `drama` - Dramatic situations and conflicts
- `confession` - Personal confessions and admissions
- `advice` - Seeking or giving advice
- `rant` - Venting and expressing frustrations
- `funny` - Humorous content and jokes
- `wholesome` - Positive and heartwarming content
- `academic` - School, studies, and academic life
- `relationship` - Dating, romance, and relationships
- `family` - Family-related topics
- `friends` - Friendship and social circles
- `work` - Job and career-related topics
- `life-update` - Personal life updates and milestones
- `question` - Questions seeking answers
- `discussion` - Open discussions and debates
- `meme` - Memes and internet culture
- `serious` - Serious and important topics

## Requirements

- Python 3.8+
- MongoDB (local or cloud)
- Dependencies listed in `requirements.txt`

## Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd "DihhJ Backend"
   ```

2. **Activate virtual environment** (if not already activated)
   ```bash
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies** (already installed based on requirements.txt)
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up MongoDB**
   - Install MongoDB locally, or
   - Use MongoDB Atlas (cloud), or
   - Use Docker: `docker run -d -p 27017:27017 mongo`

5. **Configure environment variables**
   - Edit `.env` file if needed
   - Default MongoDB URL: `mongodb://localhost:27017`
   - Default database name: `dihhj_backend`

## Running the Application

1. **Start the API server**
   ```bash
   python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Access the API**
   - API Base URL: http://localhost:8000
   - Interactive API Docs: http://localhost:8000/docs
   - Alternative Docs: http://localhost:8000/redoc

## API Endpoints

### Root Endpoints
- `GET /` - API information and health check
- `GET /health` - Health check endpoint

### Authentication Endpoints
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login with existing credentials

## API Usage Examples

### Register a New User
```bash
curl -X POST "http://localhost:8000/auth/register" \
     -H "Content-Type: application/json" \
     -d '{
       "username": "john_doe",
       "password": "securepassword123",
       "year": "27"
     }'
```

### Login
```bash
curl -X POST "http://localhost:8000/auth/login" \
     -H "Content-Type: application/json" \
     -d '{
       "username": "john_doe",
       "password": "securepassword123"
     }'
```

## Data Validation

### Registration Requirements
- **Username**: 3-50 characters, must be unique
- **Password**: Minimum 6 characters
- **Year**: Must be one of: 26, 27, 28, 29 (graduation year)

### Response Format
All endpoints return JSON responses with consistent structure:
```json
{
  "message": "Success message",
  "user": {
    "username": "john_doe",
    "year": "27",
    "id": "507f1f77bcf86cd799439011"
  }
}
```

## Testing

Run the test script to verify all endpoints:
```bash
python test_api.py
```

## Project Structure

```
DihhJ Backend/
├── main.py                 # FastAPI application entry point
├── database.py             # MongoDB connection and configuration
├── .env                    # Environment variables
├── requirements.txt        # Python dependencies
├── test_api.py            # API testing script
├── routes/
│   ├── registration.py    # User registration endpoint
│   └── login.py          # User login endpoint
├── schemas/
│   └── user_schemas.py   # Pydantic models for validation
└── utils/
    └── hashing.py        # Password hashing utilities
```

## Database Schema

### Users Collection
```json
{
  "_id": "ObjectId",
  "username": "string (unique)",
  "password": "string (hashed)",
  "year": "string (26|27|28|29)"
}
```

## Security Features

- ✅ Password hashing with bcrypt
- ✅ Input validation and sanitization
- ✅ Proper HTTP status codes
- ✅ Error handling without exposing sensitive information

## Development

- The API runs with auto-reload enabled in development mode
- MongoDB connection is tested on startup
- Comprehensive error handling and logging
- CORS enabled for frontend integration

## 🚀 Deployment on Render

### Environment Variables Required:
Set these in your Render dashboard:

```
ENVIRONMENT=production
MONGODB_URL=mongodb+srv://chulbuleMishraJi:<db_password>@chulbulemishraJi.8mcwh5g.mongodb.net/
DB_PASSWORD=your_mongodb_atlas_password
DATABASE_NAME=dihhj_backend
CORS_ORIGINS=["https://dihhjbitchin-ido5.onrender.com"]
```

### Deployment Steps:
1. Connect your GitHub repo to Render
2. Set build command: `./build.sh`
3. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables above
5. Deploy!

### Frontend Integration
Frontend is deployed at: https://dihhjbitchin-ido5.onrender.com
Backend CORS is configured to allow requests from this domain.

## Next Steps (Optional Enhancements)

- [ ] JWT token authentication
- [ ] User sessions management
- [ ] Password reset functionality
- [ ] Email verification
- [ ] Rate limiting
- [ ] API versioning
- [ ] Unit tests with pytest
