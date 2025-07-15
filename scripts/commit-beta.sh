#!/bin/bash

# Podtardstr Beta Commit Script
# This script ensures commits go to main branch (beta environment)

set -e  # Exit on any error

echo "🚀 Committing to Beta (main branch)..."

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "🔄 Switching to main branch..."
    git checkout main
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Changes detected. Please enter a commit message:"
    read -r commit_message
    
    # Add all changes
    echo "📦 Adding changes..."
    git add .
    
    # Commit with message
    echo "💾 Committing changes..."
    git commit -m "$commit_message"
    
    # Push to main (beta)
    echo "📤 Pushing to main branch (beta)..."
    git push origin main
    
    echo "✅ Successfully committed to beta!"
    echo ""
    echo "📊 Deployment Status:"
    echo "  Beta:   https://podtardstr.vercel.app/ (main branch)"
    echo "  Stable: https://app.podtards.com/ (stable branch)"
    echo ""
    echo "🎯 To deploy to production, run: npm run deploy:stable"
else
    echo "ℹ️  No changes to commit."
fi 