package ai.steelengine.app.node

import ai.steelengine.app.protocol.SteelEngineCalendarCommand
import ai.steelengine.app.protocol.SteelEngineCallLogCommand
import ai.steelengine.app.protocol.SteelEngineCameraCommand
import ai.steelengine.app.protocol.SteelEngineCapability
import ai.steelengine.app.protocol.SteelEngineContactsCommand
import ai.steelengine.app.protocol.SteelEngineDeviceCommand
import ai.steelengine.app.protocol.SteelEngineLocationCommand
import ai.steelengine.app.protocol.SteelEngineMotionCommand
import ai.steelengine.app.protocol.SteelEngineNotificationsCommand
import ai.steelengine.app.protocol.SteelEnginePhotosCommand
import ai.steelengine.app.protocol.SteelEngineSmsCommand
import ai.steelengine.app.protocol.SteelEngineSystemCommand
import ai.steelengine.app.protocol.SteelEngineTalkCommand
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class InvokeCommandRegistryTest {
  private val coreCapabilities =
    setOf(
      SteelEngineCapability.Canvas.rawValue,
      SteelEngineCapability.Device.rawValue,
      SteelEngineCapability.Notifications.rawValue,
      SteelEngineCapability.System.rawValue,
      SteelEngineCapability.Talk.rawValue,
      SteelEngineCapability.Contacts.rawValue,
      SteelEngineCapability.Calendar.rawValue,
    )

  private val optionalCapabilities =
    setOf(
      SteelEngineCapability.Camera.rawValue,
      SteelEngineCapability.Location.rawValue,
      SteelEngineCapability.Sms.rawValue,
      SteelEngineCapability.CallLog.rawValue,
      SteelEngineCapability.Motion.rawValue,
      SteelEngineCapability.Photos.rawValue,
      SteelEngineCapability.VoiceWake.rawValue,
    )

  private val coreCommands =
    setOf(
      SteelEngineDeviceCommand.Status.rawValue,
      SteelEngineDeviceCommand.Info.rawValue,
      SteelEngineDeviceCommand.Permissions.rawValue,
      SteelEngineDeviceCommand.Health.rawValue,
      SteelEngineNotificationsCommand.List.rawValue,
      SteelEngineNotificationsCommand.Actions.rawValue,
      SteelEngineSystemCommand.Notify.rawValue,
      SteelEngineTalkCommand.PttStart.rawValue,
      SteelEngineTalkCommand.PttStop.rawValue,
      SteelEngineTalkCommand.PttCancel.rawValue,
      SteelEngineTalkCommand.PttOnce.rawValue,
      SteelEngineContactsCommand.Search.rawValue,
      SteelEngineContactsCommand.Add.rawValue,
      SteelEngineCalendarCommand.Events.rawValue,
      SteelEngineCalendarCommand.Add.rawValue,
    )

  private val optionalCommands =
    setOf(
      SteelEngineCameraCommand.Snap.rawValue,
      SteelEngineCameraCommand.Clip.rawValue,
      SteelEngineCameraCommand.List.rawValue,
      SteelEngineLocationCommand.Get.rawValue,
      SteelEngineMotionCommand.Activity.rawValue,
      SteelEngineMotionCommand.Pedometer.rawValue,
      SteelEngineSmsCommand.Send.rawValue,
      SteelEngineSmsCommand.Search.rawValue,
      SteelEngineCallLogCommand.Search.rawValue,
      SteelEnginePhotosCommand.Latest.rawValue,
    )

  private val debugCommands = setOf("debug.logs", "debug.ed25519")

  @Test
  fun advertisedCapabilities_respectsFeatureAvailability() {
    val capabilities = InvokeCommandRegistry.advertisedCapabilities(defaultFlags())

    assertContainsAll(capabilities, coreCapabilities)
    assertMissingAll(capabilities, optionalCapabilities)
  }

  @Test
  fun advertisedCapabilities_includesFeatureCapabilitiesWhenEnabled() {
    val capabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(
          cameraEnabled = true,
          locationEnabled = true,
          sendSmsAvailable = true,
          readSmsAvailable = true,
          smsSearchPossible = true,
          callLogAvailable = true,
          photosAvailable = true,
          motionActivityAvailable = true,
          motionPedometerAvailable = true,
          voiceWakeEnabled = true,
        ),
      )

    assertContainsAll(capabilities, coreCapabilities + optionalCapabilities)
  }

  @Test
  fun advertisedCommands_respectsFeatureAvailability() {
    val commands = InvokeCommandRegistry.advertisedCommands(defaultFlags())

    assertContainsAll(commands, coreCommands)
    assertMissingAll(commands, optionalCommands + debugCommands)
  }

  @Test
  fun advertisedCommands_includesDeviceAppsOnlyWhenUserOptedIn() {
    val disabled = InvokeCommandRegistry.advertisedCommands(defaultFlags(installedAppsSharingEnabled = false))
    val enabled = InvokeCommandRegistry.advertisedCommands(defaultFlags(installedAppsSharingEnabled = true))

    assertFalse(disabled.contains(SteelEngineDeviceCommand.Apps.rawValue))
    assertTrue(enabled.contains(SteelEngineDeviceCommand.Apps.rawValue))
  }

  @Test
  fun advertisedCommands_includesFeatureCommandsWhenEnabled() {
    val commands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(
          cameraEnabled = true,
          locationEnabled = true,
          sendSmsAvailable = true,
          readSmsAvailable = true,
          smsSearchPossible = true,
          callLogAvailable = true,
          photosAvailable = true,
          motionActivityAvailable = true,
          motionPedometerAvailable = true,
          debugBuild = true,
        ),
      )

    assertContainsAll(commands, coreCommands + optionalCommands + debugCommands)
  }

  @Test
  fun advertisedCommands_onlyIncludesSupportedMotionCommands() {
    val commands =
      InvokeCommandRegistry.advertisedCommands(
        NodeRuntimeFlags(
          cameraEnabled = false,
          locationEnabled = false,
          sendSmsAvailable = false,
          readSmsAvailable = false,
          smsSearchPossible = false,
          callLogAvailable = false,
          photosAvailable = false,
          motionActivityAvailable = true,
          motionPedometerAvailable = false,
          installedAppsSharingEnabled = false,
          debugBuild = false,
        ),
      )

    assertTrue(commands.contains(SteelEngineMotionCommand.Activity.rawValue))
    assertFalse(commands.contains(SteelEngineMotionCommand.Pedometer.rawValue))
  }

  @Test
  fun advertisedCommands_splitsSmsSendAndSearchAvailability() {
    val readOnlyCommands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(readSmsAvailable = true, smsSearchPossible = true),
      )
    val sendOnlyCommands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(sendSmsAvailable = true),
      )
    val requestableSearchCommands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(smsSearchPossible = true),
      )

    assertTrue(readOnlyCommands.contains(SteelEngineSmsCommand.Search.rawValue))
    assertFalse(readOnlyCommands.contains(SteelEngineSmsCommand.Send.rawValue))
    assertTrue(sendOnlyCommands.contains(SteelEngineSmsCommand.Send.rawValue))
    assertFalse(sendOnlyCommands.contains(SteelEngineSmsCommand.Search.rawValue))
    assertTrue(requestableSearchCommands.contains(SteelEngineSmsCommand.Search.rawValue))
  }

  @Test
  fun advertisedCapabilities_includeSmsWhenEitherSmsPathIsAvailable() {
    val readOnlyCapabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(readSmsAvailable = true),
      )
    val sendOnlyCapabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(sendSmsAvailable = true),
      )
    val requestableSearchCapabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(smsSearchPossible = true),
      )

    assertTrue(readOnlyCapabilities.contains(SteelEngineCapability.Sms.rawValue))
    assertTrue(sendOnlyCapabilities.contains(SteelEngineCapability.Sms.rawValue))
    assertFalse(requestableSearchCapabilities.contains(SteelEngineCapability.Sms.rawValue))
  }

  @Test
  fun advertisedCommands_excludesCallLogWhenUnavailable() {
    val commands = InvokeCommandRegistry.advertisedCommands(defaultFlags(callLogAvailable = false))

    assertFalse(commands.contains(SteelEngineCallLogCommand.Search.rawValue))
  }

  @Test
  fun advertisedCapabilities_excludesCallLogWhenUnavailable() {
    val capabilities = InvokeCommandRegistry.advertisedCapabilities(defaultFlags(callLogAvailable = false))

    assertFalse(capabilities.contains(SteelEngineCapability.CallLog.rawValue))
  }

  @Test
  fun advertisedPhotosSurface_respectsFeatureAvailability() {
    val disabledFlags = defaultFlags(photosAvailable = false)
    val enabledFlags = defaultFlags(photosAvailable = true)

    assertFalse(InvokeCommandRegistry.advertisedCapabilities(disabledFlags).contains(SteelEngineCapability.Photos.rawValue))
    assertFalse(InvokeCommandRegistry.advertisedCommands(disabledFlags).contains(SteelEnginePhotosCommand.Latest.rawValue))
    assertTrue(InvokeCommandRegistry.advertisedCapabilities(enabledFlags).contains(SteelEngineCapability.Photos.rawValue))
    assertTrue(InvokeCommandRegistry.advertisedCommands(enabledFlags).contains(SteelEnginePhotosCommand.Latest.rawValue))
  }

  @Test
  fun find_returnsForegroundMetadataForCameraCommands() {
    val list = InvokeCommandRegistry.find(SteelEngineCameraCommand.List.rawValue)
    val location = InvokeCommandRegistry.find(SteelEngineLocationCommand.Get.rawValue)
    val pttStart = InvokeCommandRegistry.find(SteelEngineTalkCommand.PttStart.rawValue)
    val pttStop = InvokeCommandRegistry.find(SteelEngineTalkCommand.PttStop.rawValue)
    val pttCancel = InvokeCommandRegistry.find(SteelEngineTalkCommand.PttCancel.rawValue)
    val pttOnce = InvokeCommandRegistry.find(SteelEngineTalkCommand.PttOnce.rawValue)

    assertNotNull(list)
    assertEquals(true, list?.requiresForeground)
    assertNotNull(location)
    assertEquals(false, location?.requiresForeground)
    assertNotNull(pttStart)
    assertEquals(false, pttStart?.requiresForeground)
    assertNotNull(pttStop)
    assertEquals(false, pttStop?.requiresForeground)
    assertNotNull(pttCancel)
    assertEquals(false, pttCancel?.requiresForeground)
    assertNotNull(pttOnce)
    assertEquals(true, pttOnce?.requiresForeground)
  }

  @Test
  fun find_returnsNullForUnknownCommand() {
    assertNull(InvokeCommandRegistry.find("not.real"))
  }

  private fun defaultFlags(
    cameraEnabled: Boolean = false,
    locationEnabled: Boolean = false,
    sendSmsAvailable: Boolean = false,
    readSmsAvailable: Boolean = false,
    smsSearchPossible: Boolean = false,
    callLogAvailable: Boolean = false,
    photosAvailable: Boolean = false,
    motionActivityAvailable: Boolean = false,
    motionPedometerAvailable: Boolean = false,
    installedAppsSharingEnabled: Boolean = false,
    debugBuild: Boolean = false,
    voiceWakeEnabled: Boolean = false,
  ): NodeRuntimeFlags =
    NodeRuntimeFlags(
      cameraEnabled = cameraEnabled,
      locationEnabled = locationEnabled,
      sendSmsAvailable = sendSmsAvailable,
      readSmsAvailable = readSmsAvailable,
      smsSearchPossible = smsSearchPossible,
      callLogAvailable = callLogAvailable,
      photosAvailable = photosAvailable,
      motionActivityAvailable = motionActivityAvailable,
      motionPedometerAvailable = motionPedometerAvailable,
      installedAppsSharingEnabled = installedAppsSharingEnabled,
      debugBuild = debugBuild,
      voiceWakeEnabled = voiceWakeEnabled,
    )

  private fun assertContainsAll(
    actual: List<String>,
    expected: Set<String>,
  ) {
    expected.forEach { value -> assertTrue(actual.contains(value)) }
  }

  private fun assertMissingAll(
    actual: List<String>,
    forbidden: Set<String>,
  ) {
    forbidden.forEach { value -> assertFalse(actual.contains(value)) }
  }
}
