// swift-tools-version: 5.10
import PackageDescription

let package = Package(
    name: "MacState",
    platforms: [
        .macOS(.v13)
    ],
    products: [
        .executable(
            name: "MacState",
            targets: ["MacState"]
        )
    ],
    targets: [
        .executableTarget(
            name: "MacState",
            path: ".",
            sources: [
                "MacStateApp.swift",
                "SystemStateMonitor.swift",
                "ContentView.swift"
            ],
            swiftSettings: [
                .unsafeFlags(["-sdk", "/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk"])
            ]
        )
    ]
)
