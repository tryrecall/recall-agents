import "./bash-process-registry.js";

type BashProcessRegistryTestApi = {
  resetProcessRegistryForTests(): void;
};

function getTestApi(): BashProcessRegistryTestApi {
  return (globalThis as Record<PropertyKey, unknown>)[
    Symbol.for("steelengine.bashProcessRegistryTestApi")
  ] as BashProcessRegistryTestApi;
}

export function resetProcessRegistryForTests(): void {
  getTestApi().resetProcessRegistryForTests();
}
