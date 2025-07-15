#!/bin/bash

# Build script for Render deployment
echo "🚀 Starting DihhJ Backend build process..."

# Set environment variables for build
export PYTHONUNBUFFERED=1
export PIP_NO_CACHE_DIR=1

# Upgrade pip first
echo "⬆️ Upgrading pip..."
pip install --upgrade pip setuptools wheel

# Try to install from minimal requirements first (no Rust dependencies)
echo "📦 Installing Python dependencies (minimal)..."
if [ -f requirements-minimal.txt ]; then
    pip install --no-cache-dir -r requirements-minimal.txt
else
    # Fall back to regular requirements if minimal doesn't exist
    echo "📦 Installing Python dependencies (standard)..."
    pip install --no-cache-dir -r requirements.txt
fi

# Verify installation
echo "🔍 Verifying installation..."
python -c "import fastapi, uvicorn, motor, pymongo, dotenv; print('✅ All dependencies installed successfully!')"

echo "✅ Build completed successfully!"
