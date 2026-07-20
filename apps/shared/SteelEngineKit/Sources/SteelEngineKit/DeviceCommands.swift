import Foundation

public enum SteelEngineDeviceCommand: String, Codable, Sendable {
    case status = "device.status"
    case info = "device.info"
}

public enum SteelEngineBatteryState: String, Codable, Sendable {
    case unknown
    case unplugged
    case charging
    case full
}

public enum SteelEngineThermalState: String, Codable, Sendable {
    case nominal
    case fair
    case serious
    case critical
}

public enum SteelEngineNetworkPathStatus: String, Codable, Sendable {
    case satisfied
    case unsatisfied
    case requiresConnection
}

public enum SteelEngineNetworkInterfaceType: String, Codable, Sendable {
    case wifi
    case cellular
    case wired
    case other
}

public struct SteelEngineBatteryStatusPayload: Codable, Sendable, Equatable {
    public var level: Double?
    public var state: SteelEngineBatteryState
    public var lowPowerModeEnabled: Bool

    public init(level: Double?, state: SteelEngineBatteryState, lowPowerModeEnabled: Bool) {
        self.level = level
        self.state = state
        self.lowPowerModeEnabled = lowPowerModeEnabled
    }
}

public struct SteelEngineThermalStatusPayload: Codable, Sendable, Equatable {
    public var state: SteelEngineThermalState

    public init(state: SteelEngineThermalState) {
        self.state = state
    }
}

public struct SteelEngineStorageStatusPayload: Codable, Sendable, Equatable {
    public var totalBytes: Int64
    public var freeBytes: Int64
    public var usedBytes: Int64

    public init(totalBytes: Int64, freeBytes: Int64, usedBytes: Int64) {
        self.totalBytes = totalBytes
        self.freeBytes = freeBytes
        self.usedBytes = usedBytes
    }
}

public struct SteelEngineNetworkStatusPayload: Codable, Sendable, Equatable {
    public var status: SteelEngineNetworkPathStatus
    public var isExpensive: Bool
    public var isConstrained: Bool
    public var interfaces: [SteelEngineNetworkInterfaceType]

    public init(
        status: SteelEngineNetworkPathStatus,
        isExpensive: Bool,
        isConstrained: Bool,
        interfaces: [SteelEngineNetworkInterfaceType])
    {
        self.status = status
        self.isExpensive = isExpensive
        self.isConstrained = isConstrained
        self.interfaces = interfaces
    }
}

public struct SteelEngineDeviceStatusPayload: Codable, Sendable, Equatable {
    public var battery: SteelEngineBatteryStatusPayload
    public var thermal: SteelEngineThermalStatusPayload
    public var storage: SteelEngineStorageStatusPayload
    public var network: SteelEngineNetworkStatusPayload
    public var uptimeSeconds: Double

    public init(
        battery: SteelEngineBatteryStatusPayload,
        thermal: SteelEngineThermalStatusPayload,
        storage: SteelEngineStorageStatusPayload,
        network: SteelEngineNetworkStatusPayload,
        uptimeSeconds: Double)
    {
        self.battery = battery
        self.thermal = thermal
        self.storage = storage
        self.network = network
        self.uptimeSeconds = uptimeSeconds
    }
}

public struct SteelEngineDeviceInfoPayload: Codable, Sendable, Equatable {
    public var deviceName: String
    public var modelIdentifier: String
    public var systemName: String
    public var systemVersion: String
    public var appVersion: String
    public var appBuild: String
    public var locale: String

    public init(
        deviceName: String,
        modelIdentifier: String,
        systemName: String,
        systemVersion: String,
        appVersion: String,
        appBuild: String,
        locale: String)
    {
        self.deviceName = deviceName
        self.modelIdentifier = modelIdentifier
        self.systemName = systemName
        self.systemVersion = systemVersion
        self.appVersion = appVersion
        self.appBuild = appBuild
        self.locale = locale
    }
}
