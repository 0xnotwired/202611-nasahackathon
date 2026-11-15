#!/usr/bin/env python3
"""Checks the consistency of the documentation and the module board.

It verifies this, and nothing more:
  1. Each research matrix parses as CSV with complete rows, and its ids match
     the ones cited in its document.
  2. docs/modules.csv: unique ids, valid status, every module has its work
     order and every work order belongs to a module.
  3. The owned paths of two modules do not overlap.
  4. Every dependency exists and sits in an earlier phase, or in the same phase
     and an earlier wave.
  5. The module table in ORCHESTRATION_PLAN.md names the same ids.
  6. Relative links in .md files point to files that exist.

It does not check that cited figures are correct, that sources say what is
claimed, or that an agent respected their owned paths when writing code.
Usage: python3 scripts/check_docs.py   (exit code 1 if anything fails)
"""
import csv
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"

# (matrix, document, id pattern)
PAIRS = [
    ("APPLIED_RESEARCH_MATRIX.csv", "APPLIED_RESEARCH.md", r"\bA0\d\b"),
    ("RESEARCH_MATRIX_B.csv", "EXTENDED_RESEARCH_B.md", r"\bB\d\d\b"),
]
STATUSES = {"pending", "in_progress", "in_review", "integrated", "blocked"}


def check_matrix(csv_name, md_name, pattern):
    failures = []
    csv_path, md_path = DOCS / csv_name, DOCS / md_name
    for path in (csv_path, md_path):
        if not path.is_file():
            return [f"missing file {path.relative_to(ROOT)}"]
    with csv_path.open(encoding="utf-8", newline="") as f:
        rows = list(csv.reader(f))
    if not rows:
        return [f"{csv_name}: empty"]
    width = len(rows[0])
    for n, row in enumerate(rows[1:], start=2):
        if len(row) != width:
            failures.append(f"{csv_name}: row {n} has {len(row)} columns, expected {width}")
    csv_ids = {row[0] for row in rows[1:] if row}
    md_ids = set(re.findall(pattern, md_path.read_text(encoding="utf-8")))
    for missing in sorted(md_ids - csv_ids):
        failures.append(f"{missing} is cited in {md_name} but is not in {csv_name}")
    for missing in sorted(csv_ids - md_ids):
        failures.append(f"{missing} is in {csv_name} but is not cited in {md_name}")
    return failures


def overlap(a, b):
    """Two paths overlap if they are equal or one is a folder containing the other."""
    if a == b:
        return True
    return (a.endswith("/") and b.startswith(a)) or (b.endswith("/") and a.startswith(b))


def check_modules():
    failures = []
    path = DOCS / "modules.csv"
    if not path.is_file():
        return ["missing docs/modules.csv"], 0
    with path.open(encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))
    by_id = {}
    for row in rows:
        mid = row["id"]
        if mid in by_id:
            failures.append(f"modules.csv: repeated id {mid}")
        by_id[mid] = row
        if row["status"] not in STATUSES:
            failures.append(f"modules.csv: {mid} has unknown status '{row['status']}'")
        if not (DOCS / row["work_order"]).is_file():
            failures.append(f"modules.csv: {mid} points to a work order that does not exist: {row['work_order']}")
        if not row["paths"].strip():
            failures.append(f"modules.csv: {mid} declares no owned paths")

    orders_csv = {row["work_order"] for row in rows}
    folder = DOCS / "work-orders"
    if folder.is_dir():
        for order in sorted(folder.glob("*.md")):
            relative = f"work-orders/{order.name}"
            if relative not in orders_csv:
                failures.append(f"{relative} does not belong to any module in modules.csv")

    ids = list(by_id)
    for i, a in enumerate(ids):
        for b in ids[i + 1:]:
            for pa in by_id[a]["paths"].split(";"):
                for pb in by_id[b]["paths"].split(";"):
                    if overlap(pa.strip(), pb.strip()):
                        failures.append(f"overlapping paths: {a} ({pa}) and {b} ({pb})")

    for mid, row in by_id.items():
        for dep in filter(None, row["depends_on"].split(";")):
            if dep not in by_id:
                failures.append(f"{mid} depends on {dep}, which does not exist")
                continue
            own = (int(row["phase"]), int(row["wave"]))
            other = (int(by_id[dep]["phase"]), int(by_id[dep]["wave"]))
            if not other < own:
                failures.append(
                    f"{mid} (phase {own[0]}, wave {own[1]}) depends on {dep} "
                    f"(phase {other[0]}, wave {other[1]}), which is not built earlier"
                )

    plan = DOCS / "ORCHESTRATION_PLAN.md"
    if plan.is_file():
        in_plan = set(re.findall(r"^\| (M\d\d) \|", plan.read_text(encoding="utf-8"), flags=re.M))
        for missing in sorted(set(by_id) - in_plan):
            failures.append(f"{missing} is in modules.csv but not in the ORCHESTRATION_PLAN.md table")
        for missing in sorted(in_plan - set(by_id)):
            failures.append(f"{missing} is in ORCHESTRATION_PLAN.md but not in modules.csv")
    else:
        failures.append("missing docs/ORCHESTRATION_PLAN.md")
    return failures, len(by_id)


def check_links():
    failures = []
    files = sorted(DOCS.rglob("*.md")) + sorted(ROOT.glob("*.md"))
    for md in files:
        text = md.read_text(encoding="utf-8")
        for target in re.findall(r"\]\(([^)#\s]+)(?:#[^)]*)?\)", text):
            if re.match(r"[a-z]+:", target):  # http:, https:, mailto:
                continue
            if not (md.parent / target).exists():
                failures.append(f"{md.relative_to(ROOT)}: broken link to {target}")
    return failures


def main():
    failures = []
    for pair in PAIRS:
        failures += check_matrix(*pair)
    module_failures, count = check_modules()
    failures += module_failures
    failures += check_links()
    if failures:
        print("FAIL")
        for f in failures:
            print("  -", f)
        return 1
    print(
        f"OK: {len(PAIRS)} consistent matrices; {count} modules with work orders, "
        "non-overlapping paths and ordered dependencies; relative links resolved."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
