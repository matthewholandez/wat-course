from typing import Annotated

from fastapi import APIRouter, HTTPException, Query
from sqlmodel import select

from app.db import SessionDep
from app.types import Program, ProgramDetail, ProgramListItem, normalize_code

router = APIRouter()


@router.get("/programs", response_model=list[ProgramListItem])
def read_programs(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
):
    return session.exec(
        select(Program).order_by(Program.code).offset(offset).limit(limit)
    ).all()


@router.get("/programs/{code}", response_model=ProgramDetail)
def read_program(code: str, session: SessionDep):
    program = session.exec(
        select(Program).where(Program.code == normalize_code(code))
    ).first()
    if program is None:
        raise HTTPException(status_code=404, detail="Program not found")
    return program
