# 🚀 DihhJ Backend Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Preparation
- [ ] All code committed and pushed to GitHub
- [ ] `main.py` contains proper CORS configuration for frontend URL
- [ ] `requirements.txt` includes all dependencies
- [ ] `Procfile` configured for Render
- [ ] `build.sh` script is executable
- [ ] `runtime.txt` specifies Python version

### ✅ Environment Configuration
- [ ] `.env.example` updated with production settings
- [ ] MongoDB Atlas cluster created and configured
- [ ] Database user created with proper permissions
- [ ] Network access configured (0.0.0.0/0 or specific IPs)

## Render Deployment Steps

### ✅ Service Creation
- [ ] Render account created/logged in
- [ ] GitHub repository connected
- [ ] Web service created with correct settings:
  - [ ] Build Command: `./build.sh`
  - [ ] Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
  - [ ] Environment: Python 3

### ✅ Environment Variables
Set these in Render dashboard:
- [ ] `ENVIRONMENT=production`
- [ ] `MONGODB_URL=mongodb+srv://chulbuleMishraJi:<db_password>@chulbulemishraJi.8mcwh5g.mongodb.net/`
- [ ] `DB_PASSWORD=your_actual_password`
- [ ] `DATABASE_NAME=dihhj_backend`
- [ ] `CORS_ORIGINS=["https://dihhjbitchin-ido5.onrender.com"]`

## Post-Deployment Verification

### ✅ Backend Testing
- [ ] Root endpoint responds: `GET /`
- [ ] Health check works: `GET /health`
- [ ] Database connection successful
- [ ] CORS headers present for frontend domain
- [ ] API documentation accessible (if not production)

### ✅ Frontend Integration
- [ ] Frontend updated with backend URL
- [ ] CORS working from frontend
- [ ] User registration working
- [ ] User login working
- [ ] Tea posts CRUD working
- [ ] Comments (bitches) working
- [ ] Voting system working

## Troubleshooting

### ❌ Common Issues & Solutions

**Build Fails:**
- [ ] Check Python version in `runtime.txt`
- [ ] Verify `build.sh` permissions
- [ ] Check `requirements.txt` syntax

**Database Connection Fails:**
- [ ] Verify MongoDB URL format
- [ ] Check DB_PASSWORD environment variable
- [ ] Confirm MongoDB Atlas network access
- [ ] Test connection string locally

**CORS Errors:**
- [ ] Verify frontend URL in CORS_ORIGINS
- [ ] Check JSON format of CORS_ORIGINS
- [ ] Ensure HTTPS for production frontend

**Service Won't Start:**
- [ ] Check Render logs for errors
- [ ] Verify start command syntax
- [ ] Check for missing environment variables

## Final Steps

### ✅ Go Live
- [ ] Backend deployed and healthy
- [ ] Frontend connected to backend
- [ ] All features tested end-to-end
- [ ] Users can register and login
- [ ] Tea posts and comments working
- [ ] Voting system functional

### ✅ Monitoring
- [ ] Monitor Render service health
- [ ] Check MongoDB Atlas metrics
- [ ] Monitor frontend for errors
- [ ] Test periodically with `test_deployment.py`

## URLs to Remember

- **Frontend**: https://dihhjbitchin-ido5.onrender.com
- **Backend**: https://your-backend-name.onrender.com (replace with actual)
- **MongoDB**: MongoDB Atlas dashboard
- **Render**: Render dashboard for logs and monitoring

## Emergency Contacts

If deployment fails:
1. Check Render logs first
2. Verify environment variables
3. Test MongoDB connection
4. Check GitHub repository
5. Review this checklist

---

**Note**: Replace `your-backend-name` with your actual Render service name!
