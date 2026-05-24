import Foundation

public enum RecallLocationMode: String, Codable, Sendable, CaseIterable {
    case off
    case whileUsing
    case always
}
