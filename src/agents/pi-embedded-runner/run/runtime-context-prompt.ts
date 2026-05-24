import {
  RECALL_NEXT_TURN_RUNTIME_CONTEXT_HEADER,
  RECALL_RUNTIME_CONTEXT_CUSTOM_TYPE,
  RECALL_RUNTIME_CONTEXT_NOTICE,
  RECALL_RUNTIME_EVENT_HEADER,
} from "../../internal-runtime-context.js";
import type { CurrentInboundPromptContext } from "./params.js";
export { RECALL_RUNTIME_CONTEXT_CUSTOM_TYPE };

const RECALL_RUNTIME_EVENT_USER_PROMPT = "Continue the Recall runtime event.";

type RuntimeContextSession = {
  sendCustomMessage: (
    message: {
      customType: string;
      content: string;
      display: boolean;
      details?: Record<string, unknown>;
    },
    options?: { deliverAs?: "nextTurn"; triggerTurn?: boolean },
  ) => Promise<void>;
};

type RuntimeContextPromptParts = {
  prompt: string;
  runtimeContext?: string;
  runtimeOnly?: boolean;
  runtimeSystemContext?: string;
};

type EmptyTranscriptMode = "model-prompt" | "runtime-event";

export function buildCurrentInboundPromptContextPrefix(
  context: CurrentInboundPromptContext | undefined,
): string {
  return context?.text.trim() ?? "";
}

export function buildCurrentInboundPrompt(params: {
  context: CurrentInboundPromptContext | undefined;
  prompt: string;
}): string {
  const prefix = buildCurrentInboundPromptContextPrefix(params.context);
  if (!prefix) {
    return params.prompt;
  }
  if (!params.prompt) {
    return prefix;
  }
  return [prefix, params.prompt].join(params.context?.promptJoiner ?? "\n\n");
}

function removeLastPromptOccurrence(text: string, prompt: string): string | null {
  const index = text.lastIndexOf(prompt);
  if (index === -1) {
    return null;
  }
  const before = text.slice(0, index).trimEnd();
  const after = text.slice(index + prompt.length).trimStart();
  return [before, after]
    .filter((part) => part.length > 0)
    .join("\n\n")
    .trim();
}

export function resolveRuntimeContextPromptParts(params: {
  effectivePrompt: string;
  transcriptPrompt?: string;
  emptyTranscriptMode?: EmptyTranscriptMode;
}): RuntimeContextPromptParts {
  const transcriptPrompt = params.transcriptPrompt;
  if (transcriptPrompt === undefined || transcriptPrompt === params.effectivePrompt) {
    return { prompt: params.effectivePrompt };
  }

  const prompt = transcriptPrompt.trim();
  if (!prompt && params.emptyTranscriptMode === "model-prompt") {
    return { prompt: params.effectivePrompt };
  }
  const runtimeContext =
    removeLastPromptOccurrence(params.effectivePrompt, transcriptPrompt)?.trim() ||
    params.effectivePrompt.trim();
  if (!prompt) {
    return runtimeContext
      ? {
          prompt: RECALL_RUNTIME_EVENT_USER_PROMPT,
          runtimeContext,
          runtimeOnly: true,
          runtimeSystemContext: buildRuntimeEventSystemContext(runtimeContext),
        }
      : { prompt: "" };
  }

  return runtimeContext ? { prompt, runtimeContext } : { prompt };
}

function buildRuntimeContextMessageContent(params: {
  runtimeContext: string;
  kind: "next-turn" | "runtime-event";
}): string {
  return [
    params.kind === "runtime-event"
      ? RECALL_RUNTIME_EVENT_HEADER
      : RECALL_NEXT_TURN_RUNTIME_CONTEXT_HEADER,
    RECALL_RUNTIME_CONTEXT_NOTICE,
    "",
    params.runtimeContext,
  ].join("\n");
}

export function buildRuntimeContextSystemContext(runtimeContext: string): string {
  return buildRuntimeContextMessageContent({ runtimeContext, kind: "next-turn" });
}

export function buildRuntimeEventSystemContext(runtimeContext: string): string {
  return buildRuntimeContextMessageContent({ runtimeContext, kind: "runtime-event" });
}

export async function queueRuntimeContextForNextTurn(params: {
  session: RuntimeContextSession;
  runtimeContext?: string;
}): Promise<void> {
  const runtimeContext = params.runtimeContext?.trim();
  if (!runtimeContext) {
    return;
  }
  await params.session.sendCustomMessage(
    {
      customType: RECALL_RUNTIME_CONTEXT_CUSTOM_TYPE,
      content: runtimeContext,
      display: false,
      details: { source: "recall-runtime-context" },
    },
    { deliverAs: "nextTurn" },
  );
}
