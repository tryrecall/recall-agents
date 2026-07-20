import Foundation
import Testing
@testable import SteelEngineKit

struct HealthCommandsTests {
    @Test func `health summary periods use the node command wire values`() throws {
        #expect(SteelEngineHealthCommand.summary.rawValue == "health.summary")
        #expect(SteelEngineHealthSummaryPeriod.allCases.map(\.rawValue) == ["today"])

        let params = SteelEngineHealthSummaryParams(period: .today)
        let data = try JSONEncoder().encode(params)
        #expect(String(decoding: data, as: UTF8.self) == #"{"period":"today"}"#)
    }
}
