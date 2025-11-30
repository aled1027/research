Mac State Monitor is a native macOS application designed to provide users with real-time visibility into their Mac's screen recording state. It identifies which apps currently have screen recording permissions and alerts users if any are actively recording, leveraging SwiftUI for a native interface and Apple's ScreenCaptureKit API. Users can run a quick command-line tool for instant status checks or build a full-featured GUI for ongoing monitoring, auto-refresh, and permission management. The architecture utilizes system state observation and heuristic app detection, but notes important limitations in full TCC database access and comprehensive detection of recording apps.

Key project resources:
- [ScreenCaptureKit Documentation](https://developer.apple.com/documentation/screencapturekit)
- [Swift Toolchain Downloads](https://www.swift.org/download/)

Key Findings:
- Current permission detection is heuristic-based and may miss some apps without direct TCC database access.
- Active recording detection is limited to known apps, with room for future enhancement.
- The open-source project runs entirely locally and restricts its permissions to ensure user privacy.
