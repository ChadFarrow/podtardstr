# Building Podtardstr Android APK

This guide explains how to build an Android APK for Podtardstr using Capacitor.

## Prerequisites

### 1. Java Development Kit (JDK)
You need Java JDK 11 or later installed.

**macOS:**
```bash
brew install openjdk@11
```

**Or download from:** https://adoptium.net/

### 2. Android SDK (Optional but Recommended)
For the best development experience, install Android Studio:
- Download from: https://developer.android.com/studio
- This includes the Android SDK and build tools

## Quick APK Build

### Option 1: Using the Build Script (Recommended)
```bash
npm run build:apk
```

This script will:
- Check for Java installation
- Build the web assets
- Sync with Capacitor
- Build the APK
- Show you where to find the APK file

### Option 2: Manual Build
```bash
# 1. Build web assets
npm run build

# 2. Sync with Capacitor
npm run sync:android

# 3. Build APK
cd android
./gradlew assembleDebug
```

## APK Location

After successful build, your APK will be located at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## Installing the APK

1. **Enable Developer Options** on your Android device:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings > Developer Options
   - Enable "USB Debugging" and "Install via USB"

2. **Transfer and Install:**
   - Copy the APK to your device
   - Open the APK file on your device
   - Allow installation from unknown sources if prompted

## Development Workflow

### Sync Changes
When you make changes to the web app:
```bash
npm run build
npm run sync:android
```

### Open in Android Studio
```bash
npm run open:android
```

### Live Reload (Development)
```bash
npm run dev
npx cap run android
```

## Troubleshooting

### "Java not found" Error
Install Java JDK 11 or later:
```bash
brew install openjdk@11
```

### "Android SDK not found" Warning
Install Android Studio or set ANDROID_HOME:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
```

### Build Fails
1. Clean the project:
   ```bash
   cd android
   ./gradlew clean
   ```

2. Rebuild:
   ```bash
   npm run build:apk
   ```

### APK Won't Install
- Make sure "Install from Unknown Sources" is enabled
- Check that the APK is not corrupted
- Try uninstalling any previous version first

## Alternative: PWA Builder

If you prefer a simpler approach:
1. Deploy your app to Vercel/Netlify
2. Go to https://www.pwabuilder.com/
3. Enter your app URL
4. Download the generated APK

## Features in the APK

The APK includes all Podtardstr features:
- ✅ Top 100 V4V Music Chart
- ✅ Music Discovery and Streaming
- ✅ Value4Value Lightning Payments
- ✅ Nostr Integration
- ✅ Podcast Player with Queue
- ✅ Offline Support (PWA features)

## Next Steps

Once you have the APK working:
1. Test all features on Android
2. Consider signing the APK for distribution
3. Test on different Android versions
4. Optimize for mobile performance 