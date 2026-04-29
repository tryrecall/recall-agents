import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { FailoverError } from "../agents/failover-error.js";
import {
  createStubSessionHarness,
  emitAssistantTextDelta,
} from "../agents/pi-embedded-subscribe.e2e-harness.js";
import { subscribeEmbeddedPiSession } from "../agents/pi-embedded-subscribe.js";
import { createClientToolNameConflictError } from "../agents/pi-tool-definition-adapter.js";
import { HISTORY_CONTEXT_MARKER } from "../auto-reply/reply/history.js";
import { CURRENT_MESSAGE_MARKER } from "../auto-reply/reply/mentions.js";
import { emitAgentEvent } from "../infra/agent-events.js";
import { buildAssistantDeltaResult } from "./test-helpers.agent-results.js";
import {
  agentCommand,
  getFreePort,
  installGatewayTestHooks,
  startGatewayServerWithRetries,
  testState,
  withGatewayServer,
} from "./test-helpers.js";

installGatewayTestHooks({ scope: "suite" });

let startGatewayServer: typeof import("./server.js").startGatewayServer;
let enabledServer: Awaited<ReturnType<typeof startServer>>;
let enabledPort: number;

beforeAll(async () => {
  ({ startGatewayServer } = await import("./server.js"));
  const started = await startGatewayServerWithRetries({
    port: await getFreePort(),
    opts: {
      host: "127.0.0.1",
      auth: { mode: "none" },
      controlUiEnabled: false,
      openAiChatCompletionsEnabled: true,
    },
  });
  enabledPort = started.port;
  enabledServer = started.server;
});

afterAll(async () => {
  await enabledServer?.close({ reason: "openai http enabled suite done" });
});

async function startServer(port: number, opts?: { openAiChatCompletionsEnabled?: boolean }) {
  return await startGatewayServer(port, {
    host: "127.0.0.1",
    auth: { mode: "none" },
    controlUiEnabled: false,
    openAiChatCompletionsEnabled: opts?.openAiChatCompletionsEnabled ?? true,
  });
}

async function startTokenServer(port: number, opts?: { openAiChatCompletionsEnabled?: boolean }) {
  return await startGatewayServer(port, {
    host: "127.0.0.1",
    auth: { mode: "token", token: "secret" },
    controlUiEnabled: false,
    openAiChatCompletionsEnabled: opts?.openAiChatCompletionsEnabled ?? true,
  });
}

async function writeGatewayConfig(config: Record<string, unknown>) {
  const configPath = process.env.RECALL_CONFIG_PATH;
  if (!configPath) {
    throw new Error("RECALL_CONFIG_PATH is required for gateway config tests");
  }
  await fs.mkdir(path.dirname(configPath), { recursive: true });
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");
}

async function postChatCompletions(port: number, body: unknown, headers?: Record<string, string>) {
  const res = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-recall-scopes": "operator.write",
      ...headers,
    },
    body: JSON.stringify(body),
  });
  return res;
}

function parseSseDataLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("data: "))
    .map((line) => line.slice("data: ".length));
}

type FirstAgentCommandOptions = {
  clientTools?: Array<{
    function?: {
      description?: string;
      name?: string;
      parameters?: Record<string, unknown>;
      strict?: boolean;
    };
    type?: string;
  }>;
  extraSystemPrompt?: string;
  images?: Array<{ data: string; mimeType: string; type: string }>;
  message?: string;
  messageChannel?: string;
  model?: string;
  sessionKey?: string;
  streamParams?: {
    maxTokens?: number;
    responseFormat?: Record<string, unknown>;
    temperature?: number;
    topP?: number;
  };
};

function firstAgentCommandOptions() {
  return agentCommand.mock.calls.at(0)?.[0] as FirstAgentCommandOptions | undefined;
}

