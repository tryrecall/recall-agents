// SteelEngine root resolution imports fs through this facade so tests can replace
// filesystem behavior without mocking node:fs globally.
export { default as steelEngineRootFsSync } from "node:fs";
export { default as steelEngineRootFs } from "node:fs/promises";
