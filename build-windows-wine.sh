#!/bin/bash
# Build Windows installer using Wine (Linux)
# Quick local build without Docker or GitHub Actions

set -e

echo "🍷 HGM POS - Wine Windows Build"
echo "================================"
echo ""

# Check if Wine is installed
if ! command -v wine &> /dev/null; then
    echo "❌ Wine is not installed."
    echo ""
    echo "Installing Wine..."
    sudo dpkg --add-architecture i386
    sudo apt-get update
    sudo apt-get install -y wine wine32 wine64 --no-install-recommends
    echo ""
    echo "✅ Wine installed successfully"
fi

# Verify Wine version
WINE_VERSION=$(wine --version 2>/dev/null || echo "unknown")
echo "✅ Wine version: $WINE_VERSION"
echo ""

# Install dependencies
echo "📥 Installing npm dependencies..."
npm install
echo ""

# Build all components
echo "🔨 Building all components..."
npm run build
echo ""

# Build Windows installer
echo "📦 Creating Windows installer with Wine..."
echo "⚠️  This may show some warnings - that's normal"
echo ""

# Set Wine environment to avoid issues
export WINEDEBUG=-all
export CSC_IDENTITY_AUTO_DISCOVERY=false

npm run electron:build

# Check if build was successful
if [ -d "release" ] && [ "$(ls -A release/*.exe 2>/dev/null)" ]; then
    echo ""
    echo "✅ Build completed successfully!"
    echo ""
    echo "📁 Installer location:"
    ls -lh release/*.exe 2>/dev/null || ls -lh release/
    echo ""
    echo "🎉 You can now install the .exe file on Windows!"
    echo ""
    echo "⚠️  Note: Wine builds may have compatibility issues."
    echo "   For production builds, use GitHub Actions instead."
else
    echo ""
    echo "❌ Build failed."
    echo ""
    echo "💡 Troubleshooting:"
    echo "   1. Try using Docker build: ./build-windows-docker.sh"
    echo "   2. Or use GitHub Actions (recommended for production)"
    echo "   3. Check logs above for specific errors"
    exit 1
fi