describe("OpenAI-compatible HTTP API (e2e)", () => {
  it("handles request validation and routing", async () => {
    const port = enabledPort;
    const mockAgentOnce = (payloads: Array<{ text: string }>) => {
      agentCommand.mockClear();
      agentCommand.mockResolvedValueOnce({ payloads } as never);
    };
    const expectAgentSessionKeyMatch = async (request: {
      body: unknown;
      headers?: Record<string, string>;
      matcher: RegExp;
    }) => {
      mockAgentOnce([{ text: "hello" }]);
      const res = await postChatCompletions(port, request.body, request.headers);
      expect(res.status).toBe(200);
      expect(agentCommand).toHaveBeenCalledTimes(1);
      expect(firstAgentCommandOptions()?.sessionKey ?? "").toMatch(request.matcher);
      await res.text();
    };
    const expectMessageContext = (
      message: string,
      expected: { history: string[]; current: string[] },
    ) => {
      expect(message).toContain(HISTORY_CONTEXT_MARKER);
      for (const line of expected.history) {
        expect(message).toContain(line);
      }
      expect(message).toContain(CURRENT_MESSAGE_MARKER);
      for (const line of expected.current) {
        expect(message).toContain(line);
      }
    };
    const getFirstAgentCall = () => firstAgentCommandOptions();
    const getFirstAgentMessage = () => getFirstAgentCall()?.message ?? "";
    const expectInvalidRequestNoDispatch = async (messages: unknown[]) => {
      agentCommand.mockClear();
      const res = await postChatCompletions(port, {
        model: "recall",
        messages,
      });
      expect(res.status).toBe(400);
      const json = (await res.json()) as Record<string, unknown>;
      expect((json.error as Record<string, unknown> | undefined)?.type).toBe(
        "invalid_request_error",
      );
      expect(agentCommand).toHaveBeenCalledTimes(0);
    };
    const postSyncUserMessage = async (message: string) => {
      const res = await postChatCompletions(port, {
        stream: false,
        model: "recall",
        messages: [{ role: "user", content: message }],
      });
      expect(res.status).toBe(200);
      return (await res.json()) as Record<string, unknown>;
    };

    try {
      {
        const res = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
          method: "GET",
          headers: { authorization: "Bearer secret" },
        });
        expect(res.status).toBe(405);
        await res.text();
      }

      {
        mockAgentOnce([{ text: "hello" }]);
        const res = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }),
        });
        expect(res.status).toBe(200);
        expect(agentCommand).toHaveBeenCalledTimes(1);
        expect(getFirstAgentCall()?.messageChannel).toBe("webchat");
        await res.text();
      }

      await expectAgentSessionKeyMatch({
        body: { model: "recall", messages: [{ role: "user", content: "hi" }] },
        headers: { "x-recall-agent-id": "beta" },
        matcher: /^agent:beta:/,
      });

      await expectAgentSessionKeyMatch({
        body: {
          model: "recall/beta",
          messages: [{ role: "user", content: "hi" }],
        },
        matcher: /^agent:beta:/,
      });

      await expectAgentSessionKeyMatch({
        body: {
          model: "recall/default",
          messages: [{ role: "user", content: "hi" }],
        },
        matcher: /^agent:main:/,
      });

      {
        mockAgentOnce([{ text: "hello" }]);
        const res = await postChatCompletions(
          port,
          { model: "recall", messages: [{ role: "user", content: "hi" }] },
          {
            "x-recall-agent-id": "beta",
            "x-recall-session-key": "agent:beta:openai:custom",
          },
        );
        expect(res.status).toBe(200);

        expect(firstAgentCommandOptions()?.sessionKey).toBe("agent:beta:openai:custom");
        await res.text();
      }

      {
        mockAgentOnce([{ text: "hello" }]);
        const res = await postChatCompletions(port, {
          user: "alice",
          model: "recall",
          messages: [{ role: "user", content: "hi" }],
        });
        expect(res.status).toBe(200);

        expect(firstAgentCommandOptions()?.sessionKey ?? "").toContain("openai-user:alice");
        await res.text();
      }

      {
        mockAgentOnce([{ text: "hello" }]);
        const res = await postChatCompletions(
          port,
          {
            model: "recall",
            messages: [{ role: "user", content: "hi" }],
          },
          { "x-recall-message-channel": "custom-client-channel" },
        );
        expect(res.status).toBe(200);
        expect(getFirstAgentCall()?.messageChannel).toBe("custom-client-channel");
        await res.text();
      }

      {
        mockAgentOnce([{ text: "hello" }]);
        const res = await postChatCompletions(
          port,
          {
            model: "recall",
            messages: [{ role: "user", content: "hi" }],
          },
          {
            "x-recall-model": "openai/gpt-5.4",
          },
        );
        expect(res.status).toBe(200);
        expect(firstAgentCommandOptions()?.model).toBe("openai/gpt-5.4");
        await res.text();
      }

      {
        await writeGatewayConfig({
          agents: {
            defaults: {
              model: { primary: "openai/gpt-5.4" },
              models: {
                "openai/gpt-5.4": {},
              },
            },
          },
        });
        mockAgentOnce([{ text: "hello" }]);
        const res = await postChatCompletions(
          port,
          {
            model: "recall",
            messages: [{ role: "user", content: "hi" }],
          },
          {
            "x-recall-model": "gpt-5.4",
          },
        );
        expect(res.status).toBe(200);
        expect(firstAgentCommandOptions()?.model).toBe("gpt-5.4");
        await res.text();
        await writeGatewayConfig({});
      }

      {
        agentCommand.mockClear();
        const res = await postChatCompletions(port, {
          model: "openai/",
          messages: [{ role: "user", content: "hi" }],
        });
        expect(res.status).toBe(400);
        const json = (await res.json()) as { error?: { type?: string; message?: string } };
        expect(json.error?.type).toBe("invalid_request_error");
        expect(json.error?.message).toBe(
          "Invalid `model`. Use `recall` or `recall/<agentId>`.",
        );
        expect(agentCommand).toHaveBeenCalledTimes(0);
      }

      {
        agentCommand.mockClear();
        const res = await postChatCompletions(
          port,
          {
            model: "recall",
            messages: [{ role: "user", content: "hi" }],
          },
          { "x-recall-model": "openai/" },
        );
        expect(res.status).toBe(400);
        const json = (await res.json()) as { error?: { type?: string; message?: string } };
        expect(json.error?.type).toBe("invalid_request_error");
        expect(json.error?.message).toBe("Invalid `x-recall-model`.");
        expect(agentCommand).toHaveBeenCalledTimes(0);
      }

      {
        mockAgentOnce([{ text: "hello" }]);
        const res = await postChatCompletions(port, {
          model: "recall",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "hello" },
                { type: "input_text", text: "world" },
              ],
            },
          ],
        });
        expect(res.status).toBe(200);

        expect(firstAgentCommandOptions()?.message).toBe("hello\nworld");
        await res.text();
      }

      {
        const imageData = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAA";
        mockAgentOnce([{ text: "looks good" }]);
        const res = await postChatCompletions(port, {
          model: "recall",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "describe this" },
                {
                  type: "image_url",
                  image_url: { url: `data:image/png;base64,${imageData}` },
                },
              ],
            },
          ],
        });
        expect(res.status).toBe(200);

        const firstCall = getFirstAgentCall();
        expect(firstCall?.message).toBe("describe this");
        expect(firstCall?.images).toEqual([
          { type: "image", data: imageData, mimeType: "image/png" },
        ]);
        await res.text();
      }

      {
        const imageData = "QUJDRA==";
        mockAgentOnce([{ text: "supports data-uri params" }]);
        const res = await postChatCompletions(port, {
          model: "recall",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "with metadata params" },
                {
                  type: "image_url",
                  image_url: { url: `data:image/png;charset=utf-8;base64,${imageData}` },
                },
              ],
            },
          ],
        });
        expect(res.status).toBe(200);

        const firstCall = getFirstAgentCall();
        expect(firstCall?.images).toEqual([
          { type: "image", data: imageData, mimeType: "image/png" },
        ]);
        await res.text();
      }

      await expectInvalidRequestNoDispatch([
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: "https://example.com/image.png" },
            },
          ],
        },
      ]);

      {
        mockAgentOnce([{ text: "I can see the image" }]);
        const res = await postChatCompletions(port, {
          model: "recall",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: { url: "data:image/jpeg;base64,QUJDRA==" },
                },
              ],
            },
          ],
        });
        expect(res.status).toBe(200);

        const firstCall = getFirstAgentCall();
        expect(firstCall?.message).toContain("User sent image(s) with no text.");
        expect(firstCall?.images).toEqual([
          { type: "image", data: "QUJDRA==", mimeType: "image/jpeg" },
        ]);
        await res.text();
      }

      {
        mockAgentOnce([{ text: "follow up answer" }]);
        const res = await postChatCompletions(port, {
          model: "recall",
          messages: [
            {
              role: "user",
              content: [
                { type: "image_url", image_url: { url: "data:image/png;base64,QUJDRA==" } },
              ],
            },
            { role: "assistant", content: "I can see it." },
            { role: "user", content: "What color was it?" },
          ],
        });
        expect(res.status).toBe(200);

        const firstCall = getFirstAgentCall();
        expect(firstCall?.images).toBeUndefined();
        expect(firstCall?.message ?? "").not.toContain("User sent image(s) with no text.");
        await res.text();
      }

      {
        mockAgentOnce([{ text: "latest image only" }]);
        const res = await postChatCompletions(port, {
          model: "recall",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "first" },
                { type: "image_url", image_url: { url: "data:image/png;base64,QUFBQQ==" } },
              ],
            },
            { role: "assistant", content: "noted" },
            {
              role: "user",
              content: [
                { type: "text", text: "second" },
                { type: "image_url", image_url: { url: "data:image/png;base64,QkJCQg==" } },
              ],
            },
          ],
        });
        expect(res.status).toBe(200);

        const firstCall = getFirstAgentCall();
        expect(firstCall?.images).toEqual([
          { type: "image", data: "QkJCQg==", mimeType: "image/png" },
        ]);
        await res.text();
      }

      {
        const largeMessage = "x".repeat(1_200_000);
        mockAgentOnce([{ text: "accepted" }]);
        const res = await postChatCompletions(port, {
          model: "recall",
          messages: [{ role: "user", content: largeMessage }],
        });
        expect(res.status).toBe(200);
        await res.text();
      }

      await expectInvalidRequestNoDispatch([
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: "data:application/pdf;base64,QUJDRA==" },
            },
          ],
        },
      ]);

      {
        const manyImageParts = Array.from({ length: 9 }).map(() => ({
          type: "image_url",
          image_url: { url: "data:image/png;base64,QUJDRA==" },
        }));
        await expectInvalidRequestNoDispatch([
          {
            role: "user",
            content: manyImageParts,
          },
        ]);
      }

      {
        mockAgentOnce([{ text: "I am Claude" }]);
        const res = await postChatCompletions(port, {
          model: "recall",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "Hello, who are you?" },
            { role: "assistant", content: "I am Claude." },
            { role: "user", content: "What did I just ask you?" },
          ],
        });
        expect(res.status).toBe(200);

        const message = getFirstAgentMessage();
        expectMessageContext(message, {
          history: ["User: Hello, who are you?", "Assistant: I am Claude."],
          current: ["User: What did I just ask you?"],
        });
        await res.text();
      }

      {
        mockAgentOnce([{ text: "hello" }]);
        const res = await postChatCompletions(port, {
          model: "recall",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "Hello" },
          ],
        });
        expect(res.status).toBe(200);

        const message = getFirstAgentMessage();
        expect(message).not.toContain(HISTORY_CONTEXT_MARKER);
        expect(message).not.toContain(CURRENT_MESSAGE_MARKER);
        expect(message).toBe("Hello");
        await res.text();
      }

      {
        mockAgentOnce([{ text: "hello" }]);
        const res = await postChatCompletions(port, {
          model: "recall",
          messages: [
            { role: "developer", content: "You are a helpful assistant." },
            { role: "user", content: "Hello" },
          ],
        });
        expect(res.status).toBe(200);

        const extraSystemPrompt = getFirstAgentCall()?.extraSystemPrompt ?? "";
        expect(extraSystemPrompt).toBe("You are a helpful assistant.");
        await res.text();
      }

      {
        mockAgentOnce([{ text: "ok" }]);
        const res = await postChatCompletions(port, {
          model: "recall",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "What's the weather?" },
            { role: "assistant", content: "Checking the weather." },
            { role: "tool", content: "Sunny, 70F." },
          ],
        });
        expect(res.status).toBe(200);

        const message = getFirstAgentMessage();
        expectMessageContext(message, {
          history: ["User: What's the weather?", "Assistant: Checking the weather."],
          current: ["Tool: Sunny, 70F."],
        });
        await res.text();
      }

      {
        mockAgentOnce([{ text: "tool follow-up ok" }]);
        const res = await postChatCompletions(port, {
          model: "recall",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "look at this" },
                { type: "image_url", image_url: { url: "https://example.com/image.png" } },
              ],
            },
            { role: "assistant", content: "Checking the image." },
            { role: "tool", content: "Vision tool says it is blue." },
          ],
        });
        expect(res.status).toBe(200);

        const firstCall = getFirstAgentCall();
        expect(firstCall?.images).toBeUndefined();
        const message = getFirstAgentMessage();
        expectMessageContext(message, {
          history: ["User: look at this", "Assistant: Checking the image."],
          current: ["Tool: Vision tool says it is blue."],
        });
        expect(message).not.toContain("User sent image(s) with no text.");
        await res.text();
      }

      {
        mockAgentOnce([{ text: "tool choice none" }]);
        const res = await postChatCompletions(port, {
          model: "recall",
          tool_choice: "none",
          tools: [
            {
              type: "function",
              function: {
                name: "get_time",
                description: "Get current time",
                parameters: { type: "object", properties: {} },
              },
            },
          ],
          messages: [{ role: "user", content: "time?" }],
        });
        expect(res.status).toBe(200);
        const firstCall = getFirstAgentCall();
        expect(firstCall?.clientTools).toBeUndefined();
        await res.text();
      }

      {
        mockAgentOnce([{ text: "tool choice auto" }]);
        const res = await postChatCompletions(port, {
          model: "recall",
          tool_choice: "auto",
          tools: [
            {
              type: "function",
              function: {
                name: "get_time",
                description: "Get current time",
                parameters: { type: "object", properties: {} },
                strict: true,
              },
            },
          ],
          messages: [{ role: "user", content: "time?" }],
        });
        expect(res.status).toBe(200);
        const firstCall = getFirstAgentCall();
        const clientTools = firstCall?.clientTools ?? [];
        expect(clientTools).toHaveLength(1);
        expect(clientTools[0]?.type).toBe("function");
        expect(clientTools[0]?.function?.name).toBe("get_time");
        expect(clientTools[0]?.function?.strict).toBe(true);
        expect(firstCall).not.toHaveProperty("toolsAllow");
        await res.text();
      }

      {
        agentCommand.mockClear();
        const res = await postChatCompletions(port, {
          model: "recall",
          tool_choice: { type: "function", function: { name: "get_weather" } },
          tools: [
            {
              type: "function",
              function: {
                name: "get_time",
                description: "Get current time",
                parameters: { type: "object", properties: {} },
              },
            },
            {
              type: "function",
              function: {
                name: "get_weather",
                description: "Get current weather",
                parameters: {
                  type: "object",
                  properties: { city: { type: "string" } },
                  required: ["city"],
                },
              },
            },
          ],
          messages: [{ role: "user", content: "weather?" }],
        });
        expect(res.status).toBe(400);
        const json = (await res.json()) as { error?: { type?: string; message?: string } };
        expect(json.error?.type).toBe("invalid_request_error");
        expect(json.error?.message ?? "").toContain("not supported");
        expect(agentCommand).toHaveBeenCalledTimes(0);
      }

      {
        agentCommand.mockClear();
        const res = await postChatCompletions(port, {
          model: "recall",
          tool_choice: "required",
          messages: [{ role: "user", content: "weather?" }],
        });
        expect(res.status).toBe(400);
        const json = (await res.json()) as { error?: { type?: string; message?: string } };
        expect(json.error?.type).toBe("invalid_request_error");
        expect(json.error?.message ?? "").toContain("tool_choice=required");
        expect(agentCommand).toHaveBeenCalledTimes(0);
      }

      {
        agentCommand.mockClear();
        const res = await postChatCompletions(port, {
          model: "recall",
          tool_choice: { type: "function", function: { name: "missing_tool" } },
          tools: [
            {
              type: "function",
              function: {
                name: "get_time",
                description: "Get current time",
                parameters: { type: "object", properties: {} },
              },
            },
          ],
          messages: [{ role: "user", content: "weather?" }],
        });
        expect(res.status).toBe(400);
        const json = (await res.json()) as { error?: { type?: string; message?: string } };
        expect(json.error?.type).toBe("invalid_request_error");
        expect(json.error?.message ?? "").toContain("not supported");
        expect(agentCommand).toHaveBeenCalledTimes(0);
      }

      {
        agentCommand.mockClear();
        const res = await postChatCompletions(port, {
          model: "recall",
          tool_choice: {
            type: "allowed_tools",
            tools: [{ type: "function", function: { name: "x" } }],
          },
          tools: [
            {
              type: "function",
              function: {
                name: "x",
                description: "x",
                parameters: { type: "object", properties: {} },
              },
            },
          ],
          messages: [{ role: "user", content: "x?" }],
        });
        expect(res.status).toBe(400);
        const json = (await res.json()) as { error?: { type?: string; message?: string } };
        expect(json.error?.type).toBe("invalid_request_error");
        expect(json.error?.message ?? "").toContain("allowed_tools");
        expect(agentCommand).toHaveBeenCalledTimes(0);
      }

      {
        agentCommand.mockClear();
        const res = await postChatCompletions(port, {
          model: "recall",
          tools: [
            {
              type: "function",
              name: "invalid_flat_shape",
              parameters: { type: "object", properties: {} },
            },
          ],
          messages: [{ role: "user", content: "x?" }],
        });
        expect(res.status).toBe(400);
        const json = (await res.json()) as { error?: { type?: string; message?: string } };
        expect(json.error?.type).toBe("invalid_request_error");
        expect(json.error?.message ?? "").toContain("tool.function is required");
        expect(agentCommand).toHaveBeenCalledTimes(0);
      }

      {
        mockAgentOnce([{ text: "ok" }]);
        const res = await postChatCompletions(port, {
          model: "recall",
          messages: [
            { role: "user", content: "What's the weather?" },
            { role: "assistant", content: "Checking the weather." },
            {
              role: "tool",
              tool_call_id: "call_1",
              content: [{ type: "text", text: "Sunny, 70F." }],
            },
          ],
        });
        expect(res.status).toBe(200);
        const message = getFirstAgentMessage();
        expectMessageContext(message, {
          history: ["User: What's the weather?", "Assistant: Checking the weather."],
          current: ["Tool:call_1: Sunny, 70F."],
        });
        await res.text();
      }

      {
        mockAgentOnce([{ text: "ok" }]);
        const res = await postChatCompletions(port, {
          model: "recall",
          messages: [
            { role: "user", content: "What's the weather?" },
            {
              role: "assistant",
              content: null,
              tool_calls: [
                {
                  id: "call_1",
                  type: "function",
                  function: {
                    name: "get_weather",
                    arguments: '{"city":"Taipei"}',
                  },
                },
              ],
            },
            {
              role: "tool",
              tool_call_id: "call_1",
              content: [{ type: "text", text: "Sunny, 70F." }],
            },
          ],
        });
        expect(res.status).toBe(200);
        const message = getFirstAgentMessage();
        expectMessageContext(message, {
          history: [
            "User: What's the weather?",
            'Assistant: tool_call id=call_1 name=get_weather arguments={"city":"Taipei"}',
          ],
          current: ["Tool:call_1: Sunny, 70F."],
        });
        await res.text();
      }

      {
        agentCommand.mockClear();
        agentCommand.mockRejectedValueOnce(createClientToolNameConflictError(["exec"]));
        const res = await postChatCompletions(port, {
          stream: false,
          model: "recall",
          tools: [
            {
              type: "function",
              function: {
                name: "exec",
                description: "conflicts with a built-in tool",
                parameters: { type: "object", properties: {} },
              },
            },
          ],
          messages: [{ role: "user", content: "run command" }],
        });
        expect(res.status).toBe(400);
        const json = (await res.json()) as { error?: { type?: string; message?: string } };
        expect(json.error?.type).toBe("invalid_request_error");
        expect(json.error?.message).toBe("invalid tool configuration");
      }

      {
        agentCommand.mockClear();
        agentCommand.mockResolvedValueOnce({
          payloads: [{ text: "Let me check that." }],
          meta: {
            stopReason: "tool_calls",
            pendingToolCalls: [
              {
                id: "call_1",
                name: "get_weather",
                arguments: '{"city":"Taipei"}',
              },
              {
                id: "call_2",
                name: "get_time",
                arguments: "{}",
              },
            ],
            agentMeta: {
              usage: {
                input: 10,
                output: 5,
                total: 15,
              },
            },
          },
        } as never);
        const res = await postChatCompletions(port, {
          stream: false,
          model: "recall",
          tool_choice: "auto",
          tools: [
            {
              type: "function",
              function: {
                name: "get_weather",
                description: "Get weather",
                parameters: { type: "object", properties: { city: { type: "string" } } },
              },
            },
            {
              type: "function",
              function: {
                name: "get_time",
                description: "Get time",
                parameters: { type: "object", properties: {} },
              },
            },
          ],
          messages: [{ role: "user", content: "weather?" }],
        });
        expect(res.status).toBe(200);
        const json = (await res.json()) as {
          choices?: Array<{
            finish_reason?: string | null;
            message?: {
              role?: string;
              content?: string;
              tool_calls?: Array<{
                index?: number;
                id?: string;
                type?: string;
                function?: { name?: string; arguments?: string };
              }>;
            };
          }>;
        };
        const choice = json.choices?.[0];
        expect(choice?.finish_reason).toBe("tool_calls");
        expect(choice?.message?.role).toBe("assistant");
        expect(choice?.message?.content).toBe("Let me check that.");
        expect(choice?.message?.tool_calls).toEqual([
          {
            id: "call_1",
            type: "function",
            function: { name: "get_weather", arguments: '{"city":"Taipei"}' },
          },
          {
            id: "call_2",
            type: "function",
            function: { name: "get_time", arguments: "{}" },
          },
        ]);
        expect(choice?.message?.tool_calls?.some((call) => Object.hasOwn(call, "index"))).toBe(
          false,
        );
      }

      {
        agentCommand.mockClear();
        agentCommand.mockResolvedValueOnce({
          payloads: [],
          meta: {
            stopReason: "tool_calls",
            pendingToolCalls: [
              {
                id: "call_1",
                name: "get_weather",
                arguments: '{"city":"Taipei"}',
              },
            ],
          },
        } as never);
        const res = await postChatCompletions(port, {
          stream: false,
          model: "recall",
          tool_choice: "auto",
          tools: [
            {
              type: "function",
              function: {
                name: "get_weather",
                description: "Get weather",
                parameters: { type: "object", properties: { city: { type: "string" } } },
              },
            },
          ],
          messages: [{ role: "user", content: "weather?" }],
        });
        expect(res.status).toBe(200);
        const json = (await res.json()) as {
          choices?: Array<{
            finish_reason?: string | null;
            message?: { content?: string; tool_calls?: unknown[] };
          }>;
        };
        const choice = json.choices?.[0];
        expect(choice?.finish_reason).toBe("tool_calls");
        expect(choice?.message?.content).toBe("");
        expect(choice?.message?.tool_calls).toHaveLength(1);
      }

      {
        mockAgentOnce([{ text: "hello" }]);
        const json = await postSyncUserMessage("hi");
        expect(json.object).toBe("chat.completion");
        expect(Array.isArray(json.choices)).toBe(true);
        const choice0 = (json.choices as Array<Record<string, unknown>>)[0] ?? {};
        const msg = (choice0.message as Record<string, unknown> | undefined) ?? {};
        expect(msg.role).toBe("assistant");
        expect(msg.content).toBe("hello");
      }

      {
        agentCommand.mockClear();
        agentCommand.mockImplementationOnce((async (opts: unknown) => {
          const runId = (opts as { runId?: string } | undefined)?.runId ?? "";
          const { session, emit } = createStubSessionHarness();
          subscribeEmbeddedPiSession({ session, runId });
          emit({ type: "message_start", message: { role: "assistant" } });
          for (const delta of ["<", "final>Title\n", "Line one\nLine two</", "final>"]) {
            emitAssistantTextDelta({ emit, delta });
          }
          return { payloads: [{ text: "Title\nLine one\nLine two" }] };
        }) as never);

        const splitFinalRes = await postChatCompletions(port, {
          stream: true,
          model: "recall",
          messages: [{ role: "user", content: "hi" }],
        });
        expect(splitFinalRes.status).toBe(200);
        const splitFinalText = await splitFinalRes.text();
        const splitFinalData = parseSseDataLines(splitFinalText);
        const splitFinalChunks = splitFinalData
          .filter((d) => d !== "[DONE]")
          .map((d) => JSON.parse(d) as Record<string, unknown>);
        const splitFinalContent = splitFinalChunks
          .flatMap((c) => (c.choices as Array<Record<string, unknown>> | undefined) ?? [])
          .map((choice) => (choice.delta as Record<string, unknown> | undefined)?.content)
          .filter((v): v is string => typeof v === "string")
          .join("");
        expect(splitFinalContent).toBe("Title\nLine one\nLine two");
        expect(splitFinalContent).not.toContain("<");
        expect(splitFinalContent).not.toContain("final>");
      }

      {
        agentCommand.mockClear();
        agentCommand.mockResolvedValueOnce({
          payloads: [{ text: "usage basic" }],
          meta: {
            agentMeta: {
              usage: {
                input: 42,
                output: 17,
              },
            },
          },
        } as never);
        const json = await postSyncUserMessage("usage");
        expect(json.usage).toEqual({
          prompt_tokens: 42,
          completion_tokens: 17,
          total_tokens: 59,
        });
      }

      {
        agentCommand.mockClear();
        agentCommand.mockResolvedValueOnce({
          payloads: [{ text: "usage cache" }],
          meta: {
            agentMeta: {
              usage: {
                input: 10,
                output: 5,
                cacheRead: 20,
                cacheWrite: 3,
              },
            },
          },
        } as never);
        const json = await postSyncUserMessage("usage");
        expect(json.usage).toEqual({
          prompt_tokens: 30,
          completion_tokens: 5,
          total_tokens: 35,
        });
      }

      {
        agentCommand.mockClear();
        agentCommand.mockResolvedValueOnce({
          payloads: [{ text: "usage total" }],
          meta: {
            agentMeta: {
              usage: {
                input: 10,
                output: 5,
                total: 100,
              },
            },
          },
        } as never);
        const json = await postSyncUserMessage("usage");
        expect(json.usage).toEqual({
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 100,
        });
      }

      {
        agentCommand.mockClear();
        agentCommand.mockResolvedValueOnce({
          payloads: [{ text: "usage total only" }],
          meta: {
            agentMeta: {
              usage: {
                total: 123,
              },
            },
          },
        } as never);
        const json = await postSyncUserMessage("usage");
        expect(json.usage).toEqual({
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 123,
        });
      }

      {
        agentCommand.mockClear();
        agentCommand.mockResolvedValueOnce({
          payloads: [{ text: "usage non-finite" }],
          meta: {
            agentMeta: {
              usage: {
                input: Number.POSITIVE_INFINITY,
                output: Number.NaN,
                cacheRead: 2,
                cacheWrite: Number.POSITIVE_INFINITY,
                total: Number.NaN,
              },
            },
          },
        } as never);
        const json = await postSyncUserMessage("usage");
        expect(json.usage).toEqual({
          prompt_tokens: 2,
          completion_tokens: 0,
          total_tokens: 2,
        });
      }

      {
        agentCommand.mockClear();
        agentCommand.mockResolvedValueOnce({
          payloads: [{ text: "usage non-finite aggregate fallback" }],
          meta: {
            agentMeta: {
              usage: {
                input: Number.POSITIVE_INFINITY,
                output: Number.NaN,
                total: 123,
              },
            },
          },
        } as never);
        const json = await postSyncUserMessage("usage");
        expect(json.usage).toEqual({
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 123,
        });
      }

      {
        agentCommand.mockClear();
        agentCommand.mockResolvedValueOnce({
          payloads: [{ text: "usage cache-write only" }],
          meta: {
            agentMeta: {
              usage: {
                cacheWrite: 10,
                total: 10,
              },
            },
          },
        } as never);
        const json = await postSyncUserMessage("usage");
        expect(json.usage).toEqual({
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 10,
        });
      }

      {
        agentCommand.mockClear();
        agentCommand.mockResolvedValueOnce({ payloads: [{ text: "" }] } as never);
        const json = await postSyncUserMessage("hi");
        const choice0 = (json.choices as Array<Record<string, unknown>>)[0] ?? {};
        const msg = (choice0.message as Record<string, unknown> | undefined) ?? {};
        expect(msg.content).toBe("No response from Recall.");
      }

      {
        const res = await postChatCompletions(port, {
          model: "recall",
          messages: [{ role: "system", content: "yo" }],
        });
        expect(res.status).toBe(400);
        const missingUserJson = (await res.json()) as Record<string, unknown>;
        expect((missingUserJson.error as Record<string, unknown> | undefined)?.type).toBe(
          "invalid_request_error",
        );
      }
    } finally {
      // shared server
    }
  });

  it("forwards inbound max_completion_tokens and max_tokens into streamParams", async () => {
    const port = enabledPort;
    const mockAgentOnce = (payloads: Array<{ text: string }>) => {
      agentCommand.mockClear();
      agentCommand.mockResolvedValueOnce({ payloads } as never);
    };
    const getFirstAgentMaxTokens = () => firstAgentCommandOptions()?.streamParams?.maxTokens;

    {
      mockAgentOnce([{ text: "hello" }]);
      const res = await postChatCompletions(port, {
        model: "recall",
        max_completion_tokens: 256,
        messages: [{ role: "user", content: "hi" }],
      });
      expect(res.status).toBe(200);
      expect(getFirstAgentMaxTokens()).toBe(256);
      await res.text();
    }

    {
      mockAgentOnce([{ text: "hello" }]);
      const res = await postChatCompletions(port, {
        model: "recall",
        max_tokens: 128,
        messages: [{ role: "user", content: "hi" }],
      });
      expect(res.status).toBe(200);
      expect(getFirstAgentMaxTokens()).toBe(128);
      await res.text();
    }

    {
      mockAgentOnce([{ text: "hello" }]);
      const res = await postChatCompletions(port, {
        model: "recall",
        max_completion_tokens: 64,
        max_tokens: 999,
        messages: [{ role: "user", content: "hi" }],
      });
      expect(res.status).toBe(200);
      expect(getFirstAgentMaxTokens()).toBe(64);
      await res.text();
    }

    {
      mockAgentOnce([{ text: "hello" }]);
      const res = await postChatCompletions(port, {
        model: "recall",
        messages: [{ role: "user", content: "hi" }],
      });
      expect(res.status).toBe(200);
      expect(getFirstAgentMaxTokens()).toBeUndefined();
      await res.text();
    }
  });

  it("forwards inbound temperature and top_p into streamParams", async () => {
    const port = enabledPort;
    const mockAgentOnce = (payloads: Array<{ text: string }>) => {
      agentCommand.mockClear();
      agentCommand.mockResolvedValueOnce({ payloads } as never);
    };
    const getStreamParams = () => firstAgentCommandOptions()?.streamParams;

    {
      mockAgentOnce([{ text: "hello" }]);
      const res = await postChatCompletions(port, {
        model: "recall",
        temperature: 0.3,
        top_p: 0.95,
        messages: [{ role: "user", content: "hi" }],
      });
      expect(res.status).toBe(200);
      expect(getStreamParams()).toMatchObject({ temperature: 0.3, topP: 0.95 });
      await res.text();
    }

    {
      mockAgentOnce([{ text: "hello" }]);
      const res = await postChatCompletions(port, {
        model: "recall",
        temperature: 0,
        messages: [{ role: "user", content: "hi" }],
      });
      expect(res.status).toBe(200);
      const params = getStreamParams();
      expect(params?.temperature).toBe(0);
      expect(params?.topP).toBeUndefined();
      await res.text();
    }

    {
      mockAgentOnce([{ text: "hello" }]);
      const res = await postChatCompletions(port, {
        model: "recall",
        messages: [{ role: "user", content: "hi" }],
      });
      expect(res.status).toBe(200);
      expect(getStreamParams()).toBeUndefined();
      await res.text();
    }

    {
      agentCommand.mockClear();
      const res = await postChatCompletions(port, {
        model: "recall",
        temperature: 999,
        messages: [{ role: "user", content: "hi" }],
      });
      expect(res.status).toBe(400);
      const json = (await res.json()) as { error?: { type?: string; message?: string } };
      expect(json.error?.type).toBe("invalid_request_error");
      expect(json.error?.message).toMatch(/temperature/);
      expect(agentCommand).toHaveBeenCalledTimes(0);
    }

    {
      agentCommand.mockClear();
      const res = await postChatCompletions(port, {
        model: "recall",
        top_p: 5,
        messages: [{ role: "user", content: "hi" }],
      });
      expect(res.status).toBe(400);
      const json = (await res.json()) as { error?: { type?: string; message?: string } };
      expect(json.error?.type).toBe("invalid_request_error");
      expect(json.error?.message).toMatch(/top_p/);
      expect(agentCommand).toHaveBeenCalledTimes(0);
    }
  });

  it("maps provider format failures to OpenAI-compatible 400 errors", async () => {
    const port = enabledPort;

    agentCommand.mockClear();
    agentCommand.mockRejectedValueOnce(
      new FailoverError(
        "LLM request failed: provider rejected the request schema or tool payload.",
        {
          reason: "format",
          status: 400,
          code: "decimal_above_max_value",
          rawError:
            "400 Invalid 'temperature': decimal above maximum value. Expected a value <= 2, but got 999 instead.",
        },
      ) as never,
    );

    const res = await postChatCompletions(port, {
      model: "recall",
      messages: [{ role: "user", content: "hi" }],
    });
    expect(res.status).toBe(400);
    const json = (await res.json()) as {
      error?: { type?: string; code?: string; message?: string };
    };
    expect(json.error?.type).toBe("invalid_request_error");
    expect(json.error?.code).toBe("decimal_above_max_value");
    expect(json.error?.message).toContain("Invalid 'temperature'");
    expect(agentCommand).toHaveBeenCalledTimes(1);
  });

  it("forwards response_format into streamParams", async () => {
    const port = enabledPort;
    const mockAgentOnce = (payloads: Array<{ text: string }>) => {
      agentCommand.mockClear();
      agentCommand.mockResolvedValueOnce({ payloads } as never);
    };
    const getStreamParams = () => firstAgentCommandOptions()?.streamParams;

    {
      mockAgentOnce([{ text: "{}" }]);
      const res = await postChatCompletions(port, {
        model: "recall",
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: "hi" }],
      });
      expect(res.status).toBe(200);
      expect(getStreamParams()).toMatchObject({ responseFormat: { type: "json_object" } });
      await res.text();
    }

    {
      mockAgentOnce([{ text: "{}" }]);
      const res = await postChatCompletions(port, {
        model: "recall",
        response_format: {
          type: "json_schema",
          json_schema: { name: "test", schema: { type: "object" } },
        },
        messages: [{ role: "user", content: "hi" }],
      });
      expect(res.status).toBe(200);
      expect(getStreamParams()).toMatchObject({
        responseFormat: { type: "json_schema" },
      });
      await res.text();
    }

    {
      mockAgentOnce([{ text: "hello" }]);
      const res = await postChatCompletions(port, {
        model: "recall",
        response_format: { type: "text" },
        messages: [{ role: "user", content: "hi" }],
      });
      expect(res.status).toBe(200);
      expect(getStreamParams()).toMatchObject({ responseFormat: { type: "text" } });
      await res.text();
    }

    {
      mockAgentOnce([{ text: "hello" }]);
      const res = await postChatCompletions(port, {
        model: "recall",
        messages: [{ role: "user", content: "hi" }],
      });
      expect(res.status).toBe(200);
      expect(getStreamParams()).toBeUndefined();
      await res.text();
    }

    {
      agentCommand.mockClear();
      const res = await postChatCompletions(port, {
        model: "recall",
        response_format: { type: "xml" },
        messages: [{ role: "user", content: "hi" }],
      });
      expect(res.status).toBe(400);
      const json = (await res.json()) as { error?: { type?: string; message?: string } };
      expect(json.error?.type).toBe("invalid_request_error");
      expect(json.error?.message).toMatch(/response_format/);
      expect(agentCommand).toHaveBeenCalledTimes(0);
    }
  });

  it("returns 429 for repeated failed auth when gateway.auth.rateLimit is configured", async () => {
    testState.gatewayAuth = {
      mode: "token",
      token: "secret",
      rateLimit: { maxAttempts: 1, windowMs: 60_000, lockoutMs: 60_000, exemptLoopback: false },
    } as any;
    await withGatewayServer(
      async ({ port }) => {
        const headers = {
          "content-type": "application/json",
          authorization: "Bearer wrong",
        };
        const body = {
          model: "recall",
          messages: [{ role: "user", content: "hi" }],
        };

        const first = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });
        expect(first.status).toBe(401);

        const second = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });
        expect(second.status).toBe(429);
        expect(second.headers.get("retry-after")).toMatch(/^\d+$/);
      },
      {
        serverOptions: {
          host: "127.0.0.1",
          controlUiEnabled: false,
          openAiChatCompletionsEnabled: true,
        },
      },
    );
  });

  it("streams SSE chunks when stream=true", async () => {
    const port = enabledPort;
    try {
      {
        agentCommand.mockClear();
        agentCommand.mockImplementationOnce((async (opts: unknown) =>
          buildAssistantDeltaResult({
            opts,
            emit: emitAgentEvent,
            deltas: ["he", "llo"],
            text: "hello",
          })) as never);

        const res = await postChatCompletions(port, {
          stream: true,
          model: "recall",
          messages: [{ role: "user", content: "hi" }],
        });
        expect(res.status).toBe(200);
        expect(res.headers.get("content-type") ?? "").toContain("text/event-stream");

        const text = await res.text();
        const data = parseSseDataLines(text);
        expect(data[data.length - 1]).toBe("[DONE]");

        const jsonChunks = data
          .filter((d) => d !== "[DONE]")
          .map((d) => JSON.parse(d) as Record<string, unknown>);
        expect(jsonChunks.map((chunk) => chunk.object)).toContain("chat.completion.chunk");
        const allContent = jsonChunks
          .flatMap((c) => (c.choices as Array<Record<string, unknown>> | undefined) ?? [])
          .map((choice) => (choice.delta as Record<string, unknown> | undefined)?.content)
          .filter((v): v is string => typeof v === "string")
          .join("");
        expect(allContent).toBe("hello");
        const usageChunks = jsonChunks.filter((c) => "usage" in c);
        expect(usageChunks).toHaveLength(0);
      }

      {
        agentCommand.mockClear();
        agentCommand.mockImplementationOnce((async (opts: unknown) =>
          buildAssistantDeltaResult({
            opts,
            emit: emitAgentEvent,
            deltas: ["hi", "hi"],
            text: "hihi",
          })) as never);

        const repeatedRes = await postChatCompletions(port, {
          stream: true,
          model: "recall",
          messages: [{ role: "user", content: "hi" }],
        });
        expect(repeatedRes.status).toBe(200);
        const repeatedText = await repeatedRes.text();
        const repeatedData = parseSseDataLines(repeatedText);
        const repeatedChunks = repeatedData
          .filter((d) => d !== "[DONE]")
          .map((d) => JSON.parse(d) as Record<string, unknown>);
        const repeatedContent = repeatedChunks
          .flatMap((c) => (c.choices as Array<Record<string, unknown>> | undefined) ?? [])
          .map((choice) => (choice.delta as Record<string, unknown> | undefined)?.content)
          .filter((v): v is string => typeof v === "string")
          .join("");
        expect(repeatedContent).toBe("hihi");
      }

      {
        agentCommand.mockClear();
        agentCommand.mockResolvedValueOnce({
          payloads: [{ text: "hello" }],
        } as never);

        const fallbackRes = await postChatCompletions(port, {
          stream: true,
          model: "recall",
          messages: [{ role: "user", content: "hi" }],
        });
        expect(fallbackRes.status).toBe(200);
        const fallbackText = await fallbackRes.text();
        expect(fallbackText).toContain("[DONE]");
        expect(fallbackText).toContain("hello");
      }

      {
        agentCommand.mockClear();
        agentCommand.mockResolvedValueOnce({
          payloads: [{ text: "Let me check that." }],
          meta: {
            stopReason: "tool_calls",
            pendingToolCalls: [
              {
                id: "call_1",
                name: "get_weather",
                arguments: '{"city":"Taipei"}',
              },
            ],
          },
        } as never);

        const toolCallRes = await postChatCompletions(port, {
          stream: true,
          model: "recall",
          messages: [{ role: "user", content: "hi" }],
        });
        expect(toolCallRes.status).toBe(200);
        const toolCallText = await toolCallRes.text();
        const toolCallData = parseSseDataLines(toolCallText);
        const toolCallChunks = toolCallData
          .filter((d) => d !== "[DONE]")
          .map((d) => JSON.parse(d) as Record<string, unknown>);
        const toolDeltaChunks = toolCallChunks.filter((chunk) => {
          const choice = ((chunk.choices as Array<Record<string, unknown>> | undefined) ?? [])[0];
          const delta = (choice?.delta as Record<string, unknown> | undefined) ?? {};
          return Array.isArray(delta.tool_calls);
        });
        expect(toolDeltaChunks.length).toBeGreaterThan(0);
        const toolCallDeltaRecords = toolDeltaChunks.flatMap((chunk) => {
          const choice = ((chunk.choices as Array<Record<string, unknown>> | undefined) ?? [])[0];
          const delta = (choice?.delta as Record<string, unknown> | undefined) ?? {};
          return (delta.tool_calls as Array<Record<string, unknown>> | undefined) ?? [];
        });
        const withIdentity = toolCallDeltaRecords.find(
          (record) =>
            record.id === "call_1" &&
            record.type === "function" &&
            ((record.function as Record<string, unknown> | undefined)?.name as
              | string
              | undefined) === "get_weather",
        );
        if (!withIdentity) {
          throw new Error("expected tool call delta with identity");
        }
        const argsJoined = toolCallDeltaRecords
          .filter((record) => record.index === 0)
          .map(
            (record) =>
              ((record.function as Record<string, unknown> | undefined)?.arguments as
                | string
                | undefined) ?? "",
          )
          .join("");
        expect(argsJoined).toBe('{"city":"Taipei"}');
        const finishChunk = toolCallChunks
          .flatMap((chunk) => (chunk.choices as Array<Record<string, unknown>> | undefined) ?? [])
          .find((choice) => choice.finish_reason === "tool_calls");
        if (!finishChunk) {
          throw new Error("expected tool_calls finish chunk");
        }
      }

      {
        agentCommand.mockClear();
        agentCommand.mockResolvedValueOnce({
          payloads: [{ text: "Let me check that." }],
          meta: {
            stopReason: "tool_calls",
            pendingToolCalls: [
              {
                id: "call_1",
                name: "get_weather",
                arguments: '{"city":"Taipei"}',
              },
            ],
            agentMeta: {
              usage: {
                input: 12,
                output: 3,
                total: 15,
              },
            },
          },
        } as never);

        const toolCallUsageRes = await postChatCompletions(port, {
          stream: true,
          stream_options: { include_usage: true },
          model: "recall",
          messages: [{ role: "user", content: "hi" }],
        });
        expect(toolCallUsageRes.status).toBe(200);
        const toolCallUsageText = await toolCallUsageRes.text();
        const toolCallUsageData = parseSseDataLines(toolCallUsageText);
        const jsonChunks = toolCallUsageData
          .filter((d) => d !== "[DONE]")
          .map((d) => JSON.parse(d) as Record<string, unknown>);
        const usageChunk = jsonChunks.find((chunk) => "usage" in chunk);
        if (!usageChunk) {
          throw new Error("expected streamed usage chunk");
        }
        expect(usageChunk.choices).toEqual([]);
        expect(usageChunk.usage).toEqual({
          prompt_tokens: 12,
          completion_tokens: 3,
          total_tokens: 15,
        });
        expect(toolCallUsageData[toolCallUsageData.length - 1]).toBe("[DONE]");
      }

      {
        agentCommand.mockClear();
        let resolveLateToolCall:
          | ((result: {
              payloads: Array<{ text: string }>;
              meta: {
                stopReason: string;
                pendingToolCalls: Array<{ id: string; name: string; arguments: string }>;
              };
            }) => void)
          | undefined;
        agentCommand.mockImplementationOnce(
          ((opts: unknown) =>
            new Promise((resolve) => {
              resolveLateToolCall = resolve;
              const runId = (opts as { runId?: string } | undefined)?.runId ?? "";
              emitAgentEvent({ runId, stream: "assistant", data: { delta: "Let me check that." } });
              emitAgentEvent({ runId, stream: "lifecycle", data: { phase: "end" } });
            })) as never,
        );

        const lateToolCallRes = await postChatCompletions(port, {
          stream: true,
          model: "recall",
          messages: [{ role: "user", content: "hi" }],
        });
        expect(lateToolCallRes.status).toBe(200);
        const lateToolCallTextPromise = lateToolCallRes.text();
        const earlyCompletion = await Promise.race([
          lateToolCallTextPromise.then(() => "completed" as const),
          new Promise<"pending">((resolve) => {
            setTimeout(() => resolve("pending"), 1200);
          }),
        ]);
        expect(earlyCompletion).toBe("pending");

        resolveLateToolCall?.({
          payloads: [{ text: "Let me check that." }],
          meta: {
            stopReason: "tool_calls",
            pendingToolCalls: [
              {
                id: "call_1",
                name: "get_weather",
                arguments: '{"city":"Taipei"}',
              },
            ],
          },
        });
        const lateToolCallText = await lateToolCallTextPromise;
        const lateToolCallData = parseSseDataLines(lateToolCallText);
        const lateToolCallChunks = lateToolCallData
          .filter((d) => d !== "[DONE]")
          .map((d) => JSON.parse(d) as Record<string, unknown>);
        const finishChunk = lateToolCallChunks
          .flatMap((chunk) => (chunk.choices as Array<Record<string, unknown>> | undefined) ?? [])
          .find((choice) => choice.finish_reason === "tool_calls");
        if (!finishChunk) {
          throw new Error("expected late tool_calls finish chunk");
        }
        const anyToolCalls = lateToolCallChunks.some((chunk) => {
          const choice = ((chunk.choices as Array<Record<string, unknown>> | undefined) ?? [])[0];
          const delta = (choice?.delta as Record<string, unknown> | undefined) ?? {};
          return Array.isArray(delta.tool_calls);
        });
        expect(anyToolCalls).toBe(true);
      }

      {
        agentCommand.mockClear();
        agentCommand.mockRejectedValueOnce(createClientToolNameConflictError(["exec"]));

        const toolConflictRes = await postChatCompletions(port, {
          stream: true,
          model: "recall",
          tools: [
            {
              type: "function",
              function: {
                name: "exec",
                description: "conflicts with a built-in tool",
                parameters: { type: "object", properties: {} },
              },
            },
          ],
          messages: [{ role: "user", content: "run command" }],
        });
        expect(toolConflictRes.status).toBe(200);
        const toolConflictText = await toolConflictRes.text();
        const toolConflictData = parseSseDataLines(toolConflictText);
        expect(toolConflictData[toolConflictData.length - 1]).toBe("[DONE]");

        const toolConflictChunks = toolConflictData
          .filter((d) => d !== "[DONE]")
          .map((d) => JSON.parse(d) as Record<string, unknown>);
        const protocolError = toolConflictChunks.find(
          (chunk) =>
            typeof chunk.error === "object" &&
            ((chunk.error as { type?: unknown }).type ?? "") === "invalid_request_error" &&
            ((chunk.error as { message?: unknown }).message ?? "") === "invalid tool configuration",
        );
        if (!protocolError) {
          throw new Error("expected invalid tool configuration protocol error");
        }
        const stopChoice = toolConflictChunks
          .flatMap((c) => (c.choices as Array<Record<string, unknown>> | undefined) ?? [])
          .find((choice) => choice.finish_reason === "stop");
        expect(stopChoice).toBeUndefined();
      }

      {
        agentCommand.mockClear();
        agentCommand.mockRejectedValueOnce(new Error("boom"));

        const errorRes = await postChatCompletions(port, {
          stream: true,
          model: "recall",
          messages: [{ role: "user", content: "hi" }],
        });
        expect(errorRes.status).toBe(200);
        const errorText = await errorRes.text();
        const errorData = parseSseDataLines(errorText);
        expect(errorData[errorData.length - 1]).toBe("[DONE]");

        const errorChunks = errorData
          .filter((d) => d !== "[DONE]")
          .map((d) => JSON.parse(d) as Record<string, unknown>);
        const stopChoice = errorChunks
          .flatMap((c) => (c.choices as Array<Record<string, unknown>> | undefined) ?? [])
          .find((choice) => choice.finish_reason === "stop");
        expect((stopChoice?.delta as Record<string, unknown> | undefined)?.content).toBe(
          "Error: internal error",
        );
      }
    } finally {
      // shared server
    }
  });

  it("translates request body 'reasoning_effort' to opts.thinking", async () => {
    // Without this, the openai-compat /v1/chat/completions endpoint never
    // turned the reasoning hint into the agent runtime's thinking field, so
    // pi-embedded-subscribe never set thinkingEnabled=true and the upstream
    // provider was called without extended thinking. See dashboard issue #110.
    const port = enabledPort;
    let capturedOpts: Record<string, unknown> | undefined;
    agentCommand.mockClear();
    agentCommand.mockImplementationOnce((async (opts: unknown) => {
      capturedOpts = opts as Record<string, unknown>;
      return { payloads: [{ text: "ok" }] };
    }) as never);

    await postChatCompletions(port, {
      stream: false,
      model: "recall",
      messages: [{ role: "user", content: "hi" }],
      reasoning_effort: "medium",
    });

    expect(capturedOpts?.thinking).toBe("medium");
  });

  it("translates Anthropic-shape thinking object to opts.thinking via budget bucket", async () => {
    const port = enabledPort;

    // Helper to capture opts on each call.
    async function capture(body: Record<string, unknown>): Promise<string | undefined> {
      let captured: Record<string, unknown> | undefined;
      agentCommand.mockClear();
      agentCommand.mockImplementationOnce((async (opts: unknown) => {
        captured = opts as Record<string, unknown>;
        return { payloads: [{ text: "ok" }] };
      }) as never);
      await postChatCompletions(port, {
        stream: false,
        model: "recall",
        messages: [{ role: "user", content: "hi" }],
        ...body,
      });
      return captured?.thinking as string | undefined;
    }

    // Anthropic shape with no budget → default to medium.
    expect(await capture({ thinking: { type: "enabled" } })).toBe("medium");
    // Small budget → low.
    expect(await capture({ thinking: { type: "enabled", budget_tokens: 512 } })).toBe("low");
    // Mid budget → medium.
    expect(await capture({ thinking: { type: "enabled", budget_tokens: 2048 } })).toBe("medium");
    // Large budget → high.
    expect(await capture({ thinking: { type: "enabled", budget_tokens: 8192 } })).toBe("high");
    // Disabled or missing → undefined (don't force a default).
    expect(await capture({ thinking: { type: "disabled" } })).toBeUndefined();
    expect(await capture({})).toBeUndefined();
  });

  it("reasoning_effort wins over thinking when both are set", async () => {
    const port = enabledPort;
    let captured: Record<string, unknown> | undefined;
    agentCommand.mockClear();
    agentCommand.mockImplementationOnce((async (opts: unknown) => {
      captured = opts as Record<string, unknown>;
      return { payloads: [{ text: "ok" }] };
    }) as never);

    await postChatCompletions(port, {
      stream: false,
      model: "recall",
      messages: [{ role: "user", content: "hi" }],
      // OpenAI canonical hint says high; Anthropic-shape says budget=512 (would be "low").
      reasoning_effort: "high",
      thinking: { type: "enabled", budget_tokens: 512 },
    });

    expect(captured?.thinking).toBe("high");
  });

  it("forwards thinking-stream events as delta.thinking_content chunks", async () => {
    // Regression: AgentEvent {stream: "thinking"} events emitted by
    // pi-embedded-subscribe (when the upstream Anthropic provider returns
    // thinking_delta content blocks) used to be dropped by the openai-http
    // listener. The downstream signature-recall-chat dashboard already routes
    // delta.thinking_content into a <Thinking> UI block; we just need the
    // gateway to forward it. See dashboard issue #110.
    const port = enabledPort;
    agentCommand.mockClear();
    agentCommand.mockImplementationOnce((async (opts: unknown) => {
      const runId = (opts as { runId?: string } | undefined)?.runId ?? "";
      // Emit two thinking deltas, then the final answer text.
      emitAgentEvent({ runId, stream: "thinking", data: { delta: "Let me think... " } });
      emitAgentEvent({ runId, stream: "thinking", data: { delta: "17 * 23 = 391." } });
      emitAgentEvent({ runId, stream: "assistant", data: { delta: "391" } });
      return { payloads: [{ text: "391" }] };
    }) as never);

    const res = await postChatCompletions(port, {
      stream: true,
      model: "recall",
      messages: [{ role: "user", content: "What is 17 * 23?" }],
      thinking: { type: "enabled", budget_tokens: 1024 },
    });
    expect(res.status).toBe(200);

    const text = await res.text();
    const data = parseSseDataLines(text);
    expect(data[data.length - 1]).toBe("[DONE]");

    const jsonChunks = data
      .filter((d) => d !== "[DONE]")
      .map((d) => JSON.parse(d) as Record<string, unknown>);

    // Thinking content should be present on its own chunk(s).
    const allThinking = jsonChunks
      .flatMap((c) => (c.choices as Array<Record<string, unknown>> | undefined) ?? [])
      .map((choice) => (choice.delta as Record<string, unknown> | undefined)?.thinking_content)
      .filter((v): v is string => typeof v === "string")
      .join("");
    expect(allThinking).toBe("Let me think... 17 * 23 = 391.");

    // Regular content (the final answer) should still be on `delta.content`.
    const allContent = jsonChunks
      .flatMap((c) => (c.choices as Array<Record<string, unknown>> | undefined) ?? [])
      .map((choice) => (choice.delta as Record<string, unknown> | undefined)?.content)
      .filter((v): v is string => typeof v === "string")
      .join("");
    expect(allContent).toBe("391");

    // Thinking should NEVER end up in the answer-text content chunks.
    expect(allContent).not.toContain("Let me think");
    expect(allContent).not.toContain("17 * 23 = 391.");
  });
});
