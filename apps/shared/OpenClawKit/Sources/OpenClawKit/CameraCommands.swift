import Foundation

public enum RecallCameraCommand: String, Codable, Sendable {
    case list = "camera.list"
    case snap = "camera.snap"
    case clip = "camera.clip"
}

public enum RecallCameraFacing: String, Codable, Sendable {
    case back
    case front
}

public enum RecallCameraImageFormat: String, Codable, Sendable {
    case jpg
    case jpeg
}

public enum RecallCameraVideoFormat: String, Codable, Sendable {
    case mp4
}

public struct RecallCameraSnapParams: Codable, Sendable, Equatable {
    public var facing: RecallCameraFacing?
    public var maxWidth: Int?
    public var quality: Double?
    public var format: RecallCameraImageFormat?
    public var deviceId: String?
    public var delayMs: Int?

    public init(
        facing: RecallCameraFacing? = nil,
        maxWidth: Int? = nil,
        quality: Double? = nil,
        format: RecallCameraImageFormat? = nil,
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

public struct RecallCameraClipParams: Codable, Sendable, Equatable {
    public var facing: RecallCameraFacing?
    public var durationMs: Int?
    public var includeAudio: Bool?
    public var format: RecallCameraVideoFormat?
    public var deviceId: String?

    public init(
        facing: RecallCameraFacing? = nil,
        durationMs: Int? = nil,
        includeAudio: Bool? = nil,
        format: RecallCameraVideoFormat? = nil,
        deviceId: String? = nil)
    {
        self.facing = facing
        self.durationMs = durationMs
        self.includeAudio = includeAudio
        self.format = format
        self.deviceId = deviceId
    }
}
