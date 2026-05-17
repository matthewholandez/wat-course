"""Embed all courses and programs into pgvector tables.

Run with: ``OPENAI_API_KEY=... python -m app.embed``

This drops and recreates ``course_embeddings`` and ``program_embeddings``
tables on every run. At ~4.5k documents this costs well under $0.10 against
``text-embedding-3-small`` and finishes in 1-2 minutes.
"""

from __future__ import annotations

import os
import uuid

from dotenv import load_dotenv

from bs4 import BeautifulSoup
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from langchain_postgres import PGEngine, PGVectorStore
from sqlalchemy import text
from sqlmodel import Session, select

from .db import POSTGRES_URL, engine
from .types import Course, Program

load_dotenv('.env.local')

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
EMBED_MODEL = "openai/text-embedding-3-small"
EMBED_DIMS = 1536
COURSE_TABLE = "course_embeddings"
PROGRAM_TABLE = "program_embeddings"
BATCH_SIZE = 200


def strip_html(html: str | None) -> str:
    if not html:
        return ""
    return BeautifulSoup(html, "html.parser").get_text(" ", strip=True)


def ensure_pgvector_extension() -> None:
    with engine.begin() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))


def course_document(course: Course) -> Document:
    detail = course.detail or {}
    body = "\n\n".join(
        part
        for part in [
            f"{course.code} — {course.title}",
            strip_html(detail.get("description")),
            f"Prereqs: {strip_html(detail.get('prerequisites'))}".strip(),
        ]
        if part
    )
    return Document(
        page_content=body,
        metadata={"pid": course.pid, "code": course.code, "title": course.title},
    )


def program_document(program: Program) -> Document:
    detail = program.detail or {}
    body = "\n\n".join(
        part
        for part in [
            f"{program.code} — {program.title}",
            f"Field of study: {program.field_of_study}",
            f"Credential: {program.credential_type}",
            strip_html(detail.get("requirements")),
            strip_html(detail.get("specializationsList")),
        ]
        if part
    )
    return Document(
        page_content=body,
        metadata={"pid": program.pid, "code": program.code, "title": program.title},
    )


def _pid_uuid(pid: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_URL, f"watcourse:{pid}"))


def embed_documents(
    store: PGVectorStore, docs_with_pids: list[tuple[str, Document]]
) -> int:
    total = 0
    for i in range(0, len(docs_with_pids), BATCH_SIZE):
        batch = docs_with_pids[i : i + BATCH_SIZE]
        ids = [_pid_uuid(pid) for pid, _ in batch]
        documents = [doc for _, doc in batch]
        store.add_documents(documents, ids=ids)
        total += len(batch)
        print(f"  embedded {total}/{len(docs_with_pids)}")
    return total


def build_embeddings() -> OpenAIEmbeddings:
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        raise SystemExit("OPENROUTER_API_KEY is required")
    return OpenAIEmbeddings(
        model=EMBED_MODEL,
        base_url=OPENROUTER_BASE_URL,
        api_key=api_key,
        check_embedding_ctx_length=False,
    )


def main() -> None:
    ensure_pgvector_extension()

    pg_engine = PGEngine.from_connection_string(POSTGRES_URL)
    embeddings = build_embeddings()

    for table_name in (COURSE_TABLE, PROGRAM_TABLE):
        pg_engine.init_vectorstore_table(
            table_name=table_name,
            vector_size=EMBED_DIMS,
            overwrite_existing=True,
        )

    courses_store = PGVectorStore.create_sync(
        engine=pg_engine,
        embedding_service=embeddings,
        table_name=COURSE_TABLE,
    )
    programs_store = PGVectorStore.create_sync(
        engine=pg_engine,
        embedding_service=embeddings,
        table_name=PROGRAM_TABLE,
    )

    with Session(engine) as session:
        courses = session.exec(select(Course)).all()
        programs = session.exec(select(Program)).all()

    print(f"Embedding {len(courses)} courses...")
    embed_documents(courses_store, [(c.pid, course_document(c)) for c in courses])

    print(f"Embedding {len(programs)} programs...")
    embed_documents(programs_store, [(p.pid, program_document(p)) for p in programs])

    print("Done.")


if __name__ == "__main__":
    main()
