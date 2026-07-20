import AVFoundation
import Contacts
import CoreLocation
import CoreMotion
import EventKit
import Foundation
import SteelEngineKit
import ReplayKit
import Speech
import UIKit

struct GatewayManualTransportPresentation: Equatable {
    let requiresTLS: Bool
    let effectiveTLS: Bool
    let helperText: String?
}

extension GatewayConnectionController {
    func buildGatewayURL(host: String, port: Int, useTLS: Bool) -> URL? {
        let scheme = useTLS ? "wss" : "ws"
        var components = URLComponents()
        components.scheme = scheme
        components.host = host
        components.port = port
        return components.url
    }

    func resolveManualUseTLS(host: String, useTLS: Bool) -> Bool {
        Self.manualTransportPresentation(
            host: host,
            requestedTLS: useTLS).effectiveTLS
    }

    static func manualTransportPresentation(
        host: String,
        requestedTLS: Bool) -> GatewayManualTransportPresentation
    {
        let trimmedHost = host.trimmingCharacters(in: .whitespacesAndNewlines)
        let requiresTLS = !trimmedHost.isEmpty && !LoopbackHost.isLocalNetworkHost(trimmedHost)
        let effectiveTLS = requestedTLS || requiresTLS
        let helperText: String? = if requiresTLS {
            String(localized: "Secure connection is required for this host.")
        } else if effectiveTLS {
            nil
        } else {
            String(localized: "Use only on a trusted private network.")
        }
        return GatewayManualTransportPresentation(
            requiresTLS: requiresTLS,
            effectiveTLS: effectiveTLS,
            helperText: helperText)
    }

    func manualStableID(host: String, port: Int) -> String {
        ManualAuthOverride.manualStableID(host: host, port: port)
    }

    func makeConnectOptions(
        stableID: String?,
        deviceAuthGatewayID: String?,
        allowStoredDeviceAuth: Bool = true) async -> GatewayConnectOptions
    {
        let defaults = UserDefaults.standard
        let displayName = self.resolvedDisplayName(defaults: defaults)
        let resolvedClientId = self.resolvedClientId(defaults: defaults, stableID: stableID)
        let permissions = await self.currentPermissions()

        return GatewayConnectOptions(
            role: "node",
            scopes: [],
            caps: self.currentCaps(),
            commands: self.currentCommands(),
            permissions: permissions,
            clientId: resolvedClientId,
            clientMode: "node",
            clientDisplayName: displayName,
            allowStoredDeviceAuth: allowStoredDeviceAuth,
            deviceAuthGatewayID: GatewayStableIdentifier.exact(deviceAuthGatewayID))
    }

    private func resolvedClientId(defaults: UserDefaults, stableID: String?) -> String {
        if let stableID,
           let override = GatewaySettingsStore.loadGatewayClientIdOverride(stableID: stableID)
        {
            return override
        }
        let manualClientId = defaults.string(forKey: "gateway.manual.clientId")?
            .trimmingCharacters(in: .whitespacesAndNewlines)
        if manualClientId?.isEmpty == false {
            return manualClientId!
        }
        return "steelengine-ios"
    }

    private func resolvedDisplayName(defaults: UserDefaults) -> String {
        let key = "node.displayName"
        let existingRaw = defaults.string(forKey: key)
        let resolved = NodeDisplayName.resolve(
            existing: existingRaw,
            deviceName: UIDevice.current.name,
            interfaceIdiom: UIDevice.current.userInterfaceIdiom)
        let existing = existingRaw?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        if existing.isEmpty || NodeDisplayName.isGeneric(existing) {
            defaults.set(resolved, forKey: key)
        }
        return resolved
    }

