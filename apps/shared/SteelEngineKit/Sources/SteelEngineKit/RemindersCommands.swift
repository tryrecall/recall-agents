import Foundation

public enum SteelEngineRemindersCommand: String, Codable, Sendable {
    case list = "reminders.list"
    case add = "reminders.add"
}

public enum SteelEngineReminderStatusFilter: String, Codable, Sendable {
    case incomplete
    case completed
    case all
}

public struct SteelEngineRemindersListParams: Codable, Sendable, Equatable {
    public var status: SteelEngineReminderStatusFilter?
    public var limit: Int?

    public init(status: SteelEngineReminderStatusFilter? = nil, limit: Int? = nil) {
        self.status = status
        self.limit = limit
    }
}

public struct SteelEngineRemindersAddParams: Codable, Sendable, Equatable {
    public var title: String
    public var dueISO: String?
    public var notes: String?
    public var listId: String?
    public var listName: String?

    public init(
        title: String,
        dueISO: String? = nil,
        notes: String? = nil,
        listId: String? = nil,
        listName: String? = nil)
    {
        self.title = title
        self.dueISO = dueISO
        self.notes = notes
        self.listId = listId
        self.listName = listName
    }
}

public struct SteelEngineReminderPayload: Codable, Sendable, Equatable {
    public var identifier: String
    public var title: String
    public var dueISO: String?
    public var completed: Bool
    public var listName: String?

    public init(
        identifier: String,
        title: String,
        dueISO: String? = nil,
        completed: Bool,
        listName: String? = nil)
    {
        self.identifier = identifier
        self.title = title
        self.dueISO = dueISO
        self.completed = completed
        self.listName = listName
    }
}

public struct SteelEngineRemindersListPayload: Codable, Sendable, Equatable {
    public var reminders: [SteelEngineReminderPayload]

    public init(reminders: [SteelEngineReminderPayload]) {
        self.reminders = reminders
    }
}

public struct SteelEngineRemindersAddPayload: Codable, Sendable, Equatable {
    public var reminder: SteelEngineReminderPayload

    public init(reminder: SteelEngineReminderPayload) {
        self.reminder = reminder
    }
}
