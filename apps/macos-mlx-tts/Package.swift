// swift-tools-version: 6.2
// Isolated MLX TTS helper package. Keep this out of apps/macos/Package.swift so
// normal macOS app tests do not compile the full MLX audio stack.

import PackageDescription

let package = Package(
    name: "SteelEngineMLXTTS",
    platforms: [
        .macOS(.v15),
    ],
    products: [
        .executable(name: "steelengine-mlx-tts", targets: ["SteelEngineMLXTTSHelper"]),
    ],
    dependencies: [
        .package(url: "https://github.com/Blaizzy/mlx-audio-swift", revision: "fc4fe22dc41c053062e647a4e3db9142193670d2"),
        .package(path: "../shared/SteelEngineMLXTTSProtocol"),
    ],
    targets: [
        .target(
            name: "SteelEngineMLXTTSRuntime",
            dependencies: [
                .product(name: "MLXAudioTTS", package: "mlx-audio-swift"),
                .product(name: "SteelEngineMLXTTSProtocol", package: "SteelEngineMLXTTSProtocol"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "SteelEngineMLXTTSHelper",
            dependencies: [
                "SteelEngineMLXTTSRuntime",
                .product(name: "SteelEngineMLXTTSProtocol", package: "SteelEngineMLXTTSProtocol"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "SteelEngineMLXTTSRuntimeTests",
            dependencies: [
                "SteelEngineMLXTTSRuntime",
                .product(name: "SteelEngineMLXTTSProtocol", package: "SteelEngineMLXTTSProtocol"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
    ])
