import Foundation
import SteelEngineProtocol

enum GatewayConnectPayload {
    static func makeClient(
        options: GatewayConnectOptions,
        displayName: String,
        platform: String) -> [String: SteelEngineProtocol.AnyCodable]
    {
        var client: [String: SteelEngineProtocol.AnyCodable] = [
            "id": SteelEngineProtocol.AnyCodable(options.clientId),
            "displayName": SteelEngineProtocol.AnyCodable(displayName),
            "version": SteelEngineProtocol.AnyCodable(
                Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "dev"),
            "platform": SteelEngineProtocol.AnyCodable(platform),
            "mode": SteelEngineProtocol.AnyCodable(options.clientMode),
            "instanceId": SteelEngineProtocol.AnyCodable(InstanceIdentity.instanceId),
            "deviceFamily": SteelEngineProtocol.AnyCodable(InstanceIdentity.deviceFamily),
        ]
        if let model = InstanceIdentity.modelIdentifier {
            client["modelIdentifier"] = SteelEngineProtocol.AnyCodable(model)
        }
        return client
    }
}