    private func currentCaps() -> [String] {
        var caps = [
            SteelEngineCapability.canvas.rawValue,
            SteelEngineCapability.screen.rawValue,
        ]

        // Default-on: if the key doesn't exist yet, treat it as enabled.
        let cameraEnabled =
            UserDefaults.standard.object(forKey: "camera.enabled") == nil
                ? true
                : UserDefaults.standard.bool(forKey: "camera.enabled")
        if cameraEnabled { caps.append(SteelEngineCapability.camera.rawValue) }

        let voiceWakeEnabled = UserDefaults.standard.bool(forKey: VoiceWakePreferences.enabledKey)
        if voiceWakeEnabled { caps.append(SteelEngineCapability.voiceWake.rawValue) }

        let locationModeRaw = UserDefaults.standard.string(forKey: "location.enabledMode") ?? "off"
        let locationMode = SteelEngineLocationMode(rawValue: locationModeRaw) ?? .off
        if locationMode != .off { caps.append(SteelEngineCapability.location.rawValue) }

        caps.append(SteelEngineCapability.device.rawValue)
        caps.append(SteelEngineCapability.talk.rawValue)
        if WatchMessagingService.isSupportedOnDevice() {
            caps.append(SteelEngineCapability.watch.rawValue)
        }
        caps.append(SteelEngineCapability.photos.rawValue)
        caps.append(SteelEngineCapability.contacts.rawValue)
        caps.append(SteelEngineCapability.calendar.rawValue)
        caps.append(SteelEngineCapability.reminders.rawValue)
        if Self.motionAvailable() {
            caps.append(SteelEngineCapability.motion.rawValue)
        }
        if HealthAuthorization.isEnabled {
            caps.append(SteelEngineCapability.health.rawValue)
        }

        return caps
    }

    private func currentCommands() -> [String] {
        var commands: [String] = [
            SteelEngineCanvasCommand.present.rawValue,
            SteelEngineCanvasCommand.hide.rawValue,
            SteelEngineCanvasCommand.navigate.rawValue,
            SteelEngineCanvasCommand.evalJS.rawValue,
            SteelEngineCanvasCommand.snapshot.rawValue,
            SteelEngineCanvasA2UICommand.push.rawValue,
            SteelEngineCanvasA2UICommand.pushJSONL.rawValue,
            SteelEngineCanvasA2UICommand.reset.rawValue,
            SteelEngineScreenCommand.record.rawValue,
            SteelEngineSystemCommand.notify.rawValue,
            SteelEngineChatCommand.push.rawValue,
            SteelEngineTalkCommand.pttStart.rawValue,
            SteelEngineTalkCommand.pttStop.rawValue,
            SteelEngineTalkCommand.pttCancel.rawValue,
            SteelEngineTalkCommand.pttOnce.rawValue,
        ]

        let caps = Set(self.currentCaps())
        if caps.contains(SteelEngineCapability.camera.rawValue) {
            commands.append(SteelEngineCameraCommand.list.rawValue)
            commands.append(SteelEngineCameraCommand.snap.rawValue)
            commands.append(SteelEngineCameraCommand.clip.rawValue)
        }
        if caps.contains(SteelEngineCapability.location.rawValue) {
            commands.append(SteelEngineLocationCommand.get.rawValue)
        }
        if caps.contains(SteelEngineCapability.device.rawValue) {
            commands.append(SteelEngineDeviceCommand.status.rawValue)
            commands.append(SteelEngineDeviceCommand.info.rawValue)
        }
        if caps.contains(SteelEngineCapability.watch.rawValue) {
            commands.append(SteelEngineWatchCommand.status.rawValue)
            commands.append(SteelEngineWatchCommand.notify.rawValue)
        }
        if caps.contains(SteelEngineCapability.photos.rawValue) {
            commands.append(SteelEnginePhotosCommand.latest.rawValue)
        }
        if caps.contains(SteelEngineCapability.contacts.rawValue) {
            commands.append(SteelEngineContactsCommand.search.rawValue)
            commands.append(SteelEngineContactsCommand.add.rawValue)
        }
        if caps.contains(SteelEngineCapability.calendar.rawValue) {
            commands.append(SteelEngineCalendarCommand.events.rawValue)
            commands.append(SteelEngineCalendarCommand.add.rawValue)
        }
        if caps.contains(SteelEngineCapability.reminders.rawValue) {
            commands.append(SteelEngineRemindersCommand.list.rawValue)
            commands.append(SteelEngineRemindersCommand.add.rawValue)
        }
        if caps.contains(SteelEngineCapability.motion.rawValue) {
            commands.append(SteelEngineMotionCommand.activity.rawValue)
            commands.append(SteelEngineMotionCommand.pedometer.rawValue)
        }
        if caps.contains(SteelEngineCapability.health.rawValue) {
            commands.append(SteelEngineHealthCommand.summary.rawValue)
        }

        return commands
    }

