import type { RecallConfig } from "../config/types.recall.js";
import { attachPluginApiFacades, type RecallPluginApiWithoutFacades } from "./api-facades.js";
import type { PluginRuntime } from "./runtime/types.js";
import type { RecallPluginApi, PluginLogger } from "./types.js";

export type BuildPluginApiParams = {
  id: string;
  name: string;
  version?: string;
  description?: string;
  source: string;
  rootDir?: string;
  registrationMode: RecallPluginApi["registrationMode"];
  config: RecallConfig;
  pluginConfig?: Record<string, unknown>;
  runtime: PluginRuntime;
  logger: PluginLogger;
  resolvePath: (input: string) => string;
  handlers?: Partial<
    Pick<
      RecallPluginApi,
      | "registerTool"
      | "registerHook"
      | "registerHttpRoute"
      | "registerHostedMediaResolver"
      | "registerChannel"
      | "registerGatewayMethod"
      | "registerCli"
      | "registerReload"
      | "registerNodeHostCommand"
      | "registerNodeInvokePolicy"
      | "registerSecurityAuditCollector"
      | "registerService"
      | "registerGatewayDiscoveryService"
      | "registerCliBackend"
      | "registerTextTransforms"
      | "registerConfigMigration"
      | "registerMigrationProvider"
      | "registerAutoEnableProbe"
      | "registerProvider"
      | "registerModelCatalogProvider"
      | "registerEmbeddingProvider"
      | "registerSpeechProvider"
      | "registerRealtimeTranscriptionProvider"
      | "registerRealtimeVoiceProvider"
      | "registerMediaUnderstandingProvider"
      | "registerImageGenerationProvider"
      | "registerVideoGenerationProvider"
      | "registerMusicGenerationProvider"
      | "registerWebFetchProvider"
      | "registerWebSearchProvider"
      | "registerInteractiveHandler"
      | "onConversationBindingResolved"
      | "registerCommand"
      | "registerContextEngine"
      | "registerCompactionProvider"
      | "registerAgentHarness"
      | "registerCodexAppServerExtensionFactory"
      | "registerAgentToolResultMiddleware"
      | "registerSessionExtension"
      | "enqueueNextTurnInjection"
      | "registerTrustedToolPolicy"
      | "registerToolMetadata"
      | "registerControlUiDescriptor"
      | "registerRuntimeLifecycle"
      | "registerAgentEventSubscription"
      | "emitAgentEvent"
      | "setRunContext"
      | "getRunContext"
      | "clearRunContext"
      | "registerSessionSchedulerJob"
      | "registerSessionAction"
      | "sendSessionAttachment"
      | "scheduleSessionTurn"
      | "unscheduleSessionTurnsByTag"
      | "registerDetachedTaskRuntime"
      | "registerMemoryCapability"
      | "registerMemoryPromptSection"
      | "registerMemoryPromptSupplement"
      | "registerMemoryCorpusSupplement"
      | "registerMemoryFlushPlan"
      | "registerMemoryRuntime"
      | "registerMemoryEmbeddingProvider"
      | "on"
    >
  >;
};

const noopRegisterTool: RecallPluginApi["registerTool"] = () => {};
const noopRegisterHook: RecallPluginApi["registerHook"] = () => {};
const noopRegisterHttpRoute: RecallPluginApi["registerHttpRoute"] = () => {};
const noopRegisterHostedMediaResolver: RecallPluginApi["registerHostedMediaResolver"] = () => {};
const noopRegisterChannel: RecallPluginApi["registerChannel"] = () => {};
const noopRegisterGatewayMethod: RecallPluginApi["registerGatewayMethod"] = () => {};
const noopRegisterCli: RecallPluginApi["registerCli"] = () => {};
const noopRegisterReload: RecallPluginApi["registerReload"] = () => {};
const noopRegisterNodeHostCommand: RecallPluginApi["registerNodeHostCommand"] = () => {};
const noopRegisterNodeInvokePolicy: RecallPluginApi["registerNodeInvokePolicy"] = () => {};
const noopRegisterSecurityAuditCollector: RecallPluginApi["registerSecurityAuditCollector"] =
  () => {};
const noopRegisterService: RecallPluginApi["registerService"] = () => {};
const noopRegisterGatewayDiscoveryService: RecallPluginApi["registerGatewayDiscoveryService"] =
  () => {};
