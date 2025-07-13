#!/bin/bash

# Manual deployment script for Podtardstr
# Use this if Vercel isn't auto-deploying from GitHub

echo "🚀 Starting manual deployment..."

# Build the project
echo "📦 Building project..."
npm run build

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "🌍 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🔗 Check https://podtardstr.vercel.app"