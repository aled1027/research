import Foundation
import Combine
import ScreenCaptureKit
import AppKit

class SystemStateMonitor: ObservableObject {
    @Published var isRecording: Bool = false
    @Published var activeRecordingApps: [String] = []
    @Published var appsWithPermission: [AppPermission] = []
    @Published var lastUpdated: Date = Date()
    @Published var errorMessage: String?

    private var timer: Timer?

    init() {
        startMonitoring()
    }

    func startMonitoring() {
        // Initial check
        Task {
            await checkRecordingStatus()
            await checkPermissions()
        }

        // Setup periodic refresh every 3 seconds
        timer = Timer.scheduledTimer(withTimeInterval: 3.0, repeats: true) { [weak self] _ in
            Task {
                await self?.checkRecordingStatus()
                await self?.checkPermissions()
            }
        }
    }

    func manualRefresh() {
        Task {
            await checkRecordingStatus()
            await checkPermissions()
        }
    }

    @MainActor
    private func checkRecordingStatus() async {
        do {
            // Check if we have permission first
            if #available(macOS 12.3, *) {
                let canCapture = await checkScreenCapturePermission()

                if !canCapture {
                    errorMessage = "This app needs Screen Recording permission. Please grant it in System Settings > Privacy & Security > Screen Recording"
                    return
                }

                // Get available content for screen capture
                let availableContent = try await SCShareableContent.excludingDesktopWindows(
                    false,
                    onScreenWindowsOnly: true
                )

                // Check for active recording by looking for screen recording indicators
                // This is a heuristic - we look for system UI elements that indicate recording
                let displays = availableContent.displays

                // Alternative approach: Check running applications for screen recording apps
                let workspace = NSWorkspace.shared
                let runningApps = workspace.runningApplications

                var recordingApps: [String] = []

                // Check for common screen recording apps
                let knownRecordingApps = [
                    "zoom.us", "us.zoom.xos",
                    "com.google.Chrome", // Google Meet
                    "com.microsoft.teams",
                    "com.apple.QuickTimePlayerX",
                    "com.techsmith.snagit",
                    "com.telestream.screenflow",
                    "com.ObsProject.obs-studio",
                    "com.apple.screencaptureui"
                ]

                for app in runningApps {
                    if let bundleId = app.bundleIdentifier,
                       knownRecordingApps.contains(where: { bundleId.lowercased().contains($0.lowercased()) }) {
                        if let appName = app.localizedName {
                            recordingApps.append(appName)
                        }
                    }
                }

                // Check if system screen recording indicator is active
                // by looking for windows with specific characteristics
                let windows = availableContent.windows
                let recordingIndicatorWindows = windows.filter { window in
                    window.title?.contains("Screen Recording") ?? false ||
                    window.owningApplication?.applicationName.contains("screen") ?? false
                }

                self.isRecording = !recordingApps.isEmpty || !recordingIndicatorWindows.isEmpty
                self.activeRecordingApps = recordingApps
                self.lastUpdated = Date()
                self.errorMessage = nil

            } else {
                errorMessage = "This app requires macOS 12.3 or later"
            }
        } catch {
            errorMessage = "Error checking recording status: \(error.localizedDescription)"
        }
    }

    @available(macOS 12.3, *)
    private func checkScreenCapturePermission() async -> Bool {
        // Try to get shareable content - this will fail if we don't have permission
        do {
            _ = try await SCShareableContent.excludingDesktopWindows(false, onScreenWindowsOnly: false)
            return true
        } catch {
            return false
        }
    }

    @MainActor
    private func checkPermissions() async {
        // Get list of apps with screen recording permission
        // This requires reading the TCC database or using private APIs
        // For now, we'll use a simpler approach: list known apps

        var permissions: [AppPermission] = []

        // Check common apps that might have screen recording permission
        let commonApps = [
            ("Zoom", "us.zoom.xos"),
            ("Google Chrome", "com.google.Chrome"),
            ("Microsoft Teams", "com.microsoft.teams"),
            ("QuickTime Player", "com.apple.QuickTimePlayerX"),
            ("Snagit", "com.techsmith.snagit"),
            ("ScreenFlow", "com.telestream.screenflow"),
            ("OBS Studio", "com.ObsProject.obs-studio"),
            ("Terminal", "com.apple.Terminal"),
            ("iTerm", "com.googlecode.iterm2"),
        ]

        for (name, bundleId) in commonApps {
            // Check if app is installed
            if let appUrl = NSWorkspace.shared.urlForApplication(withBundleIdentifier: bundleId) {
                // For now, we'll mark installed apps as "possibly having permission"
                // A full implementation would check the TCC database
                permissions.append(AppPermission(
                    appName: name,
                    bundleID: bundleId,
                    hasPermission: true
                ))
            }
        }

        self.appsWithPermission = permissions
    }

    deinit {
        timer?.invalidate()
    }
}

struct AppPermission: Identifiable {
    let id = UUID()
    let appName: String
    let bundleID: String
    let hasPermission: Bool
}
