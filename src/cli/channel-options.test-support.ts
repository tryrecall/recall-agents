import "./channel-options.js";

type CliChannelOptionsTestApi = {
  resetPrecomputedChannelOptionsForTests(): void;
};

function getTestApi(): CliChannelOptionsTestApi {
  return (globalThis as Record<PropertyKey, unknown>)[
    Symbol.for("steelengine.cliChannelOptionsTestApi")
  ] as CliChannelOptionsTestApi;
}

export const testing = {
  resetPrecomputedChannelOptionsForTests(): void {
    getTestApi().resetPrecomputedChannelOptionsForTests();
  },
};
