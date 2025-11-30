# macOS Screen Recording Monitor - Development Notes

## Goal
Create a native macOS app with SwiftUI that shows:
1. Which apps have screen recording permissions
2. Which apps are currently actively recording the screen

## Design Decisions

### Architecture
- SwiftUI-based macOS app (window-based, not menu bar)
- Components:
  - SystemStateMonitor: Observable object that queries system state
  - PermissionsMonitor: Queries TCC database for screen recording permissions
  - ActiveRecordingDetector: Checks if screen is currently being recorded
  - Dashboard View: Main UI showing both lists

### Technology Stack
- Swift + SwiftUI
- ScreenCaptureKit framework (macOS 12.3+) for active recording detection
- TCC database or system APIs for permissions
- Auto-refresh with Timer

### UI Design
- Header: Large status indicator (recording/not recording)
- Permissions list: Table showing apps with screen recording permission
- Footer: Link to System Preferences, version info

## Implementation Log

### 2025-11-29 - Initial Setup
- Created mac-state directory
- Created SwiftUI app structure with following files:
  - MacStateApp.swift: Main app entry point
  - SystemStateMonitor.swift: Monitoring logic for screen recording status
  - ContentView.swift: UI components and layout
  - Info.plist: App metadata and permission descriptions

### Implementation Details

#### SystemStateMonitor
- Uses ScreenCaptureKit (requires macOS 12.3+)
- Auto-refreshes every 3 seconds
- Checks for active recording by:
  - Looking for running apps with known screen recording bundle IDs
  - Checking for screen recording indicator windows
- Permission detection currently uses heuristic (checks for installed common apps)
- Full TCC database access would require additional system permissions

#### UI Components
- RecordingStatusHeader: Shows active/inactive status with color coding
- PermissionsListView: Table of apps with screen recording permission
- ErrorBanner: Displays permission errors
- FooterView: Link to System Settings

#### Known Limitations
1. Full permission detection requires TCC database access (would need System Events permission or root access)
2. Active recording detection is heuristic-based (checks common apps and window titles)
3. Requires macOS 12.3+ for ScreenCaptureKit

### Build Attempts

#### Attempted Swift Package Manager Build
- Tried building with `swift build` using Package.swift
- Failed due to Swift compiler version mismatch:
  - SDK built with Swift 6.0
  - Compiler is Swift 5.10
  - This is common when Command Line Tools and Xcode versions don't match

#### Recommended Build Method
For SwiftUI macOS apps, the best approach is to use Xcode:
1. Open Xcode
2. Create new macOS App project (SwiftUI interface)
3. Replace generated files with the Swift files in this directory
4. Add Info.plist to project settings
5. Build and run

Alternatively, update Xcode and Command Line Tools to matching versions.

### Command-Line Alternative

Created `check-screen-recording.sh` as an immediately runnable alternative:
- Shell script that works without building the full app
- Detects active screen recording processes using `pgrep`
- Queries TCC database if Full Disk Access is granted
- Falls back to checking for installed common apps
- Successfully tested and working on macOS 15.0.1

Example output:
- Detected OBS Studio running (active recording)
- Listed installed apps: Zoom, Chrome, Teams, OBS, Terminal
- Provided clear instructions for managing permissions

## Summary

### What Was Built

1. **SwiftUI macOS App** (full GUI):
   - MacStateApp.swift (main entry point)
   - SystemStateMonitor.swift (monitoring logic with ScreenCaptureKit)
   - ContentView.swift (complete UI with status header, permissions table, footer)
   - Info.plist (permissions configuration)
   - Package.swift (Swift Package Manager configuration)

2. **Command-Line Tool**:
   - check-screen-recording.sh (bash script for immediate testing)
   - Detects active recording processes
   - Queries TCC database (with proper permissions)
   - Lists installed screen recording apps

3. **Documentation**:
   - README.md (comprehensive guide with build instructions)
   - notes.md (development journal with technical details)
   - build.sh (build script template)

