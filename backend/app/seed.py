"""Seed the watcourse Postgres database from the bundled JSON fixtures.

Run with: ``python -m app.seed``
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from sqlmodel import Session, SQLModel

from .db import engine, create_db_and_tables
from .types import Course, Program, normalize_code  # noqa: F401 (register tables)

DATA_DIR = Path(__file__).parent / "data"
BATCH_SIZE = 500


def _load_detail(dir_path: Path, pid: str) -> dict[str, Any] | None:
    path = dir_path / f"{pid}.json"
    if not path.exists():
        return None
    with path.open() as f:
        return json.load(f)


def seed_courses(session: Session) -> int:
    with (DATA_DIR / "courses.json").open() as f:
        entries: list[dict[str, Any]] = json.load(f)

    detail_dir = DATA_DIR / "courses"
    count = 0
    for i, entry in enumerate(entries, start=1):
        pid = entry["pid"]
        detail = _load_detail(detail_dir, pid)
        if detail is None:
            print(f"[courses] skipping {pid}: missing detail file")
            continue

        session.merge(
            Course(
                pid=pid,
                code=normalize_code(entry.get("__catalogCourseId", "")),
                title=entry.get("title", ""),
                subject=(entry.get("subjectCode") or {}).get("name", ""),
                course_level=(entry.get("courseLevel") or {}).get("name", ""),
                detail=detail,
            )
        )
        count += 1
        if i % BATCH_SIZE == 0:
            session.commit()
            print(f"[courses] committed {i}")

    session.commit()
    return count


def seed_programs(session: Session) -> int:
    with (DATA_DIR / "programs.json").open() as f:
        entries: list[dict[str, Any]] = json.load(f)

    detail_dir = DATA_DIR / "programs"
    count = 0
    for i, entry in enumerate(entries, start=1):
        pid = entry["pid"]
        detail = _load_detail(detail_dir, pid)
        if detail is None:
            print(f"[programs] skipping {pid}: missing detail file")
            continue

        session.merge(
            Program(
                pid=pid,
                code=normalize_code(entry.get("code", "")),
                title=entry.get("title", ""),
                credential_type=(entry.get("undergraduateCredentialType") or {}).get(
                    "name", ""
                ),
                field_of_study=(entry.get("fieldOfStudy") or {}).get("name", ""),
                detail=detail,
            )
        )
        count += 1
        if i % BATCH_SIZE == 0:
            session.commit()
            print(f"[programs] committed {i}")

    session.commit()
    return count


def main() -> None:
    SQLModel.metadata.drop_all(engine)
    create_db_and_tables()
    with Session(engine) as session:
        n_courses = seed_courses(session)
        n_programs = seed_programs(session)
    print(f"Seeded {n_courses} courses and {n_programs} programs.")


if __name__ == "__main__":
    main()
