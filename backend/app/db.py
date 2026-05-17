from sqlmodel import SQLModel, create_engine, Session, Field
from typing import Annotated
from fastapi import FastAPI, Depends
from contextlib import asynccontextmanager

POSTGRES_URL = "postgresql://matthew@localhost:5432/watcourse"

engine = create_engine(POSTGRES_URL, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]

@asynccontextmanager
async def lifespan(app: FastAPI):
    # On startup
    create_db_and_tables()
    yield
    # On close