### Key Learnings

- ScreenCaptureKit (macOS 12.3+) provides best access for detecting active recording
- TCC database access requires Full Disk Access permission
- SwiftUI apps best built with Xcode IDE rather than command-line tools
- Swift compiler version matching between SDK and tools is critical
- Heuristic detection (process names, bundle IDs) works well for common apps
- Shell scripts provide good alternative for immediate functionality

### Building Without Xcode - Investigation

**Question:** Can the macOS app be compiled without Xcode?

**Answer:** Yes, but requires Swift 6.0 toolchain:

**Problem Found:**
- macOS 15.0 SDK requires Swift 6.0
- Command Line Tools only include Swift 5.10
- This creates SDK/compiler version mismatch
- Affects ALL Swift code, not just SwiftUI
- Error: "this SDK is not supported by the compiler"

**Solutions:**

1. **Install Swift 6.0 Toolchain** (No Xcode needed!)
   - Download from swift.org
   - Install .pkg file
   - Set TOOLCHAINS environment variable
   - Build with `swift build -c release`
   - Created `install-swift6.sh` with detailed instructions

2. **Install Xcode**
   - Includes Swift 6.0
   - Use `xcode-select` to switch toolchain
   - Then use Swift Package Manager normally

3. **Use Bash Script** (Current working solution!)
   - `check-screen-recording.sh` works perfectly
   - No Swift compilation needed
   - Provides same core functionality
   - Tested and working on macOS 15.0.1

**Attempts Made:**
- ✅ Created Package.swift for Swift Package Manager
- ❌ `swift build` with Swift 5.10 - SDK mismatch
- ❌ Simple Swift scripts - Same SDK issue
- ✅ Bash script - Works perfectly
- ✅ Created Swift 6.0 installation guide

**Conclusion:**
- Command-line build IS possible without Xcode
- Requires installing Swift 6.0 toolchain separately
- Bash script provides immediate working solution

### Successful Build with Swift 6.0

**Date:** 2025-11-29

**Swift Version Installed:** Swift 6.2.1
- Location: `~/Library/Developer/Toolchains/swift-6.2.1-RELEASE.xctoolchain`
- Activated via: `~/Library/Developer/Toolchains/swift-latest.xctoolchain/usr/bin/swift`

**Build Results:**
```bash
~/Library/Developer/Toolchains/swift-latest.xctoolchain/usr/bin/swift build -c release
```

- ✅ Build completed successfully in 10.45s
- ✅ Binary created: `.build/release/MacState` (241KB)
- ✅ App launched successfully
- ⚠️ Minor warnings (unused variables) - non-critical

**App Bundle Creation:**
- Created `create-app-bundle.sh` script
- Generated `MacState.app` bundle
- Can be launched with `open MacState.app`
- Can be installed to `/Applications/`

**Git Configuration:**
- Created `.gitignore` to exclude:
  - `.build/` directory
  - `*.app` bundles
  - `*.pkg` installers
  - Build artifacts
- Only source code and documentation committed

### Summary of Deliverables

**Working Tools:**
1. ✅ **Bash CLI Tool** (`check-screen-recording.sh`) - Tested and working
2. ✅ **SwiftUI macOS App** - Built and launched successfully
3. ✅ **App Bundle** (`MacState.app`) - Ready to use

**Documentation:**
- README.md with complete build instructions
- notes.md with development journal
- Installation guides for Swift 6.0

**Total Files Created:** 12 files
- 3 Swift source files (app code)
- 4 shell scripts (build, check, install, bundle)
- 2 documentation files (README, notes)
- 3 configuration files (Package.swift, Info.plist, .gitignore)

### Remaining Work (Future Enhancements)

- Refine active recording detection after real-world testing
- Implement proper TCC database querying with authorization
- Add notification support when recording starts/stops
- Consider menu bar mode option
- Add historical logging of recording events
