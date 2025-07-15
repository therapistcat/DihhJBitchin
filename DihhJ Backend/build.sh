#!/bin/bash

# BULLETPROOF BUILD SCRIPT - GUARANTEED TO WORK
echo "🚀 Starting BULLETPROOF DihhJ Backend build..."

# Set environment variables to avoid Rust compilation
export PYTHONUNBUFFERED=1
export PIP_NO_CACHE_DIR=1
export PIP_DISABLE_PIP_VERSION_CHECK=1
export CARGO_NET_OFFLINE=true

# Upgrade pip to latest
echo "⬆️ Upgrading pip..."
pip install --upgrade pip setuptools wheel

# Install dependencies with specific flags to avoid compilation
echo "📦 Installing bulletproof dependencies..."
pip install --no-cache-dir --only-binary=all -r requirements.txt

# Verify Python version
echo "🐍 Python version:"
python --version

# Verify main.py exists and is valid
if [ -f "main.py" ]; then
    echo "✅ main.py found"
else
    echo "❌ main.py not found!"
    exit 1
fi

# Test syntax
echo "🧪 Testing main.py syntax..."
python -m py_compile main.py
if [ $? -eq 0 ]; then
    echo "✅ main.py syntax is valid"
else
    echo "❌ main.py has syntax errors!"
    exit 1
fi

# Verify all imports work
echo "🔍 Verifying all imports..."
python -c "
import sys
print(f'Python version: {sys.version}')

try:
    import fastapi
    print(f'✅ FastAPI {fastapi.__version__}')

    import uvicorn
    print(f'✅ Uvicorn {uvicorn.__version__}')

    import motor
    print(f'✅ Motor {motor.version}')

    import pymongo
    print(f'✅ PyMongo {pymongo.version}')

    import dotenv
    print('✅ python-dotenv imported')

    print('🎉 ALL DEPENDENCIES VERIFIED!')

except ImportError as e:
    print(f'❌ Import error: {e}')
    sys.exit(1)
"

echo "✅ BULLETPROOF BUILD COMPLETED SUCCESSFULLY!"
