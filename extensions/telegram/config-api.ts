// Telegram API module exposes the plugin public contract.
export { buildChannelConfigSchema } from "steelengine/plugin-sdk/channel-config-schema";
export { TelegramConfigSchema } from "steelengine/plugin-sdk/bundled-channel-config-schema";
export {
  normalizeTelegramCommandDescription,
  normalizeTelegramCommandName,
  resolveTelegramCustomCommands,
} from "./src/command-config.js";
