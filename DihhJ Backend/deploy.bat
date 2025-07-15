@echo off
echo 🚀 Deploying DihhJ Backend to Render...
echo.

echo 📦 Adding all files...
git add .

echo 💾 Committing changes...
git commit -m "Bulletproof backend deployment - no Rust dependencies"

echo 🌐 Pushing to GitHub...
git push origin main

echo.
echo ✅ Deployment complete!
echo.
echo 📋 Next steps:
echo 1. Go to render.com and create a new Web Service
echo 2. Connect your GitHub repository
echo 3. Set environment variables (see DEPLOY_TO_RENDER.md)
echo 4. Deploy!
echo.
pause
