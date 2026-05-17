from fastapi import APIRouter, Query
from sqlmodel import select

from app.types import ReadCourse, Course
from app.db import SessionDep

from typing import Annotated

router = APIRouter()

@router.get("/courses", response_model=list[ReadCourse])
def read_courses(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100
    ):
    courses = session.exec(select(Course).offset(offset).limit(limit)).all()
    return courses
