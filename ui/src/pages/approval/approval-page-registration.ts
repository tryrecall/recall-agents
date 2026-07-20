import { ApprovalPage } from "./approval-page.ts";

if (!customElements.get("steelengine-approval-page")) {
  customElements.define("steelengine-approval-page", ApprovalPage);
}
