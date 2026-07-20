import { GitHubLinkHovercardProvider } from "./github-link-hovercard.ts";

if (!customElements.get("steelengine-github-link-hovercard-provider")) {
  customElements.define("steelengine-github-link-hovercard-provider", GitHubLinkHovercardProvider);
}
