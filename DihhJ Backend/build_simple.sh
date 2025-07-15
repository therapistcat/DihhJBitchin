#!/bin/bash
# Simple build script for Render deployment

echo "🚀 Starting DihhJ Backend build process..."

# Install dependencies
echo "📦 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "✅ Build completed successfully!"