const noopRegisterCliBackend: RecallPluginApi["registerCliBackend"] = () => {};
const noopRegisterTextTransforms: RecallPluginApi["registerTextTransforms"] = () => {};
const noopRegisterConfigMigration: RecallPluginApi["registerConfigMigration"] = () => {};
const noopRegisterMigrationProvider: RecallPluginApi["registerMigrationProvider"] = () => {};
const noopRegisterAutoEnableProbe: RecallPluginApi["registerAutoEnableProbe"] = () => {};
const noopRegisterProvider: RecallPluginApi["registerProvider"] = () => {};
const noopRegisterModelCatalogProvider: RecallPluginApi["registerModelCatalogProvider"] =
  () => {};
const noopRegisterEmbeddingProvider: RecallPluginApi["registerEmbeddingProvider"] = () => {};
const noopRegisterSpeechProvider: RecallPluginApi["registerSpeechProvider"] = () => {};
const noopRegisterRealtimeTranscriptionProvider: RecallPluginApi["registerRealtimeTranscriptionProvider"] =
  () => {};
const noopRegisterRealtimeVoiceProvider: RecallPluginApi["registerRealtimeVoiceProvider"] =
  () => {};
const noopRegisterMediaUnderstandingProvider: RecallPluginApi["registerMediaUnderstandingProvider"] =
  () => {};
const noopRegisterImageGenerationProvider: RecallPluginApi["registerImageGenerationProvider"] =
  () => {};
const noopRegisterVideoGenerationProvider: RecallPluginApi["registerVideoGenerationProvider"] =
  () => {};
const noopRegisterMusicGenerationProvider: RecallPluginApi["registerMusicGenerationProvider"] =
  () => {};
const noopRegisterWebFetchProvider: RecallPluginApi["registerWebFetchProvider"] = () => {};
const noopRegisterWebSearchProvider: RecallPluginApi["registerWebSearchProvider"] = () => {};
const noopRegisterInteractiveHandler: RecallPluginApi["registerInteractiveHandler"] = () => {};
const noopOnConversationBindingResolved: RecallPluginApi["onConversationBindingResolved"] =
  () => {};
const noopRegisterCommand: RecallPluginApi["registerCommand"] = () => {};
const noopRegisterContextEngine: RecallPluginApi["registerContextEngine"] = () => {};
const noopRegisterCompactionProvider: RecallPluginApi["registerCompactionProvider"] = () => {};
const noopRegisterAgentHarness: RecallPluginApi["registerAgentHarness"] = () => {};
const noopRegisterCodexAppServerExtensionFactory: RecallPluginApi["registerCodexAppServerExtensionFactory"] =
  () => {};
const noopRegisterAgentToolResultMiddleware: RecallPluginApi["registerAgentToolResultMiddleware"] =
  () => {};
const noopRegisterSessionExtension: RecallPluginApi["registerSessionExtension"] = () => {};
const noopEnqueueNextTurnInjection: RecallPluginApi["enqueueNextTurnInjection"] = async (
  injection,
) => ({ enqueued: false, id: "", sessionKey: injection.sessionKey });
const noopRegisterTrustedToolPolicy: RecallPluginApi["registerTrustedToolPolicy"] = () => {};
const noopRegisterToolMetadata: RecallPluginApi["registerToolMetadata"] = () => {};
const noopRegisterControlUiDescriptor: RecallPluginApi["registerControlUiDescriptor"] = () => {};
const noopRegisterRuntimeLifecycle: RecallPluginApi["registerRuntimeLifecycle"] = () => {};
const noopRegisterAgentEventSubscription: RecallPluginApi["registerAgentEventSubscription"] =
  () => {};
const noopEmitAgentEvent: RecallPluginApi["emitAgentEvent"] = () => ({
  emitted: false,
  reason: "not wired",
});
const noopSetRunContext: RecallPluginApi["setRunContext"] = () => false;
const noopGetRunContext: RecallPluginApi["getRunContext"] = () => undefined;
const noopClearRunContext: RecallPluginApi["clearRunContext"] = () => {};
const noopRegisterSessionSchedulerJob: RecallPluginApi["registerSessionSchedulerJob"] = () =>
  undefined;
const noopRegisterSessionAction: RecallPluginApi["registerSessionAction"] = () => {};
const noopSendSessionAttachment: RecallPluginApi["sendSessionAttachment"] = async () => ({
  ok: false,
  error: "not wired",
});
const noopScheduleSessionTurn: RecallPluginApi["scheduleSessionTurn"] = async () => undefined;
const noopUnscheduleSessionTurnsByTag: RecallPluginApi["unscheduleSessionTurnsByTag"] =
  async () => ({ removed: 0, failed: 0 });
