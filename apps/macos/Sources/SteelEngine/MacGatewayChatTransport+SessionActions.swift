import Foundation
import SteelEngineChatUI

extension MacGatewayChatTransport {
    func acquireSessionMutationRouteLease() async -> SteelEngineChatSessionMutationRouteLease? {
        guard let serverLease = await GatewayConnection.shared.captureServerLease() else { return nil }
        if let outboxGatewayID {
            let currentGatewayID = await MainActor.run { MacChatTranscriptCache.currentGatewayID() }
            guard currentGatewayID == outboxGatewayID else { return nil }
        }
        let transport = self
        return SteelEngineChatSessionMutationRouteLease { key, label, category, pinned, archived, unread in
            let target = transport.sessionTarget(for: key)
            let request = SteelEngineChatGatewayRequests.patchSession(
                sessionKey: target.sessionKey,
                agentID: target.agentID,
                label: label,
                category: category,
                pinned: pinned,
                archived: archived,
                unread: unread)
            _ = try await GatewayConnection.shared.request(
                method: request.method,
                params: request.params,
                timeoutMs: request.timeoutMs,
                ifCurrentServerLease: serverLease)
        }
    }

    func forkSession(parentKey: String) async throws -> String {
        guard let serverLease = await GatewayConnection.shared.captureServerLease() else {
            throw SteelEngineChatTransportSendError.notDispatched
        }
        if let outboxGatewayID {
            let currentGatewayID = await MainActor.run { MacChatTranscriptCache.currentGatewayID() }
            guard currentGatewayID == outboxGatewayID else {
                throw SteelEngineChatTransportSendError.notDispatched
            }
        }
        let target = self.sessionTarget(for: parentKey)
        let request = SteelEngineChatGatewayRequests.forkSession(
            parentSessionKey: target.sessionKey,
            agentID: target.agentID)
        let data = try await GatewayConnection.shared.request(
            method: request.method,
            params: request.params,
            timeoutMs: request.timeoutMs,
            ifCurrentServerLease: serverLease)
        return try JSONDecoder().decode(SteelEngineChatCreateSessionResponse.self, from: data).key
    }
}
