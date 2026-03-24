export type RecallVersion = {
  major: number;
  minor: number;
  patch: number;
  revision: number | null;
  prerelease: string[] | null;
};

const VERSION_RE = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;

export function parseRecallVersion(raw: string | null | undefined): RecallVersion | null {
  if (!raw) {
    return null;
  }
  const normalized = normalizeLegacyDotBetaVersion(raw.trim());
  const match = normalized.match(VERSION_RE);
  if (!match) {
    return null;
  }
  const [, major, minor, patch, suffix] = match;
  const revision = suffix && /^[0-9]+$/.test(suffix) ? Number.parseInt(suffix, 10) : null;
  return {
    major: Number.parseInt(major, 10),
    minor: Number.parseInt(minor, 10),
    patch: Number.parseInt(patch, 10),
    revision,
    prerelease: suffix && revision == null ? suffix.split(".").filter(Boolean) : null,
  };
}

export function normalizeRecallVersionBase(raw: string | null | undefined): string | null {
  const parsed = parseRecallVersion(raw);
  if (!parsed) {
    return null;
  }
  return `${parsed.major}.${parsed.minor}.${parsed.patch}`;
}

export function isSameRecallStableFamily(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  const parsedA = parseRecallVersion(a);
  const parsedB = parseRecallVersion(b);
  if (!parsedA || !parsedB) {
    return false;
  }
  if (parsedA.prerelease?.length || parsedB.prerelease?.length) {
    return false;
  }
  return (
    parsedA.major === parsedB.major &&
    parsedA.minor === parsedB.minor &&
    parsedA.patch === parsedB.patch
  );
}

export function compareRecallVersions(
  a: string | null | undefined,
  b: string | null | undefined,
): number | null {
  const parsedA = parseRecallVersion(a);
  const parsedB = parseRecallVersion(b);
  if (!parsedA || !parsedB) {
    return null;
  }
  if (parsedA.major !== parsedB.major) {
    return parsedA.major < parsedB.major ? -1 : 1;
  }
  if (parsedA.minor !== parsedB.minor) {
    return parsedA.minor < parsedB.minor ? -1 : 1;
  }
  if (parsedA.patch !== parsedB.patch) {
    return parsedA.patch < parsedB.patch ? -1 : 1;
  }

  const rankA = releaseRank(parsedA);
  const rankB = releaseRank(parsedB);
  if (rankA !== rankB) {
    return rankA < rankB ? -1 : 1;
  }

  if (
    parsedA.revision != null &&
    parsedB.revision != null &&
    parsedA.revision !== parsedB.revision
  ) {
    return parsedA.revision < parsedB.revision ? -1 : 1;
  }

  if (parsedA.prerelease || parsedB.prerelease) {
    return comparePrerelease(parsedA.prerelease, parsedB.prerelease);
  }

  return 0;
}

export function shouldWarnOnTouchedVersion(
  current: string | null | undefined,
  touched: string | null | undefined,
): boolean {
  if (isSameRecallStableFamily(current, touched)) {
    return false;
  }
  const cmp = compareRecallVersions(current, touched);
  return cmp !== null && cmp < 0;
}
function normalizeLegacyDotBetaVersion(version: string): string {
  const dotBetaMatch = /^([vV]?[0-9]+\.[0-9]+\.[0-9]+)\.beta(?:\.([0-9A-Za-z.-]+))?$/.exec(version);
  if (!dotBetaMatch) {
    return version;
  }
  const base = dotBetaMatch[1];
  const suffix = dotBetaMatch[2];
  return suffix ? `${base}-beta.${suffix}` : `${base}-beta`;
}

function releaseRank(version: RecallVersion): number {
  if (version.prerelease?.length) {
    return 0;
  }
  if (version.revision != null) {
    return 2;
  }
  return 1;
}

function comparePrerelease(a: string[] | null, b: string[] | null): number {
  if (!a?.length && !b?.length) {
    return 0;
  }
  if (!a?.length) {
    return 1;
  }
  if (!b?.length) {
    return -1;
  }

  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i += 1) {
    const ai = a[i];
    const bi = b[i];
    if (ai == null && bi == null) {
      return 0;
    }
    if (ai == null) {
      return -1;
    }
    if (bi == null) {
      return 1;
    }
    if (ai === bi) {
      continue;
    }

    const aiNumeric = /^[0-9]+$/.test(ai);
    const biNumeric = /^[0-9]+$/.test(bi);
    if (aiNumeric && biNumeric) {
      const aiNum = Number.parseInt(ai, 10);
      const biNum = Number.parseInt(bi, 10);
      return aiNum < biNum ? -1 : 1;
    }
    if (aiNumeric && !biNumeric) {
      return -1;
    }
    if (!aiNumeric && biNumeric) {
      return 1;
    }
    return ai < bi ? -1 : 1;
  }

  return 0;
}
