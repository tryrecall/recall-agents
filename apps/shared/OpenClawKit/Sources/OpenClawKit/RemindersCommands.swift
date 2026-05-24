import Foundation

public enum RecallRemindersCommand: String, Codable, Sendable {
    case list = "reminders.list"
    case add = "reminders.add"
}

public enum RecallReminderStatusFilter: String, Codable, Sendable {
    case incomplete
    case completed
    case all
}

public struct RecallRemindersListParams: Codable, Sendable, Equatable {
    public var status: RecallReminderStatusFilter?
    public var limit: Int?

    public init(status: RecallReminderStatusFilter? = nil, limit: Int? = nil) {
        self.status = status
        self.limit = limit
    }
}

public struct RecallRemindersAddParams: Codable, Sendable, Equatable {
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

public struct RecallReminderPayload: Codable, Sendable, Equatable {
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

public struct RecallRemindersListPayload: Codable, Sendable, Equatable {
    public var reminders: [RecallReminderPayload]

    public init(reminders: [RecallReminderPayload]) {
        self.reminders = reminders
    }
}

public struct RecallRemindersAddPayload: Codable, Sendable, Equatable {
    public var reminder: RecallReminderPayload

    public init(reminder: RecallReminderPayload) {
        self.reminder = reminder
    }
}