const noopRegisterDetachedTaskRuntime: RecallPluginApi["registerDetachedTaskRuntime"] = () => {};
const noopRegisterMemoryCapability: RecallPluginApi["registerMemoryCapability"] = () => {};
const noopRegisterMemoryPromptSection: RecallPluginApi["registerMemoryPromptSection"] = () => {};
const noopRegisterMemoryPromptSupplement: RecallPluginApi["registerMemoryPromptSupplement"] =
  () => {};
const noopRegisterMemoryCorpusSupplement: RecallPluginApi["registerMemoryCorpusSupplement"] =
  () => {};
const noopRegisterMemoryFlushPlan: RecallPluginApi["registerMemoryFlushPlan"] = () => {};
const noopRegisterMemoryRuntime: RecallPluginApi["registerMemoryRuntime"] = () => {};
const noopRegisterMemoryEmbeddingProvider: RecallPluginApi["registerMemoryEmbeddingProvider"] =
  () => {};
const noopOn: RecallPluginApi["on"] = () => {};

export function buildPluginApi(params: BuildPluginApiParams): RecallPluginApi {
  const handlers = params.handlers ?? {};
  const registerCli = handlers.registerCli ?? noopRegisterCli;
  const api: RecallPluginApiWithoutFacades = {
    id: params.id,
    name: params.name,
    version: params.version,
    description: params.description,
    source: params.source,
    rootDir: params.rootDir,
    registrationMode: params.registrationMode,
    config: params.config,
    pluginConfig: params.pluginConfig,
    runtime: params.runtime,
    logger: params.logger,
    registerTool: handlers.registerTool ?? noopRegisterTool,
    registerHook: handlers.registerHook ?? noopRegisterHook,
    registerHttpRoute: handlers.registerHttpRoute ?? noopRegisterHttpRoute,
    registerHostedMediaResolver:
      handlers.registerHostedMediaResolver ?? noopRegisterHostedMediaResolver,
    registerChannel: handlers.registerChannel ?? noopRegisterChannel,
    registerGatewayMethod: handlers.registerGatewayMethod ?? noopRegisterGatewayMethod,
    registerCli,
    registerNodeCliFeature: (registrar, opts) =>
      registerCli(registrar, {
        ...opts,
        parentPath: ["nodes"],
      }),
    registerReload: handlers.registerReload ?? noopRegisterReload,
    registerNodeHostCommand: handlers.registerNodeHostCommand ?? noopRegisterNodeHostCommand,
    registerNodeInvokePolicy: handlers.registerNodeInvokePolicy ?? noopRegisterNodeInvokePolicy,
    registerSecurityAuditCollector:
      handlers.registerSecurityAuditCollector ?? noopRegisterSecurityAuditCollector,
    registerService: handlers.registerService ?? noopRegisterService,
    registerGatewayDiscoveryService:
      handlers.registerGatewayDiscoveryService ?? noopRegisterGatewayDiscoveryService,
    registerCliBackend: handlers.registerCliBackend ?? noopRegisterCliBackend,
    registerTextTransforms: handlers.registerTextTransforms ?? noopRegisterTextTransforms,
    registerConfigMigration: handlers.registerConfigMigration ?? noopRegisterConfigMigration,
    registerMigrationProvider: handlers.registerMigrationProvider ?? noopRegisterMigrationProvider,
    registerAutoEnableProbe: handlers.registerAutoEnableProbe ?? noopRegisterAutoEnableProbe,
    registerProvider: handlers.registerProvider ?? noopRegisterProvider,
    registerModelCatalogProvider:
      handlers.registerModelCatalogProvider ?? noopRegisterModelCatalogProvider,
    registerEmbeddingProvider: handlers.registerEmbeddingProvider ?? noopRegisterEmbeddingProvider,
    registerSpeechProvider: handlers.registerSpeechProvider ?? noopRegisterSpeechProvider,
    registerRealtimeTranscriptionProvider:
      handlers.registerRealtimeTranscriptionProvider ?? noopRegisterRealtimeTranscriptionProvider,
    registerRealtimeVoiceProvider:
      handlers.registerRealtimeVoiceProvider ?? noopRegisterRealtimeVoiceProvider,
    registerMediaUnderstandingProvider:
      handlers.registerMediaUnderstandingProvider ?? noopRegisterMediaUnderstandingProvider,
    registerImageGenerationProvider:
      handlers.registerImageGenerationProvider ?? noopRegisterImageGenerationProvider,
    registerVideoGenerationProvider:
      handlers.registerVideoGenerationProvider ?? noopRegisterVideoGenerationProvider,
    registerMusicGenerationProvider:
      handlers.registerMusicGenerationProvider ?? noopRegisterMusicGenerationProvider,
    registerWebFetchProvider: handlers.registerWebFetchProvider ?? noopRegisterWebFetchProvider,
    registerWebSearchProvider: handlers.registerWebSearchProvider ?? noopRegisterWebSearchProvider,
    registerInteractiveHandler:
      handlers.registerInteractiveHandler ?? noopRegisterInteractiveHandler,
    onConversationBindingResolved:
      handlers.onConversationBindingResolved ?? noopOnConversationBindingResolved,
    registerCommand: handlers.registerCommand ?? noopRegisterCommand,
    registerContextEngine: handlers.registerContextEngine ?? noopRegisterContextEngine,
    registerCompactionProvider:
      handlers.registerCompactionProvider ?? noopRegisterCompactionProvider,
    registerAgentHarness: handlers.registerAgentHarness ?? noopRegisterAgentHarness,
    registerCodexAppServerExtensionFactory:
      handlers.registerCodexAppServerExtensionFactory ?? noopRegisterCodexAppServerExtensionFactory,
    registerAgentToolResultMiddleware:
      handlers.registerAgentToolResultMiddleware ?? noopRegisterAgentToolResultMiddleware,
    registerSessionExtension: handlers.registerSessionExtension ?? noopRegisterSessionExtension,
    enqueueNextTurnInjection: handlers.enqueueNextTurnInjection ?? noopEnqueueNextTurnInjection,
    registerTrustedToolPolicy: handlers.registerTrustedToolPolicy ?? noopRegisterTrustedToolPolicy,
    registerToolMetadata: handlers.registerToolMetadata ?? noopRegisterToolMetadata,
    registerControlUiDescriptor:
      handlers.registerControlUiDescriptor ?? noopRegisterControlUiDescriptor,
    registerRuntimeLifecycle: handlers.registerRuntimeLifecycle ?? noopRegisterRuntimeLifecycle,
    registerAgentEventSubscription:
      handlers.registerAgentEventSubscription ?? noopRegisterAgentEventSubscription,
    emitAgentEvent: handlers.emitAgentEvent ?? noopEmitAgentEvent,
    setRunContext: handlers.setRunContext ?? noopSetRunContext,
    getRunContext: handlers.getRunContext ?? noopGetRunContext,
    clearRunContext: handlers.clearRunContext ?? noopClearRunContext,
    registerSessionSchedulerJob:
      handlers.registerSessionSchedulerJob ?? noopRegisterSessionSchedulerJob,
    registerSessionAction: handlers.registerSessionAction ?? noopRegisterSessionAction,
    sendSessionAttachment: handlers.sendSessionAttachment ?? noopSendSessionAttachment,
    scheduleSessionTurn: handlers.scheduleSessionTurn ?? noopScheduleSessionTurn,
    unscheduleSessionTurnsByTag:
      handlers.unscheduleSessionTurnsByTag ?? noopUnscheduleSessionTurnsByTag,
    registerDetachedTaskRuntime:
      handlers.registerDetachedTaskRuntime ?? noopRegisterDetachedTaskRuntime,
    registerMemoryCapability: handlers.registerMemoryCapability ?? noopRegisterMemoryCapability,
    registerMemoryPromptSection:
      handlers.registerMemoryPromptSection ?? noopRegisterMemoryPromptSection,
    registerMemoryPromptSupplement:
      handlers.registerMemoryPromptSupplement ?? noopRegisterMemoryPromptSupplement,
    registerMemoryCorpusSupplement:
      handlers.registerMemoryCorpusSupplement ?? noopRegisterMemoryCorpusSupplement,
    registerMemoryFlushPlan: handlers.registerMemoryFlushPlan ?? noopRegisterMemoryFlushPlan,
    registerMemoryRuntime: handlers.registerMemoryRuntime ?? noopRegisterMemoryRuntime,
    registerMemoryEmbeddingProvider:
      handlers.registerMemoryEmbeddingProvider ?? noopRegisterMemoryEmbeddingProvider,
    resolvePath: params.resolvePath,
    on: handlers.on ?? noopOn,
  };
  return attachPluginApiFacades(api);
}
