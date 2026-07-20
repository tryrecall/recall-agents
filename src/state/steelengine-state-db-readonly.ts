import path from "node:path";
import type { DatabaseSync } from "node:sqlite";
import { clearNodeSqliteKyselyCacheForDatabase } from "../infra/kysely-sync.js";
import { requireNodeSqlite } from "../infra/node-sqlite.js";
import {
  createNewerSqliteSchemaVersionError,
  readSqliteUserVersion,
} from "../infra/sqlite-user-version.js";
import {
  STEELENGINE_SQLITE_BUSY_TIMEOUT_MS,
  STEELENGINE_STATE_SCHEMA_VERSION,
  type SteelEngineStateDatabaseOptions,
} from "./steelengine-state-db.js";
import { resolveSteelEngineStateSqlitePath } from "./steelengine-state-db.paths.js";

type SteelEngineStateReadOnlyDatabase = {
  db: DatabaseSync;
  path: string;
};

function assertSupportedSchemaVersion(db: DatabaseSync, pathname: string): void {
  const userVersion = readSqliteUserVersion(db);
  if (userVersion > STEELENGINE_STATE_SCHEMA_VERSION) {
    throw createNewerSqliteSchemaVersionError(
      "SteelEngine state database",
      pathname,
      userVersion,
      STEELENGINE_STATE_SCHEMA_VERSION,
    );
  }
}

/**
 * Read shared state without joining the writable lifecycle.
 *
 * CLI metadata reads can overlap a live Gateway. Keep them off schema repair,
 * journal-mode setup, checkpoints, and permission mutation owned by writers.
 */
export function withSteelEngineStateDatabaseReadOnly<T>(
  operation: (database: SteelEngineStateReadOnlyDatabase) => T,
  options: SteelEngineStateDatabaseOptions = {},
): T {
  const pathname = path.resolve(
    options.path ?? resolveSteelEngineStateSqlitePath(options.env ?? process.env),
  );
  const sqlite = requireNodeSqlite();
  const db = new sqlite.DatabaseSync(pathname, { readOnly: true });
  try {
    db.exec(`PRAGMA busy_timeout = ${STEELENGINE_SQLITE_BUSY_TIMEOUT_MS};`);
    assertSupportedSchemaVersion(db, pathname);
    return operation({ db, path: pathname });
  } finally {
    clearNodeSqliteKyselyCacheForDatabase(db);
    db.close();
  }
}
