import { SteelEngineFilePreviewModal } from "./file-preview-modal.ts";

if (!customElements.get("steelengine-file-preview-modal")) {
  customElements.define("steelengine-file-preview-modal", SteelEngineFilePreviewModal);
}
