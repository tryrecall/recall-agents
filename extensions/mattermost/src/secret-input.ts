// Mattermost plugin module implements secret input behavior.
export type { SecretInput } from "steelengine/plugin-sdk/secret-input";
export {
  buildSecretInputSchema,
  hasConfiguredSecretInput,
  normalizeResolvedSecretInputString,
  normalizeSecretInputString,
} from "steelengine/plugin-sdk/secret-input";
