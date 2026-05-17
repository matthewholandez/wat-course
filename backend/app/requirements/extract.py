"""Batch driver: parse every course's requirement HTML and upsert into ``course_requirements``.

Usage:
    uv run python -m app.requirements.extract              # incremental
    uv run python -m app.requirements.extract --pid <pid>  # one course
    uv run python -m app.requirements.extract --force      # re-parse all
    uv run python -m app.requirements.extract --no-llm     # deterministic only
"""

from __future__ import annotations

import argparse
import csv
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from sqlmodel import Session, SQLModel, select

from ..db import engine
from ..types import Course, CourseRequirements  # noqa: F401 (register table)
from .parser import parse_tree
from .schema import RequirementNode

UNRESOLVED_CSV = Path(__file__).resolve().parent.parent.parent / "unresolved_leaves.csv"
load_dotenv(".env.local")


def _hash_sources(detail: dict[str, Any]) -> str:
    h = hashlib.sha256()
    for key in ("prerequisites", "corequisites", "antirequisites"):
        h.update((detail.get(key) or "").encode("utf-8"))
        h.update(b"\x00")
    return h.hexdigest()


def _walk(node: RequirementNode, path: str = ""):
    yield path, node
    if "children" in node:
        for i, c in enumerate(node["children"]):
            yield from _walk(c, f"{path}/{i}")


def _mark_unresolved(
    tree: RequirementNode | None,
    valid_codes: set[str],
    pid: str,
    unresolved_rows: list[dict[str, str]],
) -> RequirementNode | None:
    if tree is None:
        return None
    for path, node in _walk(tree):
        if node.get("type") == "course" or node.get("type") == "course_min_grade":
            code = node.get("code", "")
            if code and code not in valid_codes:
                node["unresolved"] = True
                unresolved_rows.append(
                    {"pid": pid, "code": code, "raw_phrase": node.get("type", ""), "tree_path": path}
                )
        elif node.get("type") == "antireq_courses":
            kept: list[str] = []
            for code in node.get("codes", []):
                if code in valid_codes:
                    kept.append(code)
                else:
                    unresolved_rows.append(
                        {"pid": pid, "code": code, "raw_phrase": "antireq", "tree_path": path}
                    )
            if kept != node.get("codes"):
                node["unresolved_codes"] = [c for c in node.get("codes", []) if c not in valid_codes]
                node["codes"] = kept
    return tree


def _parse_one(
    html: str | None,
    use_llm: bool,
) -> tuple[RequirementNode | None, str | None]:
    """Returns (tree, source_label). source_label is None when there was nothing to parse."""
    if not html or not html.strip():
        return None, None
    tree = parse_tree(html)
    if tree is not None:
        return tree, "deterministic"
    if not use_llm:
        return None, "unparsed"
    from .llm_fallback import parse_with_llm

    tree = parse_with_llm(html)
    return tree, ("llm" if tree is not None else "unparsed")


def run(pid_filter: str | None, force: bool, use_llm: bool) -> None:
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        courses = session.exec(select(Course)).all()
        existing = {r.pid: r for r in session.exec(select(CourseRequirements)).all()}
        valid_codes = {c.code for c in courses}

        if pid_filter:
            courses = [c for c in courses if c.pid == pid_filter]

        unresolved_rows: list[dict[str, str]] = []
        stats = {"skipped": 0, "deterministic": 0, "llm": 0, "unparsed": 0, "empty": 0}

        for course in courses:
            detail = course.detail or {}
            source_hash = _hash_sources(detail)
            prior = existing.get(course.pid)
            if prior and prior.source_hash == source_hash and not force:
                stats["skipped"] += 1
                continue

            results: dict[str, tuple[RequirementNode | None, str | None]] = {}
            for field, key in (
                ("prereqs", "prerequisites"),
                ("coreqs", "corequisites"),
                ("antireqs", "antirequisites"),
            ):
                results[field] = _parse_one(detail.get(key), use_llm)

            labels = [lbl for _, lbl in results.values() if lbl and lbl != "unparsed"]
            if not labels:
                if all(r[1] is None for r in results.values()):
                    stats["empty"] += 1
                else:
                    stats["unparsed"] += 1
                    print(f"  [unparsed] {course.code} ({course.pid})")
                continue

            parsed_by = "+".join(sorted(set(labels)))
            for label in labels:
                stats[label] = stats.get(label, 0) + 1

            trees = {
                field: _mark_unresolved(tree, valid_codes, course.pid, unresolved_rows)
                for field, (tree, _) in results.items()
            }

            row = CourseRequirements(
                pid=course.pid,
                prereqs=trees["prereqs"],
                coreqs=trees["coreqs"],
                antireqs=trees["antireqs"],
                source_hash=source_hash,
                parsed_by=parsed_by,
                parsed_at=datetime.now(timezone.utc),
            )
            session.merge(row)

        session.commit()

    if unresolved_rows:
        UNRESOLVED_CSV.parent.mkdir(parents=True, exist_ok=True)
        with UNRESOLVED_CSV.open("w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=["pid", "code", "raw_phrase", "tree_path"])
            writer.writeheader()
            writer.writerows(unresolved_rows)
        print(f"Wrote {len(unresolved_rows)} unresolved leaves to {UNRESOLVED_CSV}")

    print("Done.")
    for k, v in stats.items():
        print(f"  {k}: {v}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pid", default=None)
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--no-llm", action="store_true")
    args = parser.parse_args()
    run(pid_filter=args.pid, force=args.force, use_llm=not args.no_llm)


if __name__ == "__main__":
    main()
