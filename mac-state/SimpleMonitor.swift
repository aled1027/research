#!/usr/bin/env swift

// Simple command-line monitor that can be run directly with Swift 5.10
// Usage: swift SimpleMonitor.swift
// Or compile: swiftc SimpleMonitor.swift -o SimpleMonitor && ./SimpleMonitor

import Foundation
import AppKit

class ScreenRecordingMonitor {
    func checkActiveRecording() -> [String] {
        var activeApps: [String] = []

        let workspace = NSWorkspace.shared
        let runningApps = workspace.runningApplications

        let knownRecordingApps = [
            "zoom.us", "us.zoom.xos",
            "com.google.Chrome",
            "com.microsoft.teams",
            "com.apple.QuickTimePlayerX",
            "com.techsmith.snagit",
            "com.telestream.screenflow",
            "com.ObsProject.obs-studio",
            "com.apple.screencaptureui"
        ]

        for app in runningApps {
            if let bundleId = app.bundleIdentifier,
               let appName = app.localizedName,
               knownRecordingApps.contains(where: { bundleId.lowercased().contains($0.lowercased()) }) {
                activeApps.append(appName)
            }
        }

        return activeApps
    }

    func checkInstalledApps() -> [(String, String)] {
        var installedApps: [(String, String)] = []

        let commonApps = [
            ("Zoom", "us.zoom.xos"),
            ("Google Chrome", "com.google.Chrome"),
            ("Microsoft Teams", "com.microsoft.teams"),
            ("QuickTime Player", "com.apple.QuickTimePlayerX"),
            ("OBS Studio", "com.ObsProject.obs-studio"),
            ("Terminal", "com.apple.Terminal"),
        ]

        for (name, bundleId) in commonApps {
            if let _ = NSWorkspace.shared.urlForApplication(withBundleIdentifier: bundleId) {
                installedApps.append((name, bundleId))
            }
        }

        return installedApps
    }

    func run() {
        print("🖥️  Mac Screen Recording Monitor (Swift Edition)")
        print("================================================")
        print("")

        // Check active recording
        let activeApps = checkActiveRecording()
        if activeApps.isEmpty {
            print("✅ No known screen recording apps currently running")
        } else {
            print("🔴 Active Recording Detected:")
            for app in activeApps {
                print("  • \(app)")
            }
        }

        print("")

        // Check installed apps
        print("📱 Installed Screen Recording Apps:")
        let installed = checkInstalledApps()
        if installed.isEmpty {
            print("  (none found)")
        } else {
            for (name, bundleId) in installed {
                print("  • \(name) (\(bundleId))")
            }
        }

        print("")
        print("🔄 To monitor continuously, run:")
        print("   while true; do swift SimpleMonitor.swift; sleep 3; clear; done")
        print("")
        print("📖 To manage permissions:")
        print("   System Settings → Privacy & Security → Screen Recording")
    }
}

// Run the monitor
let monitor = ScreenRecordingMonitor()
monitor.run()