    private func currentPermissions() async -> [String: Bool] {
        var permissions: [String: Bool] = [:]
        permissions["camera"] = AVCaptureDevice.authorizationStatus(for: .video) == .authorized
        permissions["microphone"] = AVCaptureDevice.authorizationStatus(for: .audio) == .authorized
        permissions["speechRecognition"] = SFSpeechRecognizer.authorizationStatus() == .authorized
        let locationStatus = CLLocationManager().authorizationStatus
        let locationServicesEnabled = await Self.locationServicesEnabled()
        permissions["location"] = Self.isLocationAvailable(
            servicesEnabled: locationServicesEnabled,
            status: locationStatus)
        permissions["screenRecording"] = RPScreenRecorder.shared().isAvailable

        permissions["photos"] = PhotoLibraryAccess.canRead(PhotoLibraryAccess.authorizationStatus())
        let contactsStatus = CNContactStore.authorizationStatus(for: .contacts)
        permissions["contacts"] = contactsStatus == .authorized || contactsStatus == .limited

        let calendarStatus = EKEventStore.authorizationStatus(for: .event)
        permissions["calendar"] = Self.hasEventKitReadAccess(calendarStatus)
        let remindersStatus = EKEventStore.authorizationStatus(for: .reminder)
        permissions["reminders"] = Self.hasEventKitReadAccess(remindersStatus)

        let motionStatus = CMMotionActivityManager.authorizationStatus()
        let pedometerStatus = CMPedometer.authorizationStatus()
        permissions["motion"] =
            motionStatus == .authorized || pedometerStatus == .authorized

        return permissions
    }

    private static func locationServicesEnabled() async -> Bool {
        await Task.detached(priority: .utility) {
            CLLocationManager.locationServicesEnabled()
        }.value
    }

    private static func isLocationAvailable(servicesEnabled: Bool, status: CLAuthorizationStatus) -> Bool {
        guard servicesEnabled else { return false }
        switch status {
        case .authorizedAlways, .authorizedWhenInUse:
            return true
        default:
            return false
        }
    }

    private static func hasEventKitReadAccess(_ status: EKAuthorizationStatus) -> Bool {
        status == .fullAccess
    }

    private static func motionAvailable() -> Bool {
        CMMotionActivityManager.isActivityAvailable() || CMPedometer.isStepCountingAvailable()
    }
}

#if DEBUG
extension GatewayConnectionController {
    func _test_resolvedDisplayName(defaults: UserDefaults) -> String {
        self.resolvedDisplayName(defaults: defaults)
    }

    func _test_currentCaps() -> [String] {
        self.currentCaps()
    }

    func _test_currentCommands() -> [String] {
        self.currentCommands()
    }

    func _test_currentPermissions() async -> [String: Bool] {
        await self.currentPermissions()
    }

    static func _test_hasEventKitReadAccess(_ status: EKAuthorizationStatus) -> Bool {
        self.hasEventKitReadAccess(status)
    }

    static func _test_isLocationAvailable(servicesEnabled: Bool, status: CLAuthorizationStatus) -> Bool {
        self.isLocationAvailable(servicesEnabled: servicesEnabled, status: status)
    }

    func _test_resolveManualUseTLS(host: String, useTLS: Bool) -> Bool {
        self.resolveManualUseTLS(host: host, useTLS: useTLS)
    }
}
#endif
