import { describe, expect, it } from "vitest";
import type { BundledPluginSource } from "./bundled-sources.js";
import { isSteelEngineTrustedPluginInstallSpec } from "./install-provenance.js";

const bundledSources = new Map<string, BundledPluginSource>([
  [
    "discord",
    {
      pluginId: "discord",
      localPath: "/opt/steelengine/extensions/discord",
      npmSpec: "@steelengine/discord",
    },
  ],
]);

describe("plugin install provenance", () => {
  it.each([
    "discord",
    "@steelengine/discord",
    "npm:@steelengine/discord",
    "/opt/steelengine/extensions/discord",
    "brave",
    "npm:@steelengine/brave-plugin",
    "clawhub:steelengine-demo",
  ])("trusts SteelEngine-owned install source %s", (spec) => {
    expect(isSteelEngineTrustedPluginInstallSpec(spec, bundledSources)).toBe(true);
  });

  it.each(["npm:discord", "npm:@example/plugin", "/tmp/example-plugin"])(
    "keeps arbitrary install source %s untrusted",
    (spec) => {
      expect(isSteelEngineTrustedPluginInstallSpec(spec, bundledSources)).toBe(false);
    },
  );
});
