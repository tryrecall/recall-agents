// Product/package naming constants that bridge current SteelEngine manifests with
// legacy Clawdbot keys still seen in older configs and packages.
const PROJECT_NAME = "steelengine" as const;

const LEGACY_PROJECT_NAMES = ["recall", "clawdbot"] as const;

export const MANIFEST_KEY = PROJECT_NAME;

/** Manifest keys accepted only for legacy compatibility. */
export const LEGACY_MANIFEST_KEYS = LEGACY_PROJECT_NAMES;
