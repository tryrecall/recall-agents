// Device Pair API module exposes the plugin public contract.
export {
  approveDevicePairing,
  clearDeviceBootstrapTokens,
  issueDeviceBootstrapToken,
  PAIRING_SETUP_BOOTSTRAP_PROFILE,
  listDevicePairing,
  revokeDeviceBootstrapToken,
  type DeviceBootstrapProfile,
} from "steelengine/plugin-sdk/device-bootstrap";
export { definePluginEntry, type SteelEnginePluginApi } from "steelengine/plugin-sdk/plugin-entry";
export {
  resolveGatewayBindUrl,
  resolveGatewayPort,
  resolveTailnetHostWithRunner,
  resolveTailscaleServeGatewayUrlsWithRunner,
} from "steelengine/plugin-sdk/core";
export { resolveAdvertisedLanHost } from "steelengine/plugin-sdk/gateway-runtime";
export {
  resolvePreferredSteelEngineTmpDir,
  runPluginCommandWithTimeout,
} from "steelengine/plugin-sdk/sandbox";
export { renderQrPngBase64, renderQrPngDataUrl, writeQrPngTempFile } from "./qr-image.js";
