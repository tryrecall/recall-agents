#!/usr/bin/env python3
"""Fail when upstream product branding leaks into SteelEngine product surfaces."""

from __future__ import annotations

import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ALLOWED = {
    "LICENSE",
    "THIRD_PARTY_NOTICES.md",
    "CHANGELOG.md",
    ".github/CODEOWNERS",
    "scripts/steelengine-rebrand.py",
    "scripts/check-steelengine-branding.py",
}
EXTERNAL_PLUGIN_CATALOGS = {
    "scripts/lib/official-external-channel-catalog.json",
    "scripts/lib/official-external-provider-catalog.json",
    "scripts/lib/official-external-plugin-catalog.json",
    "src/plugins/official-external-plugin-catalog.test.ts",
    "src/plugins/official-external-plugin-repair-hints.test.ts",
}
FORBIDDEN = ("openclaw", "OpenClaw", "OPENCLAW")
ALLOWED_TECHNICAL_IDENTIFIERS = (
    "@openclaw/fs-safe",
    "@openclaw/proxyline",
    "@openclaw/libterminal",
    "@openclaw/uirouter",
    "@openclaw/crabline",
    # Explicit legacy state/config identifiers used for migration compatibility.
    ".openclaw",
    "openclaw.json",
)


def tracked_paths() -> list[str]:
    raw = subprocess.check_output(["git", "ls-files", "-z"], cwd=ROOT)
    return [part.decode() for part in raw.split(b"\0") if part]


def main() -> None:
    violations: list[str] = []
    for relative in tracked_paths():
        if relative in ALLOWED:
            continue
        if any(token in relative for token in FORBIDDEN):
            violations.append(f"path: {relative}")
        path = ROOT / relative
        if not path.is_file() or path.is_symlink():
            continue
        try:
            lines = path.read_text(encoding="utf-8").splitlines()
        except (UnicodeDecodeError, OSError):
            continue
        for number, line in enumerate(lines, 1):
            product_line = line
            for identifier in ALLOWED_TECHNICAL_IDENTIFIERS:
                product_line = product_line.replace(identifier, "")
            if relative in EXTERNAL_PLUGIN_CATALOGS:
                product_line = product_line.replace("@openclaw/", "")
            if any(token in product_line for token in FORBIDDEN):
                violations.append(f"content: {relative}:{number}")
                if len(violations) >= 200:
                    break
        if len(violations) >= 200:
            break
    if violations:
        print("SteelEngine branding check failed:")
        print("\n".join(violations))
        raise SystemExit(1)
    print("SteelEngine branding check passed")


if __name__ == "__main__":
    main()
