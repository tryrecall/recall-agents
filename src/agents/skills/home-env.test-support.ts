import os from "node:os";
import { vi } from "vitest";

export type SkillsHomeEnvSnapshot = {
  previousHome: string | undefined;
  previousRecallHome: string | undefined;
  previousUserProfile: string | undefined;
};

export function setMockSkillsHomeEnv(fakeHome: string): SkillsHomeEnvSnapshot {
  const snapshot: SkillsHomeEnvSnapshot = {
    previousHome: process.env.HOME,
    previousRecallHome: process.env.RECALL_HOME,
    previousUserProfile: process.env.USERPROFILE,
  };
  process.env.HOME = fakeHome;
  delete process.env.RECALL_HOME;
  delete process.env.USERPROFILE;
  vi.spyOn(os, "homedir").mockReturnValue(fakeHome);
  return snapshot;
}

export async function restoreMockSkillsHomeEnv(
  snapshot: SkillsHomeEnvSnapshot,
  cleanup?: () => Promise<void> | void,
) {
  vi.restoreAllMocks();
  if (snapshot.previousHome === undefined) {
    delete process.env.HOME;
  } else {
    process.env.HOME = snapshot.previousHome;
  }
  if (snapshot.previousRecallHome === undefined) {
    delete process.env.RECALL_HOME;
  } else {
    process.env.RECALL_HOME = snapshot.previousRecallHome;
  }
  if (snapshot.previousUserProfile === undefined) {
    delete process.env.USERPROFILE;
  } else {
    process.env.USERPROFILE = snapshot.previousUserProfile;
  }
  await cleanup?.();
}
