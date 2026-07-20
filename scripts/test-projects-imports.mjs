// Runs test-projects with Vitest import duration diagnostics enabled.
process.env.STEELENGINE_VITEST_IMPORT_DURATIONS = "1";
process.env.STEELENGINE_VITEST_PRINT_IMPORT_BREAKDOWN = "1";

await import("./test-projects.mjs");
