import { resolveAgentWorkspaceDir, resolveDefaultAgentId } from "../agents/agent-scope.js";
import { formatCliCommand } from "../cli/command-format.js";
import type { RecallConfig } from "../config/types.recall.js";
import { buildWorkspaceHookStatus } from "../hooks/hooks-status.js";
import type { RuntimeEnv } from "../runtime.js";
import { t } from "../wizard/i18n/index.js";
import type { WizardPrompter } from "../wizard/prompts.js";

export async function setupInternalHooks(
  cfg: RecallConfig,
  _runtime: RuntimeEnv,
  prompter: WizardPrompter,
): Promise<RecallConfig> {
  await prompter.note(
    [
      "Hooks let you automate actions when agent commands are issued.",
      "Example: Save session context to memory when you issue /new or /reset.",
      "",
      "Learn more: https://docs.recall.ai/automation/hooks",
    ].join("\n"),
    t("wizard.hooks.introTitle"),
  );

  // Discover available hooks using the hook discovery system
  const workspaceDir = resolveAgentWorkspaceDir(cfg, resolveDefaultAgentId(cfg));
  const report = buildWorkspaceHookStatus(workspaceDir, { config: cfg });

  // Show every eligible hook so users can opt in during setup.
  const eligibleHooks = report.hooks.filter((h) => h.loadable);

  if (eligibleHooks.length === 0) {
    await prompter.note(t("wizard.hooks.noHooksMessage"), t("wizard.hooks.noHooksTitle"));
    return cfg;
  }

  const toEnable = await prompter.multiselect({
    message: t("wizard.hooks.enable"),
    options: [
      { value: "__skip__", label: t("common.skipForNow") },
      ...eligibleHooks.map((hook) => ({
        value: hook.name,
        label: `${hook.emoji ?? "🔗"} ${hook.name}`,
        hint: hook.description,
      })),
    ],
  });

  const selected = toEnable.filter((name) => name !== "__skip__");
  if (selected.length === 0) {
    return cfg;
  }

  // Enable selected hooks using the new entries config format
  const entries = { ...cfg.hooks?.internal?.entries };
  for (const name of selected) {
    entries[name] = { enabled: true };
  }

  const next: RecallConfig = {
    ...cfg,
    hooks: {
      ...cfg.hooks,
      internal: {
        enabled: true,
        entries,
      },
    },
  };

  await prompter.note(
    [
      `Enabled ${selected.length} hook${selected.length > 1 ? "s" : ""}: ${selected.join(", ")}`,
      "",
      "You can manage hooks later with:",
      `  ${formatCliCommand("recall hooks list")}`,
      `  ${formatCliCommand("recall hooks enable <name>")}`,
      `  ${formatCliCommand("recall hooks disable <name>")}`,
    ].join("\n"),
    t("wizard.hooks.configuredTitle"),
  );

  return next;
}
