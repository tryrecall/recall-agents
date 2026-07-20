import Foundation
import SteelEngineProtocol

public enum GatewayConnectChallengeSupport {
    public static func nonce(from payload: [String: SteelEngineProtocol.AnyCodable]?) -> String? {
        guard let nonce = payload?["nonce"]?.value as? String else { return nil }
        let trimmed = nonce.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return nil }
        return trimmed
    }
}
