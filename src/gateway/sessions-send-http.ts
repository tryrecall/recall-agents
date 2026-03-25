import fs from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { loadConfig } from "../config/config.js";
import { loadSessionStore } from "../config/sessions.js";
import type { AuthRateLimiter } from "./auth-rate-limit.js";
import { authorizeHttpGatewayConnect, type ResolvedGatewayAuth } from "./auth.js";
import {
  sendGatewayAuthFailure,
  sendInvalidRequest,
  sendJson,
  sendMethodNotAllowed,
} from "./http-common.js";
import { getBearerToken } from "./http-utils.js";
import { appendInjectedAssistantMessageToTranscript } from "./server-methods/chat-transcript-inject.js";
import {
  resolveGatewaySessionStoreTarget,
  resolveSessionTranscriptCandidates,
} from "./session-utils.js";

const MAX_BODY_BYTES = 64 * 1024;

function resolveSessionSendPath(req: IncomingMessage): string | null {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const match = url.pathname.match(/^\/sessions\/([^/]+)\/messages$/);
  if (!match) {
    return null;
  }
  try {
    return decodeURIComponent(match[1] ?? "").trim() || null;
  } catch {
    return "";
  }
}

function readJsonBody(req: IncomingMessage, maxBytes: number): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error("body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf-8")));
      } catch {
        reject(new Error("invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function resolveTranscriptPath(params: {
  sessionId: string;
  storePath: string | undefined;
  sessionFile: string | undefined;
  agentId: string | undefined;
}): string | undefined {
  const candidates = resolveSessionTranscriptCandidates(
    params.sessionId,
    params.storePath,
    params.sessionFile,
    params.agentId,
  );
  // Return the first candidate that actually exists on disk, or the first candidate at all.
  for (const candidate of candidates) {
    try {
      fs.accessSync(candidate);
      return candidate;
    } catch {
      continue;
    }
  }
  return candidates[0];
}

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

  const cfg = loadConfig();
  const token = getBearerToken(req);
  const authResult = await authorizeHttpGatewayConnect({
    auth: opts.auth,
    connectAuth: token ? { token, password: token } : null,
    req,
    trustedProxies: opts.trustedProxies ?? cfg.gateway?.trustedProxies,
    allowRealIpFallback: opts.allowRealIpFallback ?? cfg.gateway?.allowRealIpFallback,
    rateLimiter: opts.rateLimiter,
  });
  if (!authResult.ok) {
    sendGatewayAuthFailure(res, authResult);
    return true;
  }

  let body: unknown;
  try {
    body = await readJsonBody(req, MAX_BODY_BYTES);
  } catch (err) {
    sendInvalidRequest(res, err instanceof Error ? err.message : "invalid body");
    return true;
  }

  const payload = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  if (!message) {
    sendInvalidRequest(res, "missing or empty 'message' field");
    return true;
  }

  const label = typeof payload.label === "string" ? payload.label.trim() : undefined;
  const idempotencyKey =
    typeof payload.idempotencyKey === "string" ? payload.idempotencyKey.trim() : undefined;

  const target = resolveGatewaySessionStoreTarget({ cfg, key: sessionKey });
  const store = loadSessionStore(target.storePath);
  const entry = target.storeKeys.map((key) => store[key]).find(Boolean);
  if (!entry?.sessionId) {
    sendJson(res, 404, {
      ok: false,
      error: { type: "not_found", message: `Session not found: ${sessionKey}` },
    });
    return true;
  }

  const transcriptPath = resolveTranscriptPath({
    sessionId: entry.sessionId,
    storePath: target.storePath,
    sessionFile: entry.sessionFile,
    agentId: target.agentId,
  });
  if (!transcriptPath) {
    sendJson(res, 404, {
      ok: false,
      error: { type: "not_found", message: "No transcript file found for session" },
    });
    return true;
  }

  const result = appendInjectedAssistantMessageToTranscript({
    transcriptPath,
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
