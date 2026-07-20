import { definePage } from "@openclaw/uirouter";
import { html } from "lit";

export const page = definePage({
  id: "cron",
  path: "/cron",
  component: () =>
    import("./cron-page.ts").then(() => ({
      header: true,
      render: () => html`<steelengine-cron-page></steelengine-cron-page>`,
    })),
});
