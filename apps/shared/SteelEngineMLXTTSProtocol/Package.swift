// swift-tools-version: 6.2

import PackageDescription

let package = Package(
    name: "SteelEngineMLXTTSProtocol",
    platforms: [
        .macOS(.v15),
    ],
    products: [
        .library(name: "SteelEngineMLXTTSProtocol", targets: ["SteelEngineMLXTTSProtocol"]),
    ],
    targets: [
        .target(name: "SteelEngineMLXTTSProtocol"),
        .testTarget(
            name: "SteelEngineMLXTTSProtocolTests",
            dependencies: ["SteelEngineMLXTTSProtocol"]),
    ])
