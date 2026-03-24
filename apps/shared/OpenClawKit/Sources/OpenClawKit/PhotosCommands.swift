import Foundation

public enum RecallPhotosCommand: String, Codable, Sendable {
    case latest = "photos.latest"
}

public struct RecallPhotosLatestParams: Codable, Sendable, Equatable {
    public var limit: Int?
    public var maxWidth: Int?
    public var quality: Double?

    public init(limit: Int? = nil, maxWidth: Int? = nil, quality: Double? = nil) {
        self.limit = limit
        self.maxWidth = maxWidth
        self.quality = quality
    }
}

public struct RecallPhotoPayload: Codable, Sendable, Equatable {
    public var format: String
    public var base64: String
    public var width: Int
    public var height: Int
    public var createdAt: String?

    public init(format: String, base64: String, width: Int, height: Int, createdAt: String? = nil) {
        self.format = format
        self.base64 = base64
        self.width = width
        self.height = height
        self.createdAt = createdAt
    }
}

public struct RecallPhotosLatestPayload: Codable, Sendable, Equatable {
    public var photos: [RecallPhotoPayload]

    public init(photos: [RecallPhotoPayload]) {
        self.photos = photos
    }
}
