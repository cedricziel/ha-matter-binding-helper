#!/usr/bin/env python3
"""Sync hacs.json's minimum Home Assistant version from requirements.txt.

requirements.txt is the single source of truth: its ``homeassistant>=X`` floor is
the oldest Home Assistant we support, and HACS gates installs on hacs.json's
``homeassistant`` key. This keeps the two from drifting (e.g. when Dependabot
raises the floor for a security advisory).

Usage:
  sync_hacs_min_ha.py           # write hacs.json to match requirements.txt
  sync_hacs_min_ha.py --check   # exit 1 if they differ (for CI)
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REQUIREMENTS = ROOT / "requirements.txt"
HACS_JSON = ROOT / "hacs.json"

# homeassistant >= 2024.1.0  /  homeassistant==2024.1.0  (first version wins)
_FLOOR_RE = re.compile(
    r"^homeassistant\s*[<>=!~]=?\s*([0-9][0-9A-Za-z.\-]*)", re.IGNORECASE
)


def required_floor() -> str:
    """Return the Home Assistant version floor declared in requirements.txt."""
    for raw in REQUIREMENTS.read_text().splitlines():
        line = raw.split("#", 1)[0].strip()
        match = _FLOOR_RE.match(line)
        if match:
            return match.group(1)
    sys.exit(f"error: no `homeassistant` requirement found in {REQUIREMENTS}")


def main() -> int:
    check = "--check" in sys.argv[1:]
    floor = required_floor()

    data = json.loads(HACS_JSON.read_text())
    current = data.get("homeassistant")

    if current == floor:
        print(f"hacs.json homeassistant is in sync ({floor})")
        return 0

    if check:
        print(
            f"::error file=hacs.json::homeassistant is {current!r} but the "
            f"requirements.txt floor is {floor!r}. Run scripts/sync_hacs_min_ha.py."
        )
        return 1

    data["homeassistant"] = floor
    HACS_JSON.write_text(json.dumps(data, indent=2) + "\n")
    print(f"updated hacs.json homeassistant: {current!r} -> {floor!r}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
