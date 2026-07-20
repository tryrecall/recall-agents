// swift-tools-version: 6.2

import PackageDescription

let package = Package(
    name: "SteelEngineKit",
    platforms: [
        .iOS(.v18),
        .macOS(.v15),
        .watchOS(.v11),
    ],
    products: [
        .library(name: "SteelEngineProtocol", targets: ["SteelEngineProtocol"]),
        .library(name: "SteelEngineKit", targets: ["SteelEngineKit"]),
        .library(name: "SteelEngineChatUI", targets: ["SteelEngineChatUI"]),
    ],
    traits: [
        .trait(name: "Talk", description: "ElevenLabs cloud TTS / talk support"),
        .default(enabledTraits: ["Talk"]),
    ],
    dependencies: [
        .package(url: "https://github.com/steipete/ElevenLabsKit", exact: "0.1.1"),
        .package(url: "https://github.com/mgriebling/SwiftMath", exact: "1.7.3"),
        .package(url: "https://github.com/swiftlang/swift-markdown", exact: "0.8.0"),
    ],
    targets: [
        .target(
            name: "SteelEngineProtocol",
            path: "Sources/SteelEngineProtocol",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "SteelEngineKit",
            dependencies: [
                "SteelEngineProtocol",
                .product(
                    name: "ElevenLabsKit",
                    package: "ElevenLabsKit",
                    condition: .when(platforms: [.iOS, .macOS], traits: ["Talk"])),
            ],
            path: "Sources/SteelEngineKit",
            resources: [
                .process("Resources"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "SteelEngineChatUI",
            dependencies: [
                "SteelEngineKit",
                "SteelEngineProtocol",
                .product(name: "Markdown", package: "swift-markdown"),
                .product(name: "SwiftMath", package: "SwiftMath"),
            ],
            path: "Sources/SteelEngineChatUI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "SteelEngineKitTests",
            dependencies: ["SteelEngineKit", "SteelEngineChatUI", "SteelEngineProtocol"],
            path: "Tests/SteelEngineKitTests",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
