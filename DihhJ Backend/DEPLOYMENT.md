# 🚀 DihhJ Backend Deployment Guide

## Render Deployment Instructions

### Step 1: Prepare Your Repository
Make sure your backend code is pushed to GitHub with these files:
- `main.py` - FastAPI application
- `requirements.txt` - Python dependencies
- `Procfile` - Render process configuration
- `build.sh` - Build script
- `runtime.txt` - Python version

### Step 2: Create Render Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository containing your backend code

### Step 3: Configure Build & Deploy Settings
- **Name**: `dihhj-backend` (or your preferred name)
- **Environment**: `Python 3`
- **Build Command**: `./build.sh`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Instance Type**: `Free` (or paid for better performance)

### Step 4: Set Environment Variables
Add these environment variables in Render dashboard:

```
ENVIRONMENT=production
MONGODB_URL=mongodb+srv://chulbuleMishraJi:<db_password>@chulbulemishraJi.8mcwh5g.mongodb.net/
DB_PASSWORD=your_actual_mongodb_password_here
DATABASE_NAME=dihhj_backend
CORS_ORIGINS=["https://dihhjbitchin-ido5.onrender.com"]
```

**Important**: Replace `your_actual_mongodb_password_here` with your real MongoDB Atlas password!

### Step 5: Deploy
1. Click "Create Web Service"
2. Render will automatically build and deploy your backend
3. Wait for deployment to complete (usually 2-5 minutes)
4. Your backend will be available at: `https://your-service-name.onrender.com`

### Step 6: Test Deployment
Visit your backend URL and check:
- Root endpoint: `https://your-backend-url.onrender.com/`
- Health check: `https://your-backend-url.onrender.com/health`
- API docs: `https://your-backend-url.onrender.com/docs` (if not production)

### Step 7: Update Frontend
Update your frontend code to use the new backend URL instead of localhost.

## MongoDB Atlas Setup (if needed)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a cluster (free tier available)
3. Create a database user with password
4. Get connection string: `mongodb+srv://username:<password>@cluster.mongodb.net/`
5. Whitelist Render's IP addresses or use `0.0.0.0/0` (less secure)

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check `build.sh` permissions and Python version in `runtime.txt`
2. **Database Connection Fails**: Verify MongoDB URL and password in environment variables
3. **CORS Errors**: Ensure frontend URL is in `CORS_ORIGINS` environment variable
4. **Service Won't Start**: Check logs in Render dashboard for specific errors

### Checking Logs:
- Go to Render dashboard → Your service → Logs tab
- Look for error messages during build or runtime

### Environment Variables Check:
Make sure all required environment variables are set correctly:
- `MONGODB_URL` - Your MongoDB connection string
- `DB_PASSWORD` - Your MongoDB password
- `CORS_ORIGINS` - JSON array with frontend URL

## Production Considerations

1. **Database**: Use MongoDB Atlas for production (not local MongoDB)
2. **Environment**: Set `ENVIRONMENT=production` to disable API docs
3. **Security**: Use strong passwords and proper CORS configuration
4. **Monitoring**: Monitor your service health and database connections
5. **Scaling**: Consider upgrading to paid Render plan for better performance

## Frontend Integration

Once backend is deployed:
1. Update frontend API base URL to your Render backend URL
2. Test all API endpoints from frontend
3. Verify CORS is working correctly
4. Test user registration, login, and all features

Your frontend at `https://dihhjbitchin-ido5.onrender.com` should now work with the deployed backend!
