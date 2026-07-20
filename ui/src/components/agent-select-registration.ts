import { AgentSelect } from "./agent-select.ts";

if (!customElements.get("steelengine-agent-select")) {
  customElements.define("steelengine-agent-select", AgentSelect);
}
