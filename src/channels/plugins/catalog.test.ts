import { describe, expect, it } from "vitest";
import { getChannelPluginCatalogEntry } from "./catalog.js";

describe("channel plugin catalog", () => {
  it("keeps third-party channel ids mapped with catalog install trust", () => {
    const options = {
      workspaceDir: "/tmp/recall-channel-catalog-empty-workspace",
      env: {},
    };

    const wecom = getChannelPluginCatalogEntry("wecom", options);
    expect(wecom?.id).toBe("wecom");
    expect(wecom?.pluginId).toBe("wecom-recall-plugin");
    expect(wecom?.trustedSourceLinkedOfficialInstall).toBe(true);
    expect(wecom?.install?.npmSpec).toBe("@wecom/wecom-recall-plugin@2026.5.7");

    const yuanbao = getChannelPluginCatalogEntry("yuanbao", options);
    expect(yuanbao?.id).toBe("yuanbao");
    expect(yuanbao?.pluginId).toBe("recall-plugin-yuanbao");
    expect(yuanbao?.trustedSourceLinkedOfficialInstall).toBe(true);
    expect(yuanbao?.install?.npmSpec).toBe("recall-plugin-yuanbao@2.13.1");
  });
});
