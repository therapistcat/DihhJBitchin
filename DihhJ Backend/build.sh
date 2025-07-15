#!/bin/bash

# Build script for Render deployment - ULTRA SAFE VERSION
echo "🚀 Starting DihhJ Backend build process (Rust-free)..."

# Set environment variables for build
export PYTHONUNBUFFERED=1
export PIP_NO_CACHE_DIR=1
export PIP_DISABLE_PIP_VERSION_CHECK=1

# Upgrade pip first
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install packages one by one to avoid dependency conflicts
echo "📦 Installing core dependencies individually..."

# Install FastAPI (older version without Rust deps)
echo "Installing FastAPI..."
pip install --no-cache-dir --no-deps fastapi==0.68.0

# Install Pydantic (older version)
echo "Installing Pydantic..."
pip install --no-cache-dir --no-deps pydantic==1.8.2

# Install Uvicorn (older version)
echo "Installing Uvicorn..."
pip install --no-cache-dir --no-deps uvicorn==0.15.0

# Install required dependencies for uvicorn
echo "Installing Uvicorn dependencies..."
pip install --no-cache-dir --no-deps click==8.0.4
pip install --no-cache-dir --no-deps h11==0.12.0

# Install MongoDB drivers
echo "Installing MongoDB drivers..."
pip install --no-cache-dir --no-deps pymongo==3.12.3
pip install --no-cache-dir --no-deps motor==2.5.1

# Install other utilities
echo "Installing utilities..."
pip install --no-cache-dir --no-deps python-dotenv==0.19.2
pip install --no-cache-dir --no-deps python-multipart==0.0.5

# Install missing dependencies
echo "Installing missing dependencies..."
pip install --no-cache-dir --no-deps starlette==0.14.2
pip install --no-cache-dir --no-deps typing-extensions==4.1.1

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
