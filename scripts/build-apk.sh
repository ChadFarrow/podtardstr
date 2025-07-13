#!/bin/bash

# Podtardstr APK Build Script
echo "🎵 Building Podtardstr APK..."

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install Java JDK 11 or later."
    echo "   You can install it with: brew install openjdk@11"
    echo "   Or download from: https://adoptium.net/"
    exit 1
fi

# Check if Android SDK is available
if [ ! -d "$ANDROID_HOME" ] && [ ! -d "$HOME/Library/Android/sdk" ]; then
    echo "⚠️  Android SDK not found. You may need to install Android Studio."
    echo "   Download from: https://developer.android.com/studio"
    echo "   Or set ANDROID_HOME environment variable."
fi

# Build the web app
echo "📦 Building web assets..."
npm run build

# Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync android

# Build the APK
echo "🔨 Building Android APK..."
cd android
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo "✅ APK built successfully!"
    echo "📱 APK location: android/app/build/outputs/apk/debug/app-debug.apk"
    echo "📱 You can install this APK on your Android device"
else
    echo "❌ APK build failed. Check the error messages above."
    exit 1
fi 