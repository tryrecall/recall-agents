// swift-tools-version: 6.2
// Package manifest for the SteelEngine macOS companion (menu bar app + IPC library).

import PackageDescription

let package = Package(
    name: "SteelEngine",
    platforms: [
        .macOS(.v15),
    ],
    products: [
        .library(name: "SteelEngineIPC", targets: ["SteelEngineIPC"]),
        .library(name: "SteelEngineDiscovery", targets: ["SteelEngineDiscovery"]),
        .executable(name: "SteelEngine", targets: ["SteelEngine"]),
        .executable(name: "steelengine-mac", targets: ["SteelEngineMacCLI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/sindresorhus/KeyboardShortcuts", exact: "3.0.1"),
        .package(url: "https://github.com/orchetect/MenuBarExtraAccess", exact: "1.3.0"),
        .package(url: "https://github.com/swiftlang/swift-subprocess.git", from: "0.4.0"),
        .package(url: "https://github.com/apple/swift-log.git", from: "1.12.0"),
        .package(url: "https://github.com/sparkle-project/Sparkle", from: "2.9.0"),
        .package(url: "https://github.com/steipete/Peekaboo.git", exact: "3.9.3"),
        .package(url: "https://github.com/pointfreeco/swift-concurrency-extras", from: "1.3.1"),
        .package(path: "../shared/SteelEngineKit"),
        .package(path: "../shared/SteelEngineMLXTTSProtocol"),
        .package(path: "../swabble"),
    ],
    targets: [
        .target(
            name: "SteelEngineIPC",
            dependencies: [],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "SteelEngineDiscovery",
            dependencies: [
                .product(name: "SteelEngineKit", package: "SteelEngineKit"),
            ],
            path: "Sources/SteelEngineDiscovery",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "SteelEngine",
            dependencies: [
                "SteelEngineIPC",
                "SteelEngineDiscovery",
                .product(name: "SteelEngineKit", package: "SteelEngineKit"),
                .product(name: "SteelEngineChatUI", package: "SteelEngineKit"),
                .product(name: "SteelEngineMLXTTSProtocol", package: "SteelEngineMLXTTSProtocol"),
                .product(name: "SteelEngineProtocol", package: "SteelEngineKit"),
                .product(name: "SwabbleKit", package: "swabble"),
                .product(name: "MenuBarExtraAccess", package: "MenuBarExtraAccess"),
                .product(name: "Subprocess", package: "swift-subprocess"),
                .product(name: "Logging", package: "swift-log"),
                .product(name: "Sparkle", package: "Sparkle"),
                .product(name: "PeekabooBridge", package: "Peekaboo"),
                .product(name: "PeekabooAutomationKit", package: "Peekaboo"),
                .product(name: "ConcurrencyExtras", package: "swift-concurrency-extras"),
                .product(name: "KeyboardShortcuts", package: "KeyboardShortcuts"),
            ],
            exclude: [
                "Resources/Info.plist",
                "Resources/Localizable.xcstrings",
            ],
            resources: [
                .copy("Resources/SteelEngine.icns"),
                .copy("Resources/DeviceModels"),
                .copy("Resources/ProviderIcons"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "SteelEngineMacCLI",
            dependencies: [
                "SteelEngineDiscovery",
                .product(name: "SteelEngineKit", package: "SteelEngineKit"),
                .product(name: "SteelEngineProtocol", package: "SteelEngineKit"),
            ],
            path: "Sources/SteelEngineMacCLI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "SteelEngineIPCTests",
            dependencies: [
                "SteelEngineIPC",
                "SteelEngine",
                "SteelEngineMacCLI",
                "SteelEngineDiscovery",
                .product(name: "SteelEngineChatUI", package: "SteelEngineKit"),
                .product(name: "SteelEngineKit", package: "SteelEngineKit"),
                .product(name: "SteelEngineMLXTTSProtocol", package: "SteelEngineMLXTTSProtocol"),
                .product(name: "SteelEngineProtocol", package: "SteelEngineKit"),
                .product(name: "SwabbleKit", package: "swabble"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
