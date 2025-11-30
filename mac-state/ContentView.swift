import SwiftUI

struct ContentView: View {
    @EnvironmentObject var monitor: SystemStateMonitor

    var body: some View {
        VStack(spacing: 0) {
            // Header - Recording Status
            RecordingStatusHeader(
                isRecording: monitor.isRecording,
                activeApps: monitor.activeRecordingApps,
                lastUpdated: monitor.lastUpdated,
                onRefresh: { monitor.manualRefresh() }
            )

            Divider()

            // Error message if any
            if let error = monitor.errorMessage {
                ErrorBanner(message: error)
            }

            // Permissions List
            PermissionsListView(permissions: monitor.appsWithPermission)

            Divider()

            // Footer
            FooterView()
        }
    }
}

struct RecordingStatusHeader: View {
    let isRecording: Bool
    let activeApps: [String]
    let lastUpdated: Date
    let onRefresh: () -> Void

    var body: some View {
        VStack(spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 8) {
                    HStack(spacing: 12) {
                        Circle()
                            .fill(isRecording ? Color.red : Color.green)
                            .frame(width: 16, height: 16)

                        Text(isRecording ? "Screen Recording: ACTIVE" : "Screen Recording: Not Active")
                            .font(.title2)
                            .fontWeight(.semibold)
                    }

                    if isRecording && !activeApps.isEmpty {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Currently recording:")
                                .font(.subheadline)
                                .foregroundColor(.secondary)

                            ForEach(activeApps, id: \.self) { app in
                                HStack(spacing: 6) {
                                    Circle()
                                        .fill(Color.red)
                                        .frame(width: 8, height: 8)
                                    Text(app)
                                        .font(.body)
                                }
                            }
                        }
                    }

                    Text("Last updated: \(lastUpdated, style: .time)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                Button(action: onRefresh) {
                    Image(systemName: "arrow.clockwise")
                        .font(.title3)
                }
                .buttonStyle(.borderless)
                .help("Refresh status")
            }
        }
        .padding()
        .background(isRecording ? Color.red.opacity(0.1) : Color.green.opacity(0.1))
    }
}

struct ErrorBanner: View {
    let message: String

    var body: some View {
        HStack {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundColor(.orange)
            Text(message)
                .font(.subheadline)
            Spacer()
        }
        .padding()
        .background(Color.orange.opacity(0.1))
    }
}

struct PermissionsListView: View {
    let permissions: [AppPermission]

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Apps with Screen Recording Permission")
                .font(.headline)
                .padding(.horizontal)
                .padding(.top)

            if permissions.isEmpty {
                VStack(spacing: 8) {
                    Image(systemName: "eye.slash")
                        .font(.system(size: 48))
                        .foregroundColor(.secondary)
                    Text("No apps detected")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    Text("Note: Full permission detection requires additional system access")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .padding()
            } else {
                ScrollView {
                    VStack(spacing: 0) {
                        // Header row
                        HStack {
                            Text("App Name")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .frame(width: 200, alignment: .leading)

                            Text("Bundle ID")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .frame(maxWidth: .infinity, alignment: .leading)

                            Text("Status")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .frame(width: 100, alignment: .leading)
                        }
                        .padding(.horizontal)
                        .padding(.vertical, 8)
                        .background(Color(nsColor: .controlBackgroundColor))

                        Divider()

                        // Permission rows
                        ForEach(permissions) { permission in
                            PermissionRow(permission: permission)
                            Divider()
                        }
                    }
                }
            }
        }
    }
}

struct PermissionRow: View {
    let permission: AppPermission

    var body: some View {
        HStack {
            Text(permission.appName)
                .frame(width: 200, alignment: .leading)

            Text(permission.bundleID)
                .font(.caption)
                .foregroundColor(.secondary)
                .frame(maxWidth: .infinity, alignment: .leading)

            HStack(spacing: 4) {
                Circle()
                    .fill(permission.hasPermission ? Color.green : Color.gray)
                    .frame(width: 8, height: 8)
                Text(permission.hasPermission ? "Granted" : "Denied")
                    .font(.caption)
            }
            .frame(width: 100, alignment: .leading)
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
    }
}

struct FooterView: View {
    var body: some View {
        HStack {
            Button("Open System Settings") {
                // Open System Settings to Privacy & Security > Screen Recording
                if let url = URL(string: "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture") {
                    NSWorkspace.shared.open(url)
                }
            }
            .buttonStyle(.link)

            Spacer()

            Text("macOS Screen Monitor v1.0")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(nsColor: .controlBackgroundColor))
    }
}
