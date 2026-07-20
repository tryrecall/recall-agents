// Builds plugin API objects from config, registries, and runtime helpers.
import type { SteelEngineConfig } from "../config/types.steelengine.js";
import { attachPluginApiFacades, type SteelEnginePluginApiWithoutFacades } from "./api-facades.js";
import type { PluginRuntime } from "./runtime/types.js";
import type { SteelEnginePluginApi, PluginLogger } from "./types.js";

type BuildPluginApiParams = {
  id: string;
  name: string;
  version?: string;
  description?: string;
  source: string;
  rootDir?: string;
  registrationMode: SteelEnginePluginApi["registrationMode"];
  config: SteelEngineConfig;
  pluginConfig?: Record<string, unknown>;
  runtime: PluginRuntime;
  logger: PluginLogger;
  resolvePath: (input: string) => string;
  handlers?: Partial<
    Pick<
      SteelEnginePluginApi,
      | "registerTool"
      | "registerHook"
      | "registerHttpRoute"
      | "registerHostedMediaResolver"
      | "registerMcpServerConnectionResolver"
      | "registerChannel"
      | "registerGatewayMethod"
      | "registerSessionCatalog"
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
      | "registerWorkerProvider"
      | "registerModelCatalogProvider"
      | "registerEmbeddingProvider"
      | "registerSpeechProvider"
      | "registerRealtimeTranscriptionProvider"
      | "registerRealtimeVoiceProvider"
      | "registerMediaUnderstandingProvider"
      | "registerTranscriptSourceProvider"
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
      | "registerMemoryPromptPreparation"
      | "registerMemoryCorpusSupplement"
      | "registerMemoryFlushPlan"
      | "registerMemoryRuntime"
      | "registerMemoryEmbeddingProvider"
      | "on"
    >
  >;
};

const noopRegisterTool: SteelEnginePluginApi["registerTool"] = () => {};
const noopRegisterHook: SteelEnginePluginApi["registerHook"] = () => {};
const noopRegisterHttpRoute: SteelEnginePluginApi["registerHttpRoute"] = () => {};
const noopRegisterHostedMediaResolver: SteelEnginePluginApi["registerHostedMediaResolver"] = () => {};
const noopRegisterMcpServerConnectionResolver: SteelEnginePluginApi["registerMcpServerConnectionResolver"] =
  () => {};
const noopRegisterChannel: SteelEnginePluginApi["registerChannel"] = () => {};
const noopRegisterGatewayMethod: SteelEnginePluginApi["registerGatewayMethod"] = () => {};
const noopRegisterSessionCatalog: SteelEnginePluginApi["registerSessionCatalog"] = () => {};
const noopRegisterCli: SteelEnginePluginApi["registerCli"] = () => {};
const noopRegisterReload: SteelEnginePluginApi["registerReload"] = () => {};
const noopRegisterNodeHostCommand: SteelEnginePluginApi["registerNodeHostCommand"] = () => {};
const noopRegisterNodeInvokePolicy: SteelEnginePluginApi["registerNodeInvokePolicy"] = () => {};
const noopRegisterSecurityAuditCollector: SteelEnginePluginApi["registerSecurityAuditCollector"] =
  () => {};
const noopRegisterService: SteelEnginePluginApi["registerService"] = () => {};
const noopRegisterGatewayDiscoveryService: SteelEnginePluginApi["registerGatewayDiscoveryService"] =
  () => {};
const noopRegisterCliBackend: SteelEnginePluginApi["registerCliBackend"] = () => {};
const noopRegisterTextTransforms: SteelEnginePluginApi["registerTextTransforms"] = () => {};
const noopRegisterConfigMigration: SteelEnginePluginApi["registerConfigMigration"] = () => {};
const noopRegisterMigrationProvider: SteelEnginePluginApi["registerMigrationProvider"] = () => {};
const noopRegisterAutoEnableProbe: SteelEnginePluginApi["registerAutoEnableProbe"] = () => {};
const noopRegisterProvider: SteelEnginePluginApi["registerProvider"] = () => {};
const noopRegisterWorkerProvider: SteelEnginePluginApi["registerWorkerProvider"] = () => {};
const noopRegisterModelCatalogProvider: SteelEnginePluginApi["registerModelCatalogProvider"] =
  () => {};
const noopRegisterEmbeddingProvider: SteelEnginePluginApi["registerEmbeddingProvider"] = () => {};
const noopRegisterSpeechProvider: SteelEnginePluginApi["registerSpeechProvider"] = () => {};
const noopRegisterRealtimeTranscriptionProvider: SteelEnginePluginApi["registerRealtimeTranscriptionProvider"] =
  () => {};
const noopRegisterRealtimeVoiceProvider: SteelEnginePluginApi["registerRealtimeVoiceProvider"] =
  () => {};
const noopRegisterMediaUnderstandingProvider: SteelEnginePluginApi["registerMediaUnderstandingProvider"] =
  () => {};
const noopRegisterTranscriptsSourceProvider: SteelEnginePluginApi["registerTranscriptSourceProvider"] =
  () => {};
const noopRegisterImageGenerationProvider: SteelEnginePluginApi["registerImageGenerationProvider"] =
  () => {};
const noopRegisterVideoGenerationProvider: SteelEnginePluginApi["registerVideoGenerationProvider"] =
  () => {};
const noopRegisterMusicGenerationProvider: SteelEnginePluginApi["registerMusicGenerationProvider"] =
  () => {};
