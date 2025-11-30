#!/bin/bash

# Create a proper macOS .app bundle from the compiled binary

APP_NAME="MacState"
BUNDLE_NAME="$APP_NAME.app"
BUILD_DIR=".build/release"
BUNDLE_DIR="$BUNDLE_NAME/Contents/MacOS"

echo "Creating macOS app bundle: $BUNDLE_NAME"

# Create bundle structure
mkdir -p "$BUNDLE_NAME/Contents/MacOS"
mkdir -p "$BUNDLE_NAME/Contents/Resources"

# Copy binary
cp "$BUILD_DIR/$APP_NAME" "$BUNDLE_DIR/"

# Create Info.plist
cat > "$BUNDLE_NAME/Contents/Info.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>MacState</string>
    <key>CFBundleIdentifier</key>
    <string>com.research.macstate</string>
    <key>CFBundleName</key>
    <string>MacState</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSMinimumSystemVersion</key>
    <string>13.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSScreenCaptureDescription</key>
    <string>This app needs screen recording permission to monitor which apps are recording your screen.</string>
</dict>
</plist>
EOF

echo "✅ App bundle created: $BUNDLE_NAME"
echo ""
echo "To launch:"
echo "  open $BUNDLE_NAME"
echo ""
echo "To install to Applications:"
echo "  cp -r $BUNDLE_NAME /Applications/"
