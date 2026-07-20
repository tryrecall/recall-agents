import { afterAll, afterEach, describe, expect, it } from "vitest";
import packageJson from "../../package.json" with { type: "json" };
import { cleanupTempDirs, makeTempDir } from "../../test/helpers/temp-dir.js";
import { requireNodeSqlite } from "../infra/node-sqlite.js";
import {
  closeSteelEngineAgentDatabasesForTest,
  STEELENGINE_AGENT_SCHEMA_VERSION,
  openSteelEngineAgentDatabase,
} from "./steelengine-agent-db.js";
import { preflightSteelEngineDatabaseSchemas } from "./steelengine-database-preflight.js";
import {
  closeSteelEngineStateDatabaseForTest,
  STEELENGINE_STATE_SCHEMA_VERSION,
  openSteelEngineStateDatabase,
} from "./steelengine-state-db.js";

const tempDirs: string[] = [];

afterEach(() => {
  closeSteelEngineAgentDatabasesForTest();
  closeSteelEngineStateDatabaseForTest();
});

afterAll(() => cleanupTempDirs(tempDirs));

describe("SteelEngine database schema preflight", () => {
  it("keeps package schema support metadata aligned", () => {
    expect(packageJson.steelengine.schemaVersions).toEqual({
      state: STEELENGINE_STATE_SCHEMA_VERSION,
      agent: STEELENGINE_AGENT_SCHEMA_VERSION,
    });
  });

  it("collects newer state and registered agent schemas with writer builds", () => {
    const stateDir = makeTempDir(tempDirs, "steelengine-database-preflight-");
    const env = { STEELENGINE_STATE_DIR: stateDir };
    const statePath = openSteelEngineStateDatabase({ env }).path;
    const agentPath = openSteelEngineAgentDatabase({ agentId: "worker-1", env }).path;
    closeSteelEngineAgentDatabasesForTest();
    closeSteelEngineStateDatabaseForTest();

    const { DatabaseSync } = requireNodeSqlite();
    const state = new DatabaseSync(statePath);
    try {
      state.exec(`PRAGMA user_version = ${STEELENGINE_STATE_SCHEMA_VERSION + 1};`);
      state
        .prepare("UPDATE schema_meta SET app_version = ? WHERE meta_key = 'primary'")
        .run("state-writer-build");
    } finally {
      state.close();
    }
    const agent = new DatabaseSync(agentPath);
    try {
      agent.exec(`PRAGMA user_version = ${STEELENGINE_AGENT_SCHEMA_VERSION + 1};`);
      agent
        .prepare("UPDATE schema_meta SET app_version = ? WHERE meta_key = 'primary'")
        .run("agent-writer-build");
    } finally {
      agent.close();
    }

    expect(
      preflightSteelEngineDatabaseSchemas({
        env,
        supportedVersions: {
          state: STEELENGINE_STATE_SCHEMA_VERSION,
          agent: STEELENGINE_AGENT_SCHEMA_VERSION,
        },
      }),
    ).toEqual({
      incompatible: [
        {
          kind: "state",
          path: statePath,
          foundVersion: STEELENGINE_STATE_SCHEMA_VERSION + 1,
          supportedVersion: STEELENGINE_STATE_SCHEMA_VERSION,
          writerAppVersion: "state-writer-build",
        },
        {
          kind: "agent",
          path: agentPath,
          agentId: "worker-1",
          foundVersion: STEELENGINE_AGENT_SCHEMA_VERSION + 1,
          supportedVersion: STEELENGINE_AGENT_SCHEMA_VERSION,
          writerAppVersion: "agent-writer-build",
        },
      ],
      indeterminate: [],
    });
  });

  it("reports an existing unreadable state database as indeterminate", () => {
    const stateDir = makeTempDir(tempDirs, "steelengine-database-preflight-unreadable-state-");
    const env = { STEELENGINE_STATE_DIR: stateDir };
    const statePath = openSteelEngineStateDatabase({ env }).path;
    closeSteelEngineStateDatabaseForTest();
    fs.writeFileSync(statePath, "not a sqlite database");

    expect(
      preflightSteelEngineDatabaseSchemas({
        env,
        supportedVersions: {
          state: STEELENGINE_STATE_SCHEMA_VERSION,
          agent: STEELENGINE_AGENT_SCHEMA_VERSION,
        },
      }),
    ).toEqual({
      incompatible: [],
      indeterminate: [
        { kind: "state", path: statePath, reason: expect.stringMatching(/database|file/iu) },
      ],
    });
  });

  it("reports a failed agent registry query as indeterminate", () => {
    const stateDir = makeTempDir(tempDirs, "steelengine-database-preflight-registry-");
    const env = { STEELENGINE_STATE_DIR: stateDir };
    const statePath = openSteelEngineStateDatabase({ env }).path;
    closeSteelEngineStateDatabaseForTest();
    const { DatabaseSync } = requireNodeSqlite();
    const state = new DatabaseSync(statePath);
    try {
      state.exec("DROP TABLE agent_databases; CREATE TABLE agent_databases (bad TEXT) STRICT;");
    } finally {
      state.close();
    }

    expect(
      preflightSteelEngineDatabaseSchemas({
        env,
        supportedVersions: {
          state: STEELENGINE_STATE_SCHEMA_VERSION,
          agent: STEELENGINE_AGENT_SCHEMA_VERSION,
        },
      }),
    ).toEqual({
      incompatible: [],
      indeterminate: [
        {
          kind: "state",
          path: statePath,
          reason: expect.stringContaining("agent database registry query failed"),
        },
      ],
    });
  });

  it("reports an existing unreadable registered agent database as indeterminate", () => {
    const stateDir = makeTempDir(tempDirs, "steelengine-database-preflight-unreadable-agent-");
    const env = { STEELENGINE_STATE_DIR: stateDir };
    const agentPath = openSteelEngineAgentDatabase({ agentId: "worker-1", env }).path;
    closeSteelEngineAgentDatabasesForTest();
    closeSteelEngineStateDatabaseForTest();
    fs.writeFileSync(agentPath, "not a sqlite database");

    expect(
      preflightSteelEngineDatabaseSchemas({
        env,
        supportedVersions: {
          state: STEELENGINE_STATE_SCHEMA_VERSION,
          agent: STEELENGINE_AGENT_SCHEMA_VERSION,
        },
      }),
    ).toEqual({
      incompatible: [],
      indeterminate: [
        { kind: "agent", path: agentPath, reason: expect.stringMatching(/database|file/iu) },
      ],
    });
  });
});
import fs from "node:fs";
