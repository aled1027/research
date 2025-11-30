import SwiftUI
import ScreenCaptureKit

@main
struct MacStateApp: App {
    @StateObject private var monitor = SystemStateMonitor()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(monitor)
                .frame(minWidth: 600, minHeight: 400)
        }
        .windowStyle(.hiddenTitleBar)
        .windowResizability(.contentSize)
    }
}
