// Gateway HTTP endpoint for proactive assistant-message injection.
import type { IncomingMessage, ServerResponse } from "node:http";
import { getRuntimeConfig } from "../config/io.js";
import type { AuthRateLimiter } from "./auth-rate-limit.js";
import type { ResolvedGatewayAuth } from "./auth.js";
import {
  readJsonBodyOrError,
  sendInvalidRequest,
  sendJson,
  sendMethodNotAllowed,
} from "./http-common.js";
import {
  authorizeScopedGatewayHttpRequestOrReply,
  resolveSharedSecretHttpOperatorScopes,
} from "./http-utils.js";
import { appendInjectedAssistantMessageToTranscript } from "./server-methods/chat-transcript-inject.js";
import {
  resolveFreshestSessionEntryFromStoreKeys,
  resolveGatewaySessionStoreTargetWithStore,
} from "./session-utils.js";

const MAX_BODY_BYTES = 64 * 1024;

function resolveSessionSendPath(req: IncomingMessage): string | null {
  const url = new URL(req.url ?? "/", "http://localhost");
  const match = url.pathname.match(/^\/sessions\/([^/]+)\/messages$/);
  if (!match) {
    return null;
  }
  try {
    return decodeURIComponent(match[1] ?? "").trim();
  } catch {
    return "";
  }
}

/** Handle `POST /sessions/:sessionKey/messages`. */
export async function handleSessionSendHttpRequest(
  req: IncomingMessage,
  res: ServerResponse,
  opts: {
    auth: ResolvedGatewayAuth;
    trustedProxies?: string[];
    allowRealIpFallback?: boolean;
    rateLimiter?: AuthRateLimiter;
  },
): Promise<boolean> {
  const sessionKey = resolveSessionSendPath(req);
  if (sessionKey === null) {
    return false;
  }
  if (!sessionKey) {
    sendInvalidRequest(res, "invalid session key");
    return true;
  }
  if (req.method !== "POST") {
    sendMethodNotAllowed(res, "POST");
    return true;
  }

  const authResult = await authorizeScopedGatewayHttpRequestOrReply({
    req,
    res,
    auth: opts.auth,
    trustedProxies: opts.trustedProxies,
    allowRealIpFallback: opts.allowRealIpFallback,
    rateLimiter: opts.rateLimiter,
    operatorMethod: "chat.inject",
    resolveOperatorScopes: resolveSharedSecretHttpOperatorScopes,
  });
  if (!authResult) {
    return true;
  }
  const { cfg } = authResult;

  const body = await readJsonBodyOrError(req, res, MAX_BODY_BYTES);
  if (body === undefined) {
    return true;
  }
  const payload = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  if (!message) {
    sendInvalidRequest(res, "missing or empty 'message' field");
    return true;
  }

  const target = resolveGatewaySessionStoreTargetWithStore({ cfg, key: sessionKey });
  const entry = resolveFreshestSessionEntryFromStoreKeys(target.store, target.storeKeys);
  if (!entry?.sessionId) {
    sendJson(res, 404, {
      ok: false,
      error: { type: "not_found", message: `Session not found: ${sessionKey}` },
    });
    return true;
  }

  const label = typeof payload.label === "string" ? payload.label.trim() : undefined;
  const idempotencyKey =
    typeof payload.idempotencyKey === "string" ? payload.idempotencyKey.trim() : undefined;
  const result = await appendInjectedAssistantMessageToTranscript({
    config: cfg ?? getRuntimeConfig(),
    agentId: target.agentId,
    sessionId: entry.sessionId,
    sessionKey: target.canonicalKey,
    storePath: target.storePath,
    message,
    label: label || undefined,
    idempotencyKey: idempotencyKey || undefined,
  });

  if (!result.ok) {
    sendJson(res, 500, {
      ok: false,
      error: { type: "internal_error", message: result.error || "Failed to inject message" },
    });
    return true;
  }

  sendJson(res, 200, {
    ok: true,
    messageId: result.messageId,
    sessionKey: target.canonicalKey,
  });
  return true;
}
