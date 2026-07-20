type SteelEngineCodingToolsFactory =
  (typeof import("steelengine/plugin-sdk/agent-harness"))["createSteelEngineCodingTools"];

/** Mutable dependency seam shared by dynamic-tool construction and its behavioral tests. */
export const dynamicToolBuildState: {
  steelEngineCodingToolsFactory?: SteelEngineCodingToolsFactory;
} = {};
