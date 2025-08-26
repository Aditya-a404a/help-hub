#!/bin/bash

# Help Hub Deployment Script

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Run linting
echo "🔍 Running linting..."
npm run lint

# Build the project
echo "🏗️ Building project..."
npm run build

# Check build output
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Build output available in .next directory"
    echo ""
    echo "🚀 Ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Set environment variables in your hosting platform"
    echo "2. Deploy the .next directory and public folder"
    echo "3. Ensure your hosting platform supports Node.js 18+"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
