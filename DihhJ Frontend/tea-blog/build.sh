#!/bin/bash

# Build script for Render deployment
echo "🚀 Starting DihhJ Frontend build process..."

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm ci --only=production

# Build the application
echo "🔨 Building React application..."
npm run build

# Verify build
if [ -d "build" ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build directory created with $(ls -la build | wc -l) files"
else
    echo "❌ Build failed - no build directory found"
    exit 1
fi
