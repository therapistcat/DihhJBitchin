#!/bin/bash

# NUCLEAR OPTION - Build script that avoids ALL potential Rust dependencies
echo "💥 NUCLEAR BUILD - Installing only essential packages"

# Set environment variables
export PYTHONUNBUFFERED=1
export PIP_NO_CACHE_DIR=1
export PIP_DISABLE_PIP_VERSION_CHECK=1

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install ONLY the most essential packages with exact versions
echo "📦 Installing ONLY essential packages..."

# Core FastAPI (old version, no Rust)
pip install --no-cache-dir fastapi==0.68.0

# Core Uvicorn (old version, no Rust)  
pip install --no-cache-dir uvicorn==0.15.0

# That's it! Just FastAPI and Uvicorn
echo "✅ Minimal build completed!"

# Test
python -c "
import fastapi
import uvicorn
print('✅ Core packages working!')
print('FastAPI version:', fastapi.__version__)
print('Uvicorn available')
"
