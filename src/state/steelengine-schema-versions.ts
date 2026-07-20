export type SteelEngineSchemaVersions = {
  state: number;
  agent: number;
};

export function parseSteelEngineSchemaVersions(value: unknown): SteelEngineSchemaVersions | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  const record = value as Record<string, unknown>;
  if (
    !Number.isInteger(record.state) ||
    (record.state as number) < 0 ||
    !Number.isInteger(record.agent) ||
    (record.agent as number) < 0
  ) {
    return undefined;
  }
  return { state: record.state as number, agent: record.agent as number };
}

export function parsePackageSteelEngineSchemaVersions(
  packageJson: unknown,
): SteelEngineSchemaVersions | undefined {
  if (!packageJson || typeof packageJson !== "object" || Array.isArray(packageJson)) {
    return undefined;
  }
  const steelengine = (packageJson as Record<string, unknown>).steelengine;
  if (!steelengine || typeof steelengine !== "object" || Array.isArray(steelengine)) {
    return undefined;
  }
  return parseSteelEngineSchemaVersions((steelengine as Record<string, unknown>).schemaVersions);
}
