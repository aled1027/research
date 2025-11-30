#!/bin/bash

# Build script for MacState app
# This creates an Xcode project and builds the macOS app

set -e

echo "Building MacState app..."

# Create Xcode project directory structure
PROJECT_DIR="MacState.xcodeproj"
APP_NAME="MacState"
BUNDLE_ID="com.research.macstate"

# Method 1: Try to build with swiftc directly (simpler but may not work for full app bundle)
echo "Attempting to build with swiftc..."

# Create a temporary build directory
BUILD_DIR="build"
mkdir -p "$BUILD_DIR"

# Try to compile the Swift files into an executable
# Note: This may not work perfectly for a full macOS app with SwiftUI
swiftc -target arm64-apple-macos12.3 \
    -import-objc-header \
    -framework SwiftUI \
    -framework ScreenCaptureKit \
    -framework AppKit \
    -o "$BUILD_DIR/MacState" \
    MacStateApp.swift \
    SystemStateMonitor.swift \
    ContentView.swift \
    2>&1 || {
    echo ""
    echo "Direct compilation failed. This is expected for SwiftUI apps."
    echo ""
    echo "To build this app, you need to:"
    echo "1. Open Xcode"
    echo "2. Create a new macOS App project"
    echo "3. Choose SwiftUI for the interface"
    echo "4. Replace the generated files with the files in this directory"
    echo "5. Add Info.plist to the project"
    echo "6. Build and run"
    echo ""
    echo "Alternatively, I can create an Xcode project for you using xcodebuild..."
    exit 1
}

echo "Build complete!"
echo "Executable at: $BUILD_DIR/MacState"
