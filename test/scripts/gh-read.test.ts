import { describe, expect, it } from "vitest";
import {
  buildReadPermissions,
  normalizeRepo,
  parsePermissionKeys,
  parseRepoArg,
} from "../../scripts/gh-read.js";

describe("gh-read helpers", () => {
  it("finds repo from gh args", () => {
    expect(parseRepoArg(["pr", "view", "42", "-R", "tryrecall/recall-agents"])).toBe("tryrecall/recall-agents");
    expect(parseRepoArg(["run", "list", "--repo=recall/docs"])).toBe("recall/docs");
    expect(parseRepoArg(["pr", "view", "42"])).toBeNull();
  });

  it("normalizes repo strings from common git formats", () => {
    expect(normalizeRepo("tryrecall/recall-agents")).toBe("tryrecall/recall-agents");
    expect(normalizeRepo("github.com/tryrecall/recall-agents")).toBe("tryrecall/recall-agents");
    expect(normalizeRepo("https://github.com/tryrecall/recall-agents.git")).toBe("tryrecall/recall-agents");
    expect(normalizeRepo("git@github.com:tryrecall/recall-agents.git")).toBe("tryrecall/recall-agents");
    expect(normalizeRepo("invalid")).toBeNull();
  });

  it("builds a read-only permission subset from granted permissions", () => {
    expect(
      buildReadPermissions(
        {
          actions: "write",
          issues: "read",
          administration: "write",
          metadata: "read",
          statuses: null,
        },
        ["actions", "issues", "metadata", "statuses", "administration"],
      ),
    ).toEqual({
      administration: "read",
      actions: "read",
      issues: "read",
      metadata: "read",
    });
  });

  it("parses permission key overrides", () => {
    expect(parsePermissionKeys(undefined)).toContain("pull_requests");
    expect(parsePermissionKeys("actions, contents ,issues")).toEqual([
      "actions",
      "contents",
      "issues",
    ]);
  });
});
