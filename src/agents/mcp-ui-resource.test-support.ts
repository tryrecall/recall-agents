import "./mcp-ui-resource.js";

type McpUiResourceTestApi = {
  clearViewStore(): void;
};

export const testing = (globalThis as Record<PropertyKey, unknown>)[
  Symbol.for("steelengine.mcpUiResourceTestApi")
] as McpUiResourceTestApi;
