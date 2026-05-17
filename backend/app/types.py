import re
from datetime import datetime
from typing import Any

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel


def normalize_code(raw: str) -> str:
    """Strip spaces and non-alphanumeric characters from a catalog code."""
    return re.sub(r"[^A-Za-z0-9]", "", raw or "")


class Course(SQLModel, table=True):
    pid: str = Field(primary_key=True)
    code: str = Field(index=True, unique=True)
    title: str
    subject: str
    course_level: str
    detail: dict[str, Any] = Field(
        default_factory=dict, sa_column=Column(JSONB, nullable=False, default=dict)
    )


class Program(SQLModel, table=True):
    pid: str = Field(primary_key=True)
    code: str = Field(index=True, unique=True)
    title: str
    credential_type: str
    field_of_study: str
    detail: dict[str, Any] = Field(
        default_factory=dict, sa_column=Column(JSONB, nullable=False, default=dict)
    )


class CourseListItem(SQLModel):
    pid: str
    code: str
    title: str
    subject: str
    course_level: str


class CourseDetail(CourseListItem):
    detail: dict[str, Any]


class ProgramListItem(SQLModel):
    pid: str
    code: str
    title: str
    credential_type: str
    field_of_study: str


class ProgramDetail(ProgramListItem):
    detail: dict[str, Any]


class CourseSearchHit(CourseListItem):
    score: float


class CourseRequirements(SQLModel, table=True):
    pid: str = Field(primary_key=True, foreign_key="course.pid")
    prereqs: dict[str, Any] | None = Field(
        default=None, sa_column=Column(JSONB, nullable=True)
    )
    coreqs: dict[str, Any] | None = Field(
        default=None, sa_column=Column(JSONB, nullable=True)
    )
    antireqs: dict[str, Any] | None = Field(
        default=None, sa_column=Column(JSONB, nullable=True)
    )
    source_hash: str
    parsed_by: str
    parsed_at: datetime


class CourseRequirementsResponse(SQLModel):
    pid: str
    code: str
    prereqs: dict[str, Any] | None = None
    coreqs: dict[str, Any] | None = None
    antireqs: dict[str, Any] | None = None


class ProgramSearchHit(ProgramListItem):
    score: float
