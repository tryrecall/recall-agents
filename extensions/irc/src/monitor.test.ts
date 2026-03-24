import { describe, expect, it } from "vitest";
import { resolveIrcInboundTarget } from "./monitor.js";

describe("irc monitor inbound target", () => {
  it("keeps channel target for group messages", () => {
    expect(
      resolveIrcInboundTarget({
        target: "#recall",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: true,
      target: "#recall",
      rawTarget: "#recall",
    });
  });

  it("maps DM target to sender nick and preserves raw target", () => {
    expect(
      resolveIrcInboundTarget({
        target: "recall-bot",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: false,
      target: "alice",
      rawTarget: "recall-bot",
    });
  });

  it("falls back to raw target when sender nick is empty", () => {
    expect(
      resolveIrcInboundTarget({
        target: "recall-bot",
        senderNick: " ",
      }),
    ).toEqual({
      isGroup: false,
      target: "recall-bot",
      rawTarget: "recall-bot",
    });
  });
});
