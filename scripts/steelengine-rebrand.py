#!/usr/bin/env python3
"""Apply the deterministic SteelEngine product rebrand to an upstream checkout."""

from __future__ import annotations

import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Legal, historical, and migration tooling must retain upstream attribution or
# literal source names. None of these files is a runtime or product surface.
CONTENT_EXCLUSIONS = {
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

MIGRATION_COMPATIBILITY_IDENTIFIERS = (".openclaw", "openclaw.json")

REPLACEMENTS = (
    ("https://github.com/openclaw/openclaw", "https://github.com/steelengineai/recall-agents"),
    ("git+https://github.com/openclaw/openclaw.git", "git+https://github.com/steelengineai/recall-agents.git"),
    ("git@github.com:openclaw/openclaw.git", "git@github.com:steelengineai/recall-agents.git"),
    ("docs.openclaw.ai", "docs.steelengine.ai"),
    ("openclaw.ai", "steelengine.ai"),
    ("@openclaw", "@steelengine"),
    ("OPENCLAW", "STEELENGINE"),
    ("OpenClaw", "SteelEngine"),
    ("openClaw", "steelEngine"),
    ("openclaw", "steelengine"),
)

# Registry identifiers owned upstream are compatibility contracts, not product branding.
# Keep them exact unless SteelEngine publishes and audits replacement packages.
UPSTREAM_TECHNICAL_IDENTIFIERS = (
    ("@steelengine/fs-safe", "@openclaw/fs-safe"),
    ("@steelengine/proxyline", "@openclaw/proxyline"),
    ("@steelengine/libterminal", "@openclaw/libterminal"),
    ("@steelengine/uirouter", "@openclaw/uirouter"),
    ("@steelengine/crabline", "@openclaw/crabline"),
)


def git_paths() -> list[str]:
    raw = subprocess.check_output(["git", "ls-files", "-z"], cwd=ROOT)
    return [part.decode() for part in raw.split(b"\0") if part]


def replace_text(value: str, *, preserve_external_namespace: bool = False) -> str:
    protected = {
        identifier: f"__STEELENGINE_MIGRATION_COMPAT_{index}__"
        for index, identifier in enumerate(MIGRATION_COMPATIBILITY_IDENTIFIERS)
    }
    for identifier, placeholder in protected.items():
        value = value.replace(identifier, placeholder)
    for old, new in REPLACEMENTS:
        value = value.replace(old, new)
    for renamed, upstream in UPSTREAM_TECHNICAL_IDENTIFIERS:
        value = value.replace(renamed, upstream)
    if preserve_external_namespace:
        value = value.replace("@steelengine/", "@openclaw/")
    for identifier, placeholder in protected.items():
        value = value.replace(placeholder, identifier)
    return value


def rename_paths(paths: list[str]) -> list[str]:
    renamed: list[str] = []
    for source in sorted(paths, key=lambda item: (item.count("/"), len(item)), reverse=True):
        target = replace_text(source)
        if target == source:
            continue
        source_path = ROOT / source
        if not source_path.exists() and not source_path.is_symlink():
            continue
        target_path = ROOT / target
        target_path.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(["git", "mv", source, target], cwd=ROOT, check=True)
        renamed.append(target)
    return renamed


def rewrite_files(paths: list[str]) -> int:
    changed = 0
    for relative in paths:
        mapped = replace_text(relative)
        if mapped in CONTENT_EXCLUSIONS:
            continue
        path = ROOT / mapped
        if not path.is_file() or path.is_symlink():
            continue
        try:
            before = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        after = replace_text(
            before,
            preserve_external_namespace=mapped in EXTERNAL_PLUGIN_CATALOGS,
        )
        if after == before:
            continue
        path.write_text(after, encoding="utf-8")
        changed += 1
    return changed


def main() -> None:
    paths = git_paths()
    renamed = rename_paths(paths)
    changed = rewrite_files(paths)
    print(f"SteelEngine rebrand applied: {len(renamed)} paths renamed, {changed} files rewritten")


if __name__ == "__main__":
    main()
