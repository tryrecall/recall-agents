package ai.steelengine.app.protocol

import org.junit.Assert.assertTrue
import org.junit.Test

class SteelEngineProtocolConstantsTest {
  @Test
  fun generatedCapabilitiesAreUniqueProtocolIds() {
    val values = SteelEngineCapability.entries.map { it.rawValue }

    assertTrue(values.isNotEmpty())
    assertTrue(values.all { it.isNotBlank() && "." !in it })
    assertTrue(values.size == values.toSet().size)
  }

  @Test
  fun generatedCommandGroupsMatchTheirNamespaces() {
    val groups =
      listOf(
        SteelEngineCanvasCommand.NamespacePrefix to SteelEngineCanvasCommand.entries.map { it.rawValue },
        SteelEngineCanvasA2UICommand.NamespacePrefix to SteelEngineCanvasA2UICommand.entries.map { it.rawValue },
        SteelEngineCameraCommand.NamespacePrefix to SteelEngineCameraCommand.entries.map { it.rawValue },
        SteelEngineSmsCommand.NamespacePrefix to SteelEngineSmsCommand.entries.map { it.rawValue },
        SteelEngineTalkCommand.NamespacePrefix to SteelEngineTalkCommand.entries.map { it.rawValue },
        SteelEngineLocationCommand.NamespacePrefix to SteelEngineLocationCommand.entries.map { it.rawValue },
        SteelEngineDeviceCommand.NamespacePrefix to SteelEngineDeviceCommand.entries.map { it.rawValue },
        SteelEngineNotificationsCommand.NamespacePrefix to SteelEngineNotificationsCommand.entries.map { it.rawValue },
        SteelEngineSystemCommand.NamespacePrefix to SteelEngineSystemCommand.entries.map { it.rawValue },
        SteelEnginePhotosCommand.NamespacePrefix to SteelEnginePhotosCommand.entries.map { it.rawValue },
        SteelEngineContactsCommand.NamespacePrefix to SteelEngineContactsCommand.entries.map { it.rawValue },
        SteelEngineCalendarCommand.NamespacePrefix to SteelEngineCalendarCommand.entries.map { it.rawValue },
        SteelEngineMotionCommand.NamespacePrefix to SteelEngineMotionCommand.entries.map { it.rawValue },
        SteelEngineCallLogCommand.NamespacePrefix to SteelEngineCallLogCommand.entries.map { it.rawValue },
      )

    val commands = groups.flatMap { (prefix, values) -> values.onEach { assertTrue(it.startsWith(prefix)) } }
    assertTrue(commands.size == commands.toSet().size)
  }
}
