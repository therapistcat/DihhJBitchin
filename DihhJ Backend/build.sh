#!/bin/bash

# Build script for Render deployment
echo "🚀 Starting DihhJ Backend build process..."

# Upgrade pip first
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Verify installation
echo "🔍 Verifying installation..."
python -c "import fastapi, uvicorn, motor, pymongo; print('✅ All dependencies installed successfully!')"

echo "✅ Build completed successfully!"
