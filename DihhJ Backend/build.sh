#!/bin/bash

# Build script for Render deployment - PURE PYTHON VERSION
echo "🚀 Starting DihhJ Backend build process (Pure Python)..."

# Set basic environment variables
export PYTHONUNBUFFERED=1
export PIP_NO_CACHE_DIR=1

# Install minimal dependency to satisfy Render
echo "📦 Installing minimal dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "✅ Dependencies installed!"
echo "📦 Using Python's built-in http.server module for the actual server"

# Just verify Python is available
echo "🐍 Python version:"
python --version

# Verify our app.py file exists
if [ -f "app.py" ]; then
    echo "✅ app.py found"
else
    echo "❌ app.py not found!"
    exit 1
fi

# Test that our app can be imported (syntax check)
echo "🧪 Testing app.py syntax..."
python -m py_compile app.py
if [ $? -eq 0 ]; then
    echo "✅ app.py syntax is valid"
else
    echo "❌ app.py has syntax errors!"
    exit 1
fi

echo "✅ Build completed successfully!"

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
