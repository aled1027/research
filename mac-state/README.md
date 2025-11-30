# Mac State Monitor

A native macOS application that helps you understand the screen recording state of your Mac. Shows which apps have screen recording permissions and which apps are currently actively recording your screen.

## Features

- **Real-time Recording Status**: See at a glance if your screen is being recorded
- **Active App Detection**: Identifies which apps (like Zoom, Google Meet, etc.) are currently recording
- **Permission Monitoring**: Lists apps that have screen recording permissions
- **Auto-refresh**: Updates status every 3 seconds
- **Native macOS Interface**: Built with SwiftUI for a clean, native look

## Quick Start (Command Line)

Want to try it immediately without building the full app? Run the included shell script:

```bash
./check-screen-recording.sh
```

This command-line tool provides:
- ✅ Detection of active screen recording processes
- ✅ List of installed screen recording apps
- ✅ TCC database querying (if you grant Full Disk Access)
- ✅ Works immediately, no build required

For the full GUI experience with auto-refresh and better UI, continue with building the SwiftUI app below.

## Requirements (for GUI App)

- macOS 12.3 or later (required for ScreenCaptureKit framework)
- Xcode 14+ for building

## How to Build the GUI App

### Method 1: Create Xcode Project (Recommended)

1. **Open Xcode** and create a new project:
   - File → New → Project
   - Choose **macOS** → **App**
   - Click Next

2. **Configure the project**:
   - Product Name: `MacState`
   - Interface: **SwiftUI**
   - Language: **Swift**
   - Click Next and choose a location

3. **Replace the generated files**:
   - Delete the default `ContentView.swift` and `MacStateApp.swift` (or rename)
   - Drag and drop these files into your project:
     - `MacStateApp.swift`
     - `SystemStateMonitor.swift`
     - `ContentView.swift`

4. **Configure Info.plist**:
   - Select your target in Xcode
   - Go to **Info** tab
   - Add a new key: `NSScreenCaptureDescription`
   - Value: `This app needs screen recording permission to detect which apps are currently recording your screen and to check screen recording permissions.`

5. **Build and Run**:
   - Press **⌘R** or click the Play button
   - Grant screen recording permission when prompted

### Method 2: Command-Line Build Without Xcode (Swift 6.0 Required)

**Important:** macOS 15.0 SDK requires Swift 6.0, but Command Line Tools include Swift 5.10. You have two options:

#### Option A: Install Swift 6.0 Toolchain (No Xcode needed!)

1. **Download Swift 6.0** from https://www.swift.org/download/
   - Get the latest "Release" toolchain for macOS (e.g., `swift-6.0-RELEASE-macos.pkg`)

2. **Install the .pkg** by double-clicking it

3. **Activate the toolchain:**
   ```bash
   # Temporary (current session only)
   export TOOLCHAINS=swift

   # Or set as default (add to ~/.zshrc)
   export TOOLCHAINS=$(plutil -extract CFBundleIdentifier raw /Library/Developer/Toolchains/swift-latest.xctoolchain/Info.plist)
   ```

4. **Verify Swift 6.0:**
   ```bash
   swift --version
   # Should show Swift 6.0 or later
   ```

5. **Build the app:**
   ```bash
   swift build -c release
   .build/release/MacState
   ```

See `./install-swift6.sh` for detailed instructions.

#### Option B: Install Xcode from App Store

Xcode includes Swift 6.0 and all necessary tools. After installing:

```bash
# Select Xcode toolchain
sudo xcode-select -s /Applications/Xcode.app

# Verify
swift --version

# Build
swift build -c release
```

**Why this is needed:** Your macOS 15.0 SDK is built with Swift 6.0, but Command Line Tools only include Swift 5.10. This version mismatch prevents compilation of ANY Swift code (not just SwiftUI).

## How to Use

1. **Grant Permissions**: When you first run the app, macOS will ask for screen recording permission. Grant it in:
   - System Settings → Privacy & Security → Screen Recording
   - Toggle on for Mac State Monitor

2. **View Status**: The app window shows:
   - **Header**: Large indicator showing if screen is being recorded (green = safe, red = recording)
   - **Active Apps**: Lists which apps are currently recording (when active)
   - **Permissions List**: Table of apps with screen recording permission

3. **Refresh**: Click the refresh button (⟳) to manually update the status

4. **Manage Permissions**: Click "Open System Settings" to manage which apps have screen recording permissions

## Architecture

### Components

- **MacStateApp.swift**: Main app entry point with SwiftUI App lifecycle
- **SystemStateMonitor.swift**: Observable object that monitors system state
  - Checks for active screen recording using ScreenCaptureKit
  - Lists apps with screen recording permissions
  - Auto-refreshes every 3 seconds
- **ContentView.swift**: UI components and views
  - Recording status header with color-coded indicator
  - Permissions list table
  - Error handling and empty states

### Detection Methods

**Active Recording Detection:**
- Uses ScreenCaptureKit to query shareable content
- Checks running applications for known screen recording apps (Zoom, Meet, etc.)
- Monitors for screen recording indicator windows

**Permission Detection:**
- Currently uses heuristic approach (checks for installed common apps)
- Full TCC database access requires additional permissions or root access
- Future enhancement: Query TCC database directly with proper authorization

## Known Limitations

1. **Permission Detection**: The app shows installed common apps that *might* have screen recording permission. Full TCC database querying requires:
   - System Events permission, or
   - Root access to read `/Library/Application Support/com.apple.TCC/TCC.db`
   - A future version could implement this with proper authorization

2. **Active Recording Detection**: Uses heuristic approach based on:
   - Known screen recording app bundle IDs
   - Window title patterns
   - May not detect all screen recording apps

3. **macOS Version**: Requires macOS 12.3+ for ScreenCaptureKit API

## Future Enhancements

- [ ] Full TCC database reading with proper authorization
- [ ] More comprehensive active recording detection
- [ ] Historical logging of recording events
- [ ] Menu bar mode option
- [ ] Notifications when recording starts
- [ ] Custom app list for monitoring

## Troubleshooting

**"This app needs Screen Recording permission"**
- Go to System Settings → Privacy & Security → Screen Recording
- Enable the toggle for Mac State Monitor
- Restart the app

**Empty permissions list**
- This is expected with current heuristic detection
- List shows only common apps that are installed
- Full detection requires TCC database access

**Swift compiler errors when building**
- Ensure Xcode and Command Line Tools versions match
- Update both to latest versions
- Use Xcode IDE instead of command-line build

## Security & Privacy

This app:
- ✅ Runs entirely locally (no network requests)
- ✅ Only reads system state, doesn't modify anything
- ✅ Open source - all code is visible and auditable
- ✅ Requests only necessary permissions (screen recording)
- ⚠️ Requires screen recording permission (to detect who else is recording)

## License

MIT License - feel free to use, modify, and distribute

## Contributing

This is a research project. Contributions and improvements welcome!

Key areas for contribution:
- Better TCC database access implementation
- Enhanced active recording detection
- UI/UX improvements
- Support for older macOS versions
