import Foundation
import SteelEngineProtocol
import Testing
@testable import SteelEngineChatUI

struct ChatGatewayRequestTests {
    @Test func `session targets share normalization while preserving platform routing policy`() {
        #expect(SteelEngineChatSessionTarget.resolve(
            " Matrix:Channel:Room ",
            selectedAgentID: " Reviewer ",
            policy: .scopeBareKeysToSelectedAgent) == .init(
            sessionKey: "agent:reviewer:Matrix:Channel:Room",
            agentID: nil))
        #expect(SteelEngineChatSessionTarget.resolve(
            " main ",
            selectedAgentID: " Reviewer ",
            policy: .preserveBareKeys) == .init(sessionKey: "main", agentID: nil))
        #expect(SteelEngineChatSessionTarget.resolve(
            " GLOBAL ",
            selectedAgentID: " Reviewer ",
            policy: .preserveBareKeys) == .init(sessionKey: "GLOBAL", agentID: "reviewer"))
        #expect(SteelEngineChatSessionTarget.resolve(
            "agent:ops:main",
            selectedAgentID: "reviewer",
            policy: .scopeBareKeysToSelectedAgent) == .init(
            sessionKey: "agent:ops:main",
            agentID: nil))
        #expect(SteelEngineChatSessionTarget.resolve(
            "agent::main",
            selectedAgentID: "reviewer",
            policy: .scopeBareKeysToSelectedAgent) == .init(
            sessionKey: "agent::main",
            agentID: nil))
    }

    @Test func `list sessions request normalizes optional filters`() {
        let request = SteelEngineChatGatewayRequests.sessionsList(
            limit: 12,
            search: "  incident  ",
            archived: true)

        #expect(request.method == "sessions.list")
        #expect(request.timeoutMs == 15000)
        #expect(request.params["includeGlobal"]?.value as? Bool == true)
        #expect(request.params["includeUnknown"]?.value as? Bool == false)
        #expect(request.params["limit"]?.value as? Int == 12)
        #expect(request.params["search"]?.value as? String == "incident")
        #expect(request.params["archived"]?.value as? Bool == true)
    }

    @Test func `session patch request preserves explicit null clearing`() {
        let request = SteelEngineChatGatewayRequests.patchSession(
            sessionKey: "global",
            agentID: "reviewer",
            label: .some(nil),
            category: .some(nil),
            pinned: true,
            archived: nil,
            unread: false)

        #expect(request.method == "sessions.patch")
        #expect(request.params["key"]?.value as? String == "global")
        #expect(request.params["agentId"]?.value as? String == "reviewer")
        #expect(request.params["label"]?.value is NSNull)
        #expect(request.params["category"]?.value is NSNull)
        #expect(request.params["pinned"]?.value as? Bool == true)
        #expect(request.params["unread"]?.value as? Bool == false)
        #expect(request.params["archived"] == nil)
    }

    @Test func `settings patch request encodes default model as null`() {
        let request = SteelEngineChatGatewayRequests.patchSessionSettings(
            sessionKey: "agent:main:main",
            agentID: nil,
            model: .some(nil))

        #expect(request.params["model"]?.value is NSNull)
        #expect(request.params["agentId"] == nil)
    }

    @Test func `settings patch request encodes model thinking and verbosity atomically`() {
        let request = SteelEngineChatGatewayRequests.patchSessionSettings(
            sessionKey: "global",
            agentID: "reviewer",
            model: .some("openai/gpt-5.6-sol"),
            thinkingLevel: .some("ultra"),
            verboseLevel: .some("full"))

        #expect(request.method == "sessions.patch")
        #expect(request.params["key"]?.value as? String == "global")
        #expect(request.params["agentId"]?.value as? String == "reviewer")
        #expect(request.params["model"]?.value as? String == "openai/gpt-5.6-sol")
        #expect(request.params["thinkingLevel"]?.value as? String == "ultra")
        #expect(request.params["verboseLevel"]?.value as? String == "full")
    }

    @Test func `settings patch request encodes fast values and explicit resets`() {
        let reset = SteelEngineChatGatewayRequests.patchSessionSettings(
            sessionKey: "main",
            agentID: nil,
            thinkingLevel: .some(nil),
            fastMode: .some(nil),
            verboseLevel: .some(nil))
        let automatic = SteelEngineChatGatewayRequests.patchSessionSettings(
            sessionKey: "main",
            agentID: nil,
            fastMode: .some(.automatic))

        #expect(reset.params["thinkingLevel"]?.value is NSNull)
        #expect(reset.params["fastMode"]?.value is NSNull)
        #expect(reset.params["verboseLevel"]?.value is NSNull)
        #expect(automatic.params["fastMode"]?.value as? String == "auto")
    }

    @Test func `fork and create requests preserve routing identity`() {
        let fork = SteelEngineChatGatewayRequests.forkSession(
            parentSessionKey: "agent:reviewer:telegram:group:1",
            agentID: "reviewer")
        #expect(fork.method == "sessions.create")
        #expect(fork.params["parentSessionKey"]?.value as? String == "agent:reviewer:telegram:group:1")
        #expect(fork.params["agentId"]?.value as? String == "reviewer")
        #expect(fork.params["fork"]?.value as? Bool == true)

        let create = SteelEngineChatGatewayRequests.createSession(
            key: "agent:reviewer:new",
            agentID: "reviewer",
            label: nil,
            parentSessionKey: "global",
            worktree: true)
        #expect(create.params["key"]?.value as? String == "agent:reviewer:new")
        #expect(create.params["agentId"]?.value as? String == "reviewer")
        #expect(create.params["parentSessionKey"]?.value as? String == "global")
        #expect(create.params["worktree"]?.value as? Bool == true)
    }

    @Test func `rename clear archive and fork use session mutation contracts`() {
        let rename = SteelEngineChatGatewayRequests.patchSession(
            sessionKey: "agent:main:child",
            agentID: nil,
            label: .some(nil),
            category: nil,
            pinned: nil,
            archived: nil,
            unread: nil)
        let archive = SteelEngineChatGatewayRequests.patchSession(
            sessionKey: "agent:main:child",
            agentID: nil,
            label: nil,
            category: nil,
            pinned: nil,
            archived: true,
            unread: nil)
        let fork = SteelEngineChatGatewayRequests.forkSession(
            parentSessionKey: "agent:main:child",
            agentID: nil)

        #expect(rename.params["label"]?.value is NSNull)
        #expect(archive.params["archived"]?.value as? Bool == true)
        #expect(fork.method == "sessions.create")
        #expect(fork.params["parentSessionKey"]?.value as? String == "agent:main:child")
        #expect(fork.params["fork"]?.value as? Bool == true)
    }

    @Test func `commands request selects session agent before fallback`() {
        let scoped = SteelEngineChatGatewayRequests.commandsList(
            sessionKey: "agent:reviewer:main",
            fallbackAgentID: "fallback")
        #expect(scoped.params["scope"]?.value as? String == "text")
        #expect(scoped.params["includeArgs"]?.value as? Bool == true)
        #expect(scoped.params["agentId"]?.value as? String == "reviewer")

        let global = SteelEngineChatGatewayRequests.commandsList(
            sessionKey: "global",
            fallbackAgentID: "reviewer")
        #expect(global.params["agentId"]?.value as? String == "reviewer")
    }

    @Test func `send request shares attachment encoding and timeout policy`() throws {
        let request = SteelEngineChatGatewayRequests.sendMessage(
            sessionKey: "global",
            agentID: " reviewer ",
            expectedSessionRoutingContract: " per-sender|main|reviewer ",
            message: "hello",
            thinking: " low ",
            idempotencyKey: "send-1",
            attachments: [.init(type: "image", mimeType: "image/png", fileName: "a.png", content: "abc")])

        #expect(request.method == "chat.send")
        #expect(request.timeoutMs == 30000)
        #expect(request.params["agentId"]?.value as? String == "reviewer")
        #expect(request.params["expectedSessionRoutingContract"]?.value as? String == "per-sender|main|reviewer")
        #expect(request.params["thinking"]?.value as? String == "low")
        #expect(request.params["timeoutMs"] == nil)
        let encoded = try JSONEncoder().encode(request.params["attachments"])
        #expect(String(decoding: encoded, as: UTF8.self).contains("a.png"))
    }

    @Test func `question resolve request preserves nested answer contract`() throws {
        let request = SteelEngineChatGatewayRequests.resolveQuestion(
            id: "ask_123",
            answers: ["meal": ["Pizza", "Salad"]])

        #expect(request.method == "question.resolve")
        let data = try JSONEncoder().encode(request.params)
        let object = try #require(JSONSerialization.jsonObject(with: data) as? [String: Any])
        let answers = try #require(object["answers"] as? [String: Any])
        let values = try #require(answers["answers"] as? [String: Any])
        let meal = try #require(values["meal"] as? [String: Any])
        #expect(meal["answers"] as? [String] == ["Pizza", "Salad"])
    }

    @Test func `long running requests share exact gateway timeout margins`() {
        #expect(SteelEngineChatGatewayRequests.agentWait(runID: "run-1", timeoutMs: 1).timeoutMs == 5001)
        #expect(SteelEngineChatGatewayRequests.agentWait(runID: "run-1", timeoutMs: 30000).timeoutMs == 35000)
        #expect(SteelEngineChatGatewayRequests.compactSession(
            sessionKey: "main",
            agentID: nil).timeoutMs == 0)
    }
}

