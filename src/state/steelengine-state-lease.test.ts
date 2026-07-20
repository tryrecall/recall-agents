import { afterEach, describe, expect, it } from "vitest";
import { executeSqliteQuerySync, getNodeSqliteKysely } from "../infra/kysely-sync.js";
import { withSteelEngineTestState } from "../test-utils/steelengine-test-state.js";
import { closeSteelEngineAgentDatabasesForTest } from "./steelengine-agent-db.js";
import type { DB as SteelEngineStateKyselyDatabase } from "./steelengine-state-db.generated.js";
import {
  closeSteelEngineStateDatabaseForTest,
  runSteelEngineStateWriteTransaction,
} from "./steelengine-state-db.js";
import { withSteelEngineStateLease } from "./steelengine-state-lease.js";

type LeaseDatabase = Pick<SteelEngineStateKyselyDatabase, "state_leases">;

afterEach(() => {
  closeSteelEngineAgentDatabasesForTest();
  closeSteelEngineStateDatabaseForTest();
});

describe("SteelEngine state lease", () => {
  it("rechecks exact ownership inside the caller's write transaction", async () => {
    await withSteelEngineTestState({ label: "core-state-lease" }, async () => {
      await expect(
        withSteelEngineStateLease(
          {
            scope: "core:test",
            key: "credential-write",
            database: { scope: "shared" },
            leaseMs: 1_000,
            waitMs: 0,
          },
          async (lease) => {
            runSteelEngineStateWriteTransaction(({ db }) => {
              lease.assertOwnedInTransaction(db);
              executeSqliteQuerySync(
                db,
                getNodeSqliteKysely<LeaseDatabase>(db)
                  .updateTable("state_leases")
                  .set({ owner: "successor" })
                  .where("scope", "=", "core:test")
                  .where("lease_key", "=", "credential-write"),
              );
              expect(() => lease.assertOwnedInTransaction(db)).toThrowError(
                expect.objectContaining({ code: "STEELENGINE_STATE_LEASE_LOST" }),
              );
            });
          },
        ),
      ).rejects.toMatchObject({ code: "STEELENGINE_STATE_LEASE_LOST" });
    });
  });
});
