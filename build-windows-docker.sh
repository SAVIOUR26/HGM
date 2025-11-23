#!/bin/bash
# Build Windows installer using Docker
# This script builds the Windows .exe installer from Linux using a Docker container

set -e

echo "🐳 HGM POS - Docker Windows Build"
echo "=================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed."
    echo "Please install Docker first:"
    echo "  https://docs.docker.com/engine/install/"
    exit 1
fi

echo "✅ Docker is installed"
echo ""

# Build using electronuserland/builder Docker image
echo "📦 Building Windows installer with Docker..."
echo ""

docker run --rm \
  -v "$(pwd)":/project \
  -w /project \
  electronuserland/builder:wine \
  /bin/bash -c "
    echo '📥 Installing dependencies...' && \
    npm install && \
    echo '🔨 Building backend...' && \
    npm run build:backend && \
    echo '🔨 Building frontend...' && \
    npm run build:frontend && \
    echo '🔨 Building Electron...' && \
    npm run build:electron && \
    echo '📦 Creating Windows installer...' && \
    npm run electron:build
  "

# Check if build was successful
if [ -d "release" ] && [ "$(ls -A release/*.exe 2>/dev/null)" ]; then
    echo ""
    echo "✅ Build completed successfully!"
    echo ""
    echo "📁 Installer location:"
    ls -lh release/*.exe
    echo ""
    echo "🎉 You can now install the .exe file on Windows!"
else
    echo ""
    echo "❌ Build failed. Check the error messages above."
    exit 1
fi
