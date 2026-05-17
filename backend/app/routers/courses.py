from typing import Annotated

from fastapi import APIRouter, HTTPException, Query
from sqlmodel import select

from app.db import SessionDep
from app.types import (
    Course,
    CourseDetail,
    CourseListItem,
    CourseRequirements,
    CourseRequirementsResponse,
    normalize_code,
)

router = APIRouter()


@router.get("/courses", response_model=list[CourseListItem])
def read_courses(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
):
    return session.exec(
        select(Course).order_by(Course.code).offset(offset).limit(limit)
    ).all()


@router.get("/courses/{code}", response_model=CourseDetail)
def read_course(code: str, session: SessionDep):
    course = session.exec(
        select(Course).where(Course.code == normalize_code(code))
    ).first()
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.get("/courses/{code}/requirements", response_model=CourseRequirementsResponse)
def read_course_requirements(code: str, session: SessionDep):
    course = session.exec(
        select(Course).where(Course.code == normalize_code(code))
    ).first()
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    reqs = session.get(CourseRequirements, course.pid)
    if reqs is None:
        raise HTTPException(status_code=404, detail="Requirements not parsed yet")
    return CourseRequirementsResponse(
        pid=course.pid,
        code=course.code,
        prereqs=reqs.prereqs,
        coreqs=reqs.coreqs,
        antireqs=reqs.antireqs,
    )
