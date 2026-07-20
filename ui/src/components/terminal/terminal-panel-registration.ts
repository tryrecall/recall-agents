import { SteelEngineTerminalPanel } from "./terminal-panel.ts";

// Guarded define so shared registries can retain this module across reloads.
if (!customElements.get("steelengine-terminal-panel")) {
  customElements.define("steelengine-terminal-panel", SteelEngineTerminalPanel);
}
