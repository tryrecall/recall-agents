// Text format tests cover command-facing shortening helpers.
import { describe, expect, it } from "vitest";
import { shortenText } from "./text-format.js";

describe("shortenText", () => {
  it("returns original text when it fits", () => {
    expect(shortenText("steelengine", 16)).toBe("steelengine");
  });

  it("truncates and appends ellipsis when over limit", () => {
    expect(shortenText("steelengine-status-output", 10)).toBe("steelengine-…");
  });

  it("returns an empty string for non-positive limits", () => {
    expect(shortenText("steelengine", 0)).toBe("");
    expect(shortenText("steelengine", -1)).toBe("");
  });

  it("counts multi-byte characters correctly", () => {
    expect(shortenText("hello🙂world", 7)).toBe("hello🙂…");
  });
});
