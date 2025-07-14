# 🚀 DihhJ Bitchers - Render Deployment Guide

## 📋 Prerequisites

1. **MongoDB Atlas Account**: Your cluster is ready at `chulbulemishraji.8mcwh5g.mongodb.net`
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **GitHub Repository**: Push your code to GitHub

## 🔧 Backend Deployment (API)

### Step 1: Create Web Service on Render

1. Go to Render Dashboard → "New" → "Web Service"
2. Connect your GitHub repository
3. Select the `DihhJ Backend` folder as root directory

### Step 2: Configure Build & Deploy Settings

**Build Command:**
```bash
pip install -r requirements.txt
```

**Start Command:**
```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Step 3: Environment Variables

Add these environment variables in Render:

```
MONGODB_URL=mongodb+srv://chulbuleMishraJi:<db_password>@chulbulemishraji.8mcwh5g.mongodb.net/?retryWrites=true&w=majority&appName=chulbuleMishraJi
DB_PASSWORD=your_actual_mongodb_password
DATABASE_NAME=dihhj_backend
ENVIRONMENT=production
API_HOST=0.0.0.0
API_PORT=10000
CORS_ORIGINS=["https://your-frontend-app.onrender.com"]
SECRET_KEY=your-super-secret-key-change-this
```

### Step 4: Advanced Settings

- **Python Version**: 3.11.7
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## 🎨 Frontend Deployment (React App)

### Step 1: Create Static Site on Render

1. Go to Render Dashboard → "New" → "Static Site"
2. Connect your GitHub repository
3. Select the `DihhJ Frontend/tea-blog` folder as root directory

### Step 2: Configure Build Settings

**Build Command:**
```bash
npm ci && npm run build
```

**Publish Directory:**
```
build
```

### Step 3: Environment Variables

Add these environment variables:

```
REACT_APP_API_URL=https://your-backend-app.onrender.com
REACT_APP_NAME=DihhJ Bitchers
REACT_APP_VERSION=1.0.0
NODE_ENV=production
```

## 🔐 Security Checklist

- [ ] MongoDB password is secure and not exposed
- [ ] CORS origins are set to your frontend domain only
- [ ] SECRET_KEY is changed from default
- [ ] Environment variables are properly set
- [ ] HTTPS is enabled (automatic on Render)

## 📝 Post-Deployment Steps

1. **Update CORS Origins**: After frontend deployment, update backend CORS_ORIGINS with actual frontend URL
2. **Update API URL**: Update frontend REACT_APP_API_URL with actual backend URL
3. **Test Connection**: Verify MongoDB Atlas connection
4. **Test API Endpoints**: Check all API routes work correctly
5. **Test Frontend**: Ensure frontend can communicate with backend

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Failed:**
- Check DB_PASSWORD is correct
- Verify MongoDB Atlas IP whitelist (set to 0.0.0.0/0 for Render)
- Check MONGODB_URL format

**CORS Errors:**
- Update CORS_ORIGINS with correct frontend URL
- Ensure no trailing slashes in URLs

### Frontend Issues

**API Calls Failing:**
- Check REACT_APP_API_URL points to correct backend
- Verify backend is running and accessible
- Check browser console for CORS errors

**Build Failures:**
- Check all dependencies are in package.json
- Verify Node.js version compatibility
- Check for any TypeScript/ESLint errors

## 📊 Monitoring

- **Backend Health**: `https://your-backend-app.onrender.com/health`
- **API Docs**: `https://your-backend-app.onrender.com/docs`
- **Frontend**: `https://your-frontend-app.onrender.com`

## 🔄 Updates

To update your deployment:
1. Push changes to GitHub
2. Render will automatically redeploy
3. Check logs for any deployment issues

---

**Important**: Replace all placeholder URLs with your actual Render app URLs after deployment!
