// Normalizes config version metadata and compatibility comparisons.
import { parse as parseSemver, type SemVer } from "semver";
import {
  compareSteelEngineSemver,
  isSteelEngineCorrectionSemver,
  normalizeLegacyDotBetaVersion,
} from "../infra/semver.js";

/** Parses stable, prerelease, and legacy dot-beta SteelEngine versions. */
function parseSteelEngineVersion(raw: string | null | undefined): SemVer | null {
  if (!raw) {
    return null;
  }
  const normalized = normalizeLegacyDotBetaVersion(raw.trim());
  return parseSemver(normalized);
}

export function normalizeSteelEngineVersionBase(raw: string | null | undefined): string | null {
  const parsed = parseSteelEngineVersion(raw);
  if (!parsed) {
    return null;
  }
  return `${parsed.major}.${parsed.minor}.${parsed.patch}`;
}

export function compareSteelEngineVersions(
  a: string | null | undefined,
  b: string | null | undefined,
): number | null {
  const parsedA = parseSteelEngineVersion(a);
  const parsedB = parseSteelEngineVersion(b);
  if (!parsedA || !parsedB) {
    return null;
  }
  return compareSteelEngineSemver(parsedA, parsedB);
}

export function shouldWarnOnTouchedVersion(
  current: string | null | undefined,
  touched: string | null | undefined,
): boolean {
  const parsedCurrent = parseSteelEngineVersion(current);
  const parsedTouched = parseSteelEngineVersion(touched);
  if (parsedCurrent && parsedTouched && parsedCurrent.compareMain(parsedTouched) === 0) {
    if (parsedTouched.prerelease.length === 0 || isSteelEngineCorrectionSemver(parsedTouched)) {
      return false;
    }
  }
  return parsedCurrent !== null && parsedTouched !== null
    ? compareSteelEngineSemver(parsedCurrent, parsedTouched) < 0
    : false;
}
