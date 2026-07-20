import Foundation
import Testing
@testable import SteelEngine

struct PushBuildConfigTests {
    @Test func `app store mode derives production relay contract`() {
        let config = PushBuildConfig(infoDictionary: [
            "SteelEnginePushMode": "appStore",
            "SteelEnginePushRelayBaseURL": "https://wrong.example.com",
        ])

        #expect(config.mode == .appStore)
        #expect(config.transport == .relay)
        #expect(config.distribution == .official)
        #expect(config.relayBaseURL?.absoluteString == "https://ios-push-relay.steelengine.ai")
        #expect(config.apnsEnvironment == .production)
        #expect(config.relayProfile == .production)
        #expect(config.proofPolicy == .appleStrict)
    }

    @Test func `simulator sandbox mode derives internal proof contract`() {
        let config = PushBuildConfig(infoDictionary: [
            "SteelEnginePushMode": "simulatorSandbox",
            "SteelEnginePushRelayBaseURL": "https://staging-relay.example.com",
        ])

        #expect(config.mode == .simulatorSandbox)
        #expect(config.transport == .relay)
        #expect(config.distribution == .official)
        #expect(config.relayBaseURL?.absoluteString == "https://staging-relay.example.com")
        #expect(config.apnsEnvironment == .sandbox)
        #expect(config.relayProfile == .simulatorSandbox)
        #expect(config.proofPolicy == .internalSimulator)
    }

    @Test func `local release mode remains direct production push`() {
        let config = PushBuildConfig(infoDictionary: [
            "SteelEnginePushMode": "localProduction",
            "SteelEnginePushRelayBaseURL": "https://ios-push-relay.steelengine.ai",
        ])

        #expect(config.mode == .localProduction)
        #expect(config.transport == .direct)
        #expect(config.distribution == .local)
        #expect(config.relayBaseURL == nil)
        #expect(config.apnsEnvironment == .production)
        #expect(config.relayProfile == .production)
        #expect(config.proofPolicy == .appleStrict)
    }
}
