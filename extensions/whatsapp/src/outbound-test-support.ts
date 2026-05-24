import type { RecallConfig } from "recall/plugin-sdk/config-contracts";

export function createWhatsAppPollFixture() {
  const cfg = { marker: "resolved-cfg" } as RecallConfig;
  const poll = {
    question: "Lunch?",
    options: ["Pizza", "Sushi"],
    maxSelections: 1,
  };
  return {
    cfg,
    poll,
    to: "+1555",
    accountId: "work",
  };
}
