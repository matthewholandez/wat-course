from typing import Annotated

from fastapi import APIRouter, Query
from sqlmodel import select

from app.db import SessionDep
from app.search import courses_store, programs_store
from app.types import (
    Course,
    CourseSearchHit,
    Program,
    ProgramSearchHit,
)

router = APIRouter(prefix="/search")


@router.get("/courses", response_model=list[CourseSearchHit])
def search_courses(
    session: SessionDep,
    q: Annotated[str, Query(min_length=1)],
    k: Annotated[int, Query(ge=1, le=50)] = 10,
):
    hits = courses_store().similarity_search_with_score(q, k=k)
    pid_score = [(doc.metadata["pid"], score) for doc, score in hits]
    rows = session.exec(
        select(Course).where(Course.pid.in_([pid for pid, _ in pid_score]))
    ).all()
    by_pid = {row.pid: row for row in rows}
    return [
        CourseSearchHit(
            pid=row.pid,
            code=row.code,
            title=row.title,
            subject=row.subject,
            course_level=row.course_level,
            score=score,
        )
        for pid, score in pid_score
        if (row := by_pid.get(pid)) is not None
    ]


@router.get("/programs", response_model=list[ProgramSearchHit])
def search_programs(
    session: SessionDep,
    q: Annotated[str, Query(min_length=1)],
    k: Annotated[int, Query(ge=1, le=50)] = 10,
):
    hits = programs_store().similarity_search_with_score(q, k=k)
    pid_score = [(doc.metadata["pid"], score) for doc, score in hits]
    rows = session.exec(
        select(Program).where(Program.pid.in_([pid for pid, _ in pid_score]))
    ).all()
    by_pid = {row.pid: row for row in rows}
    return [
        ProgramSearchHit(
            pid=row.pid,
            code=row.code,
            title=row.title,
            credential_type=row.credential_type,
            field_of_study=row.field_of_study,
            score=score,
        )
        for pid, score in pid_score
        if (row := by_pid.get(pid)) is not None
    ]
