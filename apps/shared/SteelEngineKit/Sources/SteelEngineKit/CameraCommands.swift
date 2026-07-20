import Foundation

public enum SteelEngineCameraCommand: String, Codable, Sendable {
    case list = "camera.list"
    case snap = "camera.snap"
    case clip = "camera.clip"
}

public enum SteelEngineCameraFacing: String, Codable, Sendable {
    case back
    case front
}

public enum SteelEngineCameraImageFormat: String, Codable, Sendable {
    case jpg
    case jpeg
}

public enum SteelEngineCameraVideoFormat: String, Codable, Sendable {
    case mp4
}

public struct SteelEngineCameraSnapParams: Codable, Sendable, Equatable {
    public var facing: SteelEngineCameraFacing?
    public var maxWidth: Int?
    public var quality: Double?
    public var format: SteelEngineCameraImageFormat?
    public var deviceId: String?
    public var delayMs: Int?

    public init(
        facing: SteelEngineCameraFacing? = nil,
        maxWidth: Int? = nil,
        quality: Double? = nil,
        format: SteelEngineCameraImageFormat? = nil,
        deviceId: String? = nil,
        delayMs: Int? = nil)
    {
        self.facing = facing
        self.maxWidth = maxWidth
        self.quality = quality
        self.format = format
        self.deviceId = deviceId
        self.delayMs = delayMs
    }
}

public struct SteelEngineCameraClipParams: Codable, Sendable, Equatable {
    public var facing: SteelEngineCameraFacing?
    public var durationMs: Int?
    public var includeAudio: Bool?
    public var format: SteelEngineCameraVideoFormat?
    public var deviceId: String?

    public init(
        facing: SteelEngineCameraFacing? = nil,
        durationMs: Int? = nil,
        includeAudio: Bool? = nil,
        format: SteelEngineCameraVideoFormat? = nil,
        deviceId: String? = nil)
    {
        self.facing = facing
        self.durationMs = durationMs
        self.includeAudio = includeAudio
        self.format = format
        self.deviceId = deviceId
    }
}