struct ChatGatewayPayloadCodecTests {
    @Test func `session key extracts canonical agent identity`() {
        #expect(SteelEngineChatSessionKey.agentID(from: " agent:Reviewer:main ") == "Reviewer")
        #expect(SteelEngineChatSessionKey.agentID(from: "agent::main") == nil)
        #expect(SteelEngineChatSessionKey.agentID(from: "global") == nil)
    }

    @Test func `agent wait distinguishes terminal and retryable timeouts`() throws {
        #expect(try SteelEngineChatGatewayPayloadCodec.decodeAgentWaitObservation(
            Data(#"{"status":"completed"}"#.utf8)) == .terminal(.completed))
        #expect(try SteelEngineChatGatewayPayloadCodec.decodeAgentWaitObservation(
            Data(#"{"status":"pending"}"#.utf8)) == .checkAgain)
        #expect(try SteelEngineChatGatewayPayloadCodec.decodeAgentWaitObservation(
            Data(#"{"status":"timeout","timeoutPhase":"queue"}"#.utf8)) == .checkAgain)
        #expect(try SteelEngineChatGatewayPayloadCodec.decodeAgentWaitObservation(
            Data(#"{"status":"timeout","timeoutPhase":"provider"}"#.utf8)) ==
            .terminal(.failed(message: "Run timed out")))
    }

    @Test func `routing identity decodes agent and canonical contract`() throws {
        let identity = try SteelEngineChatGatewayPayloadCodec.decodeSessionRoutingIdentity(
            Data(#"{"defaultId":"Work","mainKey":"Primary","scope":"global","agents":[]}"#.utf8))

        #expect(identity.defaultAgentID == "work")
        #expect(identity.contract == "global|primary|work")
    }

    @Test func `model choices preserve metadata and replace blank names`() throws {
        let choices = try SteelEngineChatGatewayPayloadCodec.decodeModelChoices(Data(
            #"{"models":[{"id":"gpt-5","name":"  ","provider":"openai","contextWindow":200000,"reasoning":true}]}"#
                .utf8))

        #expect(choices == [SteelEngineChatModelChoice(
            modelID: "gpt-5",
            name: "gpt-5",
            provider: "openai",
            contextWindow: 200_000,
            reasoning: true)])
    }

    @Test func `command choice normalizes source aliases and identity`() {
        let choice = SteelEngineChatGatewayPayloadCodec.commandChoice(CommandEntry(
            name: "review",
            textaliases: [" /review ", ""],
            description: "Review changes",
            source: AnyCodable("plugin"),
            scope: AnyCodable("text"),
            acceptsargs: true))

        #expect(choice.id == "plugin:review:/review")
        #expect(choice.textAliases == ["/review"])
        #expect(choice.source == .plugin)
        #expect(choice.acceptsArgs)
    }

    @Test func `event frames map to shared chat transport events`() {
        let sessionsChanged = EventFrame(
            type: "event",
            event: "sessions.changed",
            payload: AnyCodable([
                "sessionKey": AnyCodable("agent:main:main"),
                "agentId": AnyCodable("main"),
                "reason": AnyCodable("command-metadata"),
            ]))
        guard case let .sessionsChanged(change) = SteelEngineChatGatewayPayloadCodec.event(from: sessionsChanged)
        else {
            Issue.record("expected sessionsChanged")
            return
        }
        #expect(change == .init(
            sessionKey: "agent:main:main",
            agentId: "main",
            reason: "command-metadata"))

        let chat = EventFrame(
            type: "event",
            event: "chat",
            payload: AnyCodable([
                "runId": AnyCodable("run-1"),
                "sessionKey": AnyCodable("main"),
                "state": AnyCodable("final"),
            ]))
        guard case let .chat(payload) = SteelEngineChatGatewayPayloadCodec.event(from: chat) else {
            Issue.record("expected chat")
            return
        }
        #expect(payload.runId == "run-1")
        #expect(payload.sessionKey == "main")
        #expect(payload.state == "final")
        #expect(SteelEngineChatGatewayPayloadCodec.event(from: EventFrame(
            type: "event",
            event: "unknown")) == nil)
    }
}
