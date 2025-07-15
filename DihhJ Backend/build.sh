#!/bin/bash

# Build script for Render deployment - UPDATED VERSION
echo "🚀 Starting DihhJ Backend build process..."

# Set environment variables for build
export PYTHONUNBUFFERED=1
export PIP_NO_CACHE_DIR=1
export PIP_DISABLE_PIP_VERSION_CHECK=1

# Upgrade pip first
echo "⬆️ Upgrading pip..."
pip install --upgrade pip setuptools wheel

# Install all dependencies from requirements.txt
echo "📦 Installing dependencies from requirements.txt..."
pip install --no-cache-dir -r requirements.txt

# Verify installation
echo "🔍 Verifying installation..."
python -c "
try:
    import fastapi
    import uvicorn
    import motor
    import pymongo
    import dotenv
    print('✅ All dependencies installed successfully!')
except ImportError as e:
    print(f'❌ Import error: {e}')
    exit(1)
"

echo "✅ Build completed successfully!"
