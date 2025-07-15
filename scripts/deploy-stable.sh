#!/bin/bash

# Podtardstr Stable Deployment Script
# This script merges main branch into stable and deploys to production

set -e  # Exit on any error

echo "🚀 Deploying to Stable (Production)..."

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Error: You must be on the main branch to deploy to stable"
    echo "Current branch: $CURRENT_BRANCH"
    echo "Please run: git checkout main"
    exit 1
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: Working directory is not clean"
    echo "Please commit or stash your changes first"
    git status --short
    exit 1
fi

# Pull latest changes
echo "📥 Pulling latest changes from main..."
git pull origin main

# Switch to stable branch
echo "🔄 Switching to stable branch..."
git checkout stable

# Merge main into stable
echo "🔀 Merging main into stable..."
git merge main --no-edit

# Push to stable
echo "📤 Pushing stable to production..."
git push origin stable

# Switch back to main
echo "🔄 Switching back to main branch..."
git checkout main

echo "✅ Deployment to stable complete!"
echo ""
echo "📊 Deployment Status:"
echo "  Beta:   https://podtardstr.vercel.app/ (main branch)"
echo "  Stable: https://app.podtards.com/ (stable branch)"
echo ""
echo "🎯 Next steps:"
echo "  1. Wait for Vercel to deploy stable branch"
echo "  2. Test the production site"
echo "  3. Continue development on main branch" 