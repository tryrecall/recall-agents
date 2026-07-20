import Foundation

public enum SteelEngineHealthCommand: String, Codable, Sendable {
    case summary = "health.summary"
}

public enum SteelEngineHealthSummaryPeriod: String, Codable, Sendable, CaseIterable {
    case today
}

public struct SteelEngineHealthSummaryParams: Codable, Sendable, Equatable {
    public var period: SteelEngineHealthSummaryPeriod

    public init(period: SteelEngineHealthSummaryPeriod) {
        self.period = period
    }
}

public struct SteelEngineHealthSummaryPayload: Codable, Sendable, Equatable {
    public var period: SteelEngineHealthSummaryPeriod
    public var startISO: String
    public var endISO: String
    public var timeZoneIdentifier: String
    public var stepCount: Int?
    public var sleepDurationMinutes: Int?
    public var restingHeartRateBpm: Double?
    public var workoutCount: Int?
    public var workoutDurationMinutes: Int?

    public init(
        period: SteelEngineHealthSummaryPeriod,
        startISO: String,
        endISO: String,
        timeZoneIdentifier: String,
        stepCount: Int?,
        sleepDurationMinutes: Int?,
        restingHeartRateBpm: Double?,
        workoutCount: Int?,
        workoutDurationMinutes: Int?)
    {
        self.period = period
        self.startISO = startISO
        self.endISO = endISO
        self.timeZoneIdentifier = timeZoneIdentifier
        self.stepCount = stepCount
        self.sleepDurationMinutes = sleepDurationMinutes
        self.restingHeartRateBpm = restingHeartRateBpm
        self.workoutCount = workoutCount
        self.workoutDurationMinutes = workoutDurationMinutes
    }
}
