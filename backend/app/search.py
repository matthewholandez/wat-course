"""Lazy-initialized PGVectorStore singletons used by the /search routes."""

from __future__ import annotations

from langchain_openai import OpenAIEmbeddings
from langchain_postgres import PGEngine, PGVectorStore

from .db import POSTGRES_URL
from .embed import (
    COURSE_TABLE,
    PROGRAM_TABLE,
    build_embeddings,
)

_pg_engine: PGEngine | None = None
_embeddings: OpenAIEmbeddings | None = None
_courses_store: PGVectorStore | None = None
_programs_store: PGVectorStore | None = None


def _engine() -> PGEngine:
    global _pg_engine
    if _pg_engine is None:
        _pg_engine = PGEngine.from_connection_string(POSTGRES_URL)
    return _pg_engine


def _embedder() -> OpenAIEmbeddings:
    global _embeddings
    if _embeddings is None:
        _embeddings = build_embeddings()
    return _embeddings


def courses_store() -> PGVectorStore:
    global _courses_store
    if _courses_store is None:
        _courses_store = PGVectorStore.create_sync(
            engine=_engine(),
            embedding_service=_embedder(),
            table_name=COURSE_TABLE,
        )
    return _courses_store


def programs_store() -> PGVectorStore:
    global _programs_store
    if _programs_store is None:
        _programs_store = PGVectorStore.create_sync(
            engine=_engine(),
            embedding_service=_embedder(),
            table_name=PROGRAM_TABLE,
        )
    return _programs_store
