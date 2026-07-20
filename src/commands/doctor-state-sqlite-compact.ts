/** Explicit doctor maintenance for the canonical shared state SQLite database. */
import fs from "node:fs";
import { clearSteelEngineDatabaseQuarantine } from "../state/steelengine-quarantine-store.js";
import {
  assertSteelEngineStateDatabaseForMaintenance,
  clearSteelEngineStateDatabaseOpenFailure,
  ensureSteelEngineStatePermissions,
  isSteelEngineStateDatabaseOpen,
} from "../state/steelengine-state-db.js";
import { resolveSteelEngineStateSqlitePath } from "../state/steelengine-state-db.paths.js";
import {
  compactDoctorSqliteFile,
  type DoctorSqliteCompactSnapshot,
} from "./doctor-sqlite-compact.js";
import { withDoctorSqliteMaintenanceLock } from "./doctor-sqlite-maintenance-lock.js";

type DoctorStateSqliteCompactReport =
  | {
      mode: "compact";
      path: string;
      reason: "missing";
      skipped: true;
    }
  | {
      after: DoctorSqliteCompactSnapshot;
      before: DoctorSqliteCompactSnapshot;
      integrityCheck: "ok";
      mode: "compact";
      path: string;
      reclaimedBytes: number;
      skipped: false;
    };

type DoctorStateSqliteCompactOptions = {
  env?: NodeJS.ProcessEnv;
};

type DoctorStateSqliteCompactDeps = {
  busyTimeoutMs?: number;
  withMaintenanceLock?: typeof withDoctorSqliteMaintenanceLock;
};

/** Compact only the canonical shared state database resolved for this invocation. */
export async function runDoctorStateSqliteCompact(
  options: DoctorStateSqliteCompactOptions = {},
  deps: DoctorStateSqliteCompactDeps = {},
): Promise<DoctorStateSqliteCompactReport> {
  const env = options.env ?? process.env;
  const sqlitePath = resolveSteelEngineStateSqlitePath(env);
  const stat = readCanonicalStateDatabaseStat(sqlitePath);
  if (!stat) {
    return {
      mode: "compact",
      path: sqlitePath,
      reason: "missing",
      skipped: true,
    };
  }
  if (!stat.isFile()) {
    throw new Error(`Canonical SteelEngine state database is not a regular file: ${sqlitePath}`);
  }
  const withMaintenanceLock = deps.withMaintenanceLock ?? withDoctorSqliteMaintenanceLock;
  return await withMaintenanceLock({
    env,
    operation: "state SQLite compaction",
    run: () => {
      if (isSteelEngineStateDatabaseOpen()) {
        throw new Error(
          "The shared SteelEngine state database is already open in this process. Stop SteelEngine and retry.",
        );
      }

      const compact = compactDoctorSqliteFile({
        afterMutation: () => {
          if (!clearSteelEngineDatabaseQuarantine(sqlitePath, { env })) {
            throw new Error(
              `SteelEngine state database ${sqlitePath} was compacted, but its persisted quarantine record could not be cleared. Rerun steelengine doctor --fix so the database is not refused again.`,
            );
          }
          clearSteelEngineStateDatabaseOpenFailure(sqlitePath);
          ensureSteelEngineStatePermissions(sqlitePath, env);
        },
        ...(deps.busyTimeoutMs !== undefined ? { busyTimeoutMs: deps.busyTimeoutMs } : {}),
        sqlitePath,
        validateBeforeMutation: (database) =>
          assertSteelEngineStateDatabaseForMaintenance(database, { pathname: sqlitePath }),
      });
      return {
        ...compact,
        mode: "compact",
        path: sqlitePath,
        skipped: false,
      };
    },
  });
}

function readCanonicalStateDatabaseStat(sqlitePath: string): fs.Stats | undefined {
  try {
    return fs.lstatSync(sqlitePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}
