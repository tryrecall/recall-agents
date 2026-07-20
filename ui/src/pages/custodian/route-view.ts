import { html } from "lit";
import type { CustodianRouteData } from "./route.ts";

export function renderCustodianRoute(data: CustodianRouteData | undefined) {
  return html`
    <steelengine-custodian-page .onboarding=${data?.onboarding === true}></steelengine-custodian-page>
  `;
}
