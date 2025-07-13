#!/bin/bash

# Script to run RSS Blue tools locally
# This allows using the local backup instead of external service

echo "🔧 Setting up RSS Blue Tools locally..."

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust not found. Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    source ~/.cargo/env
fi

# Check if Trunk is installed
if ! command -v trunk &> /dev/null; then
    echo "📦 Installing Trunk (Rust web bundler)..."
    cargo install trunk
fi

# Navigate to RSS Blue tools directory
cd external-tools/rss-blue-tools

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install

# Build and serve RSS Blue tools
echo "🚀 Starting RSS Blue Validator on http://localhost:8081"
echo "   This will run alongside your Podtardstr app"
echo "   Press Ctrl+C to stop"

# Run on port 8081 to avoid conflict with Podtardstr (usually on 5173)
trunk serve --port 8081 --open