import Foundation

public enum SteelEngineSystemCommand: String, Codable, Sendable {
    case run = "system.run"
    case which = "system.which"
    case notify = "system.notify"
    case execApprovalsGet = "system.execApprovals.get"
    case execApprovalsSet = "system.execApprovals.set"
}

public enum SteelEngineFileSystemCommand: String, Codable, Sendable {
    case listDir = "fs.listDir"
}

public enum SteelEngineNotificationPriority: String, Codable, Sendable {
    case passive
    case active
    case timeSensitive
}

public enum SteelEngineNotificationDelivery: String, Codable, Sendable {
    case system
    case overlay
    case auto
}

public struct SteelEngineSystemNotifyParams: Codable, Sendable, Equatable {
    public var title: String
    public var body: String
    public var sound: String?
    public var priority: SteelEngineNotificationPriority?
    public var delivery: SteelEngineNotificationDelivery?

    public init(
        title: String,
        body: String,
        sound: String? = nil,
        priority: SteelEngineNotificationPriority? = nil,
        delivery: SteelEngineNotificationDelivery? = nil)
    {
        self.title = title
        self.body = body
        self.sound = sound
        self.priority = priority
        self.delivery = delivery
    }
}
