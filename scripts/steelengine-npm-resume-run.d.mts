export interface SteelEngineNpmResumeRunRecord {
  conclusion?: unknown;
  event?: unknown;
  head_branch?: unknown;
  head_sha?: unknown;
  html_url?: unknown;
  path?: unknown;
  workflow_id?: unknown;
}

export interface SteelEngineNpmResumeTagRecord {
  object?: {
    sha?: unknown;
    type?: unknown;
  };
  verification?: {
    verified?: unknown;
  };
}

export interface SteelEngineNpmResumeJobRecord {
  conclusion?: unknown;
  name?: unknown;
}

export interface SteelEngineNpmResumeValidationInput {
  canonicalWorkflowId: unknown;
  compareStatus: unknown;
  jobs: SteelEngineNpmResumeJobRecord[];
  run: SteelEngineNpmResumeRunRecord;
  tag: SteelEngineNpmResumeTagRecord;
  tagRef: SteelEngineNpmResumeTagRecord;
}

export interface SteelEngineNpmResumeIdentity {
  tagObjectSha: string;
  url: string;
  workflowRef: string;
  workflowSha: string;
}

export function validateSteelEngineNpmResumeRun(
  input: SteelEngineNpmResumeValidationInput,
): SteelEngineNpmResumeIdentity;

export function runSteelEngineNpmResumeGh(
  args: string[],
  params?: {
    execFileSyncImpl?: (
      command: string,
      args: string[],
      options: {
        encoding: "utf8";
        killSignal: "SIGKILL";
        maxBuffer: number;
        timeout: number;
      },
    ) => string;
  },
): string;

export function resolveSteelEngineNpmResumeRun(options: {
  repo: string;
  runId: string;
  runGh?: (args: string[]) => string;
}): SteelEngineNpmResumeIdentity;
