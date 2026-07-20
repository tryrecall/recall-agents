// Matrix API module exposes the plugin public contract.
export {
  DEFAULT_ACCOUNT_ID,
  normalizeAccountId,
  normalizeOptionalAccountId,
} from "steelengine/plugin-sdk/account-id";
export {
  createActionGate,
  jsonResult,
  readNumberParam,
  readPositiveIntegerParam,
  readReactionParams,
  readStringArrayParam,
  readStringParam,
  ToolAuthorizationError,
} from "steelengine/plugin-sdk/channel-actions";
export { buildChannelConfigSchema } from "steelengine/plugin-sdk/channel-config-schema";
export type { ChannelPlugin } from "steelengine/plugin-sdk/channel-core";
export type {
  BaseProbeResult,
  ChannelDirectoryEntry,
  ChannelGroupContext,
  ChannelMessageActionAdapter,
  ChannelMessageActionContext,
  ChannelMessageActionName,
  ChannelMessageToolDiscovery,
  ChannelOutboundAdapter,
  ChannelResolveKind,
  ChannelResolveResult,
  ChannelToolSend,
} from "steelengine/plugin-sdk/channel-contract";
export {
  formatLocationText,
  toLocationContext,
  type NormalizedLocation,
} from "steelengine/plugin-sdk/channel-inbound";
export { logInboundDrop } from "steelengine/plugin-sdk/channel-inbound";
export { logTypingFailure } from "steelengine/plugin-sdk/channel-outbound";
export { resolveAckReaction } from "steelengine/plugin-sdk/channel-feedback";
export type { ChannelSetupInput } from "steelengine/plugin-sdk/setup";
export type {
  SteelEngineConfig,
  ContextVisibilityMode,
  DmPolicy,
  GroupPolicy,
} from "steelengine/plugin-sdk/config-contracts";
export type { GroupToolPolicyConfig } from "steelengine/plugin-sdk/config-contracts";
export type { WizardPrompter } from "steelengine/plugin-sdk/setup";
export type { SecretInput } from "steelengine/plugin-sdk/secret-input";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "steelengine/plugin-sdk/runtime-group-policy";
export {
  addWildcardAllowFrom,
  formatDocsLink,
  hasConfiguredSecretInput,
  mergeAllowFromEntries,
  moveSingleAccountChannelSectionToDefaultAccount,
  promptAccountId,
  promptChannelAccessConfig,
  splitSetupEntries,
} from "steelengine/plugin-sdk/setup";
export type { RuntimeEnv } from "steelengine/plugin-sdk/runtime";
export {
  assertHttpUrlTargetsPrivateNetwork,
  closeDispatcher,
  createPinnedDispatcher,
  isPrivateOrLoopbackHost,
  resolvePinnedHostnameWithPolicy,
  ssrfPolicyFromDangerouslyAllowPrivateNetwork,
  type LookupFn,
  type SsrFPolicy,
} from "steelengine/plugin-sdk/ssrf-runtime";
export {
  ensureConfiguredAcpBindingReady,
  resolveConfiguredAcpBindingRecord,
} from "steelengine/plugin-sdk/acp-binding-runtime";
export {
  buildProbeChannelStatusSummary,
  collectStatusIssuesFromLastError,
  PAIRING_APPROVED_MESSAGE,
} from "steelengine/plugin-sdk/channel-status";
export {
  getSessionBindingService,
  resolveThreadBindingIdleTimeoutMsForChannel,
  resolveThreadBindingMaxAgeMsForChannel,
} from "steelengine/plugin-sdk/conversation-runtime";
export { resolveOutboundSendDep } from "steelengine/plugin-sdk/channel-outbound";
export { resolveAgentIdFromSessionKey } from "steelengine/plugin-sdk/routing";
export { chunkTextForOutbound } from "steelengine/plugin-sdk/text-chunking";
export { createChannelMessageReplyPipeline } from "steelengine/plugin-sdk/channel-outbound";
export { loadOutboundMediaFromUrl } from "steelengine/plugin-sdk/outbound-media";
export { normalizePollInput, type PollInput } from "steelengine/plugin-sdk/poll-runtime";
export { writeJsonFileAtomically } from "steelengine/plugin-sdk/json-store";
export {
  buildChannelKeyCandidates,
  resolveChannelEntryMatch,
} from "steelengine/plugin-sdk/channel-targets";
export { buildTimeoutAbortSignal } from "./matrix/sdk/timeout-abort-signal.js";
export { formatZonedTimestamp } from "steelengine/plugin-sdk/time-runtime";
export type { PluginRuntime, RuntimeLogger } from "steelengine/plugin-sdk/plugin-runtime";
export type { ReplyPayload } from "steelengine/plugin-sdk/reply-runtime";
// resolveMatrixAccountStringValues already comes from the Matrix API barrel.
// Re-exporting auth-precedence here makes TS source loaders define the export twice.
