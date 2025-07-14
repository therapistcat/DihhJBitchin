#!/bin/bash

# Build script for Render deployment
echo "🚀 Starting DihhJ Backend build process..."

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "✅ Build completed successfully!"