const noopRegisterWebFetchProvider: SteelEnginePluginApi["registerWebFetchProvider"] = () => {};
const noopRegisterWebSearchProvider: SteelEnginePluginApi["registerWebSearchProvider"] = () => {};
const noopRegisterInteractiveHandler: SteelEnginePluginApi["registerInteractiveHandler"] = () => {};
const noopOnConversationBindingResolved: SteelEnginePluginApi["onConversationBindingResolved"] =
  () => {};
const noopRegisterCommand: SteelEnginePluginApi["registerCommand"] = () => {};
const noopRegisterContextEngine: SteelEnginePluginApi["registerContextEngine"] = () => {};
const noopRegisterCompactionProvider: SteelEnginePluginApi["registerCompactionProvider"] = () => {};
const noopRegisterAgentHarness: SteelEnginePluginApi["registerAgentHarness"] = () => {};
const noopRegisterCodexAppServerExtensionFactory: SteelEnginePluginApi["registerCodexAppServerExtensionFactory"] =
  () => {};
const noopRegisterAgentToolResultMiddleware: SteelEnginePluginApi["registerAgentToolResultMiddleware"] =
  () => {};
const noopRegisterSessionExtension: SteelEnginePluginApi["registerSessionExtension"] = () => {};
const noopEnqueueNextTurnInjection: SteelEnginePluginApi["enqueueNextTurnInjection"] = async (
  injection,
) => ({ enqueued: false, id: "", sessionKey: injection.sessionKey });
const noopRegisterTrustedToolPolicy: SteelEnginePluginApi["registerTrustedToolPolicy"] = () => {};
const noopRegisterToolMetadata: SteelEnginePluginApi["registerToolMetadata"] = () => {};
const noopRegisterControlUiDescriptor: SteelEnginePluginApi["registerControlUiDescriptor"] = () => {};
const noopRegisterRuntimeLifecycle: SteelEnginePluginApi["registerRuntimeLifecycle"] = () => {};
const noopRegisterAgentEventSubscription: SteelEnginePluginApi["registerAgentEventSubscription"] =
  () => {};
const noopEmitAgentEvent: SteelEnginePluginApi["emitAgentEvent"] = () => ({
  emitted: false,
  reason: "not wired",
});
const noopSetRunContext: SteelEnginePluginApi["setRunContext"] = () => false;
const noopGetRunContext: SteelEnginePluginApi["getRunContext"] = () => undefined;
const noopClearRunContext: SteelEnginePluginApi["clearRunContext"] = () => {};
const noopRegisterSessionSchedulerJob: SteelEnginePluginApi["registerSessionSchedulerJob"] = () =>
  undefined;
const noopRegisterSessionAction: SteelEnginePluginApi["registerSessionAction"] = () => {};
const noopSendSessionAttachment: SteelEnginePluginApi["sendSessionAttachment"] = async () => ({
  ok: false,
  error: "not wired",
});
const noopScheduleSessionTurn: SteelEnginePluginApi["scheduleSessionTurn"] = async () => undefined;
const noopUnscheduleSessionTurnsByTag: SteelEnginePluginApi["unscheduleSessionTurnsByTag"] =
  async () => ({ removed: 0, failed: 0 });
const noopRegisterDetachedTaskRuntime: SteelEnginePluginApi["registerDetachedTaskRuntime"] = () => {};
const noopRegisterMemoryCapability: SteelEnginePluginApi["registerMemoryCapability"] = () => {};
const noopRegisterMemoryPromptSection: SteelEnginePluginApi["registerMemoryPromptSection"] = () => {};
const noopRegisterMemoryPromptSupplement: SteelEnginePluginApi["registerMemoryPromptSupplement"] =
  () => {};
const noopRegisterMemoryPromptPreparation: SteelEnginePluginApi["registerMemoryPromptPreparation"] =
  () => {};
const noopRegisterMemoryCorpusSupplement: SteelEnginePluginApi["registerMemoryCorpusSupplement"] =
  () => {};
const noopRegisterMemoryFlushPlan: SteelEnginePluginApi["registerMemoryFlushPlan"] = () => {};
const noopRegisterMemoryRuntime: SteelEnginePluginApi["registerMemoryRuntime"] = () => {};
const noopRegisterMemoryEmbeddingProvider: SteelEnginePluginApi["registerMemoryEmbeddingProvider"] =
  () => {};
const noopOn: SteelEnginePluginApi["on"] = () => {};

export function buildPluginApi(params: BuildPluginApiParams): SteelEnginePluginApi {
  const handlers = params.handlers ?? {};
  const registerCli = handlers.registerCli ?? noopRegisterCli;
  const api: SteelEnginePluginApiWithoutFacades = {
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
    registerMcpServerConnectionResolver:
      handlers.registerMcpServerConnectionResolver ?? noopRegisterMcpServerConnectionResolver,
    registerChannel: handlers.registerChannel ?? noopRegisterChannel,
    registerGatewayMethod: handlers.registerGatewayMethod ?? noopRegisterGatewayMethod,
    registerSessionCatalog: handlers.registerSessionCatalog ?? noopRegisterSessionCatalog,
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
    registerWorkerProvider: handlers.registerWorkerProvider ?? noopRegisterWorkerProvider,
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
    registerTranscriptSourceProvider:
      handlers.registerTranscriptSourceProvider ?? noopRegisterTranscriptsSourceProvider,
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
    registerMemoryPromptPreparation:
      handlers.registerMemoryPromptPreparation ?? noopRegisterMemoryPromptPreparation,
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
