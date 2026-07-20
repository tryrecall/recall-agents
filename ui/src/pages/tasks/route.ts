import { definePage } from "@openclaw/uirouter";
import { html } from "lit";

export const page = definePage({
  id: "tasks",
  path: "/tasks",
  component: () =>
    import("./tasks-page.ts").then(() => ({
      header: true,
      render: () => html`<steelengine-tasks-page></steelengine-tasks-page>`,
    })),
});
