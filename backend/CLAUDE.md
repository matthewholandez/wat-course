# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This project uses `uv` for dependency management and Python 3.12+.

```bash
# Install deps
uv sync

# Run the API (FastAPI dev server with reload)
uv run fastapi dev app/main.py

# Seed Postgres from bundled JSON fixtures (drops & recreates Course/Program tables)
uv run python -m app.seed

# (Re-)embed all courses and programs into pgvector tables
# Requires OPENROUTER_API_KEY in .env.local
uv run python -m app.embed
```

Postgres connection is hard-coded in `app/db.py` as `postgresql://matthew@localhost:5432/watcourse`. A local Postgres with the `pgvector` extension available must be running — `app.embed` creates the extension on first run.

There is no test suite, linter, or formatter configured.

## Architecture

The backend is a FastAPI service that exposes the University of Waterloo course/program catalog with both structured lookups and semantic search. Two parallel data stores back the API:

1. **Postgres (SQLModel)** — `Course` and `Program` tables holding normalized fields plus the full original catalog payload in a JSONB `detail` column. Defined in `app/types.py`; engine and session dependency in `app/db.py`. Schema is created on app startup via the `lifespan` context manager in `app/db.py`.
2. **pgvector tables** — `course_embeddings` and `program_embeddings`, managed by `langchain_postgres.PGVectorStore`. Populated by `app/embed.py` using OpenAI `text-embedding-3-small` (1536-dim) via OpenRouter. Document IDs are deterministic UUIDv5s derived from each record's `pid`, so re-embedding is idempotent per record (though `app.embed` drops and recreates the tables on every run).

The two stores are linked by `pid`: vector search returns `pid`s, which are then hydrated from Postgres in a single `IN` query (see `app/routers/search.py`).

### Request flow

- `app/main.py` mounts three routers: `courses`, `programs`, `search`.
- `app/routers/courses.py` and `app/routers/programs.py` expose list (paginated, ordered by `code`) and detail (by normalized code) endpoints. Codes from the URL path are run through `normalize_code` (strips non-alphanumerics) before lookup, so `CS 245` and `cs245` both work.
- `app/routers/search.py` does vector similarity search then hydrates structured rows from Postgres, returning typed `*SearchHit` models that include the similarity `score`.
- `app/search.py` holds **lazy-initialized singletons** for `PGEngine`, `OpenAIEmbeddings`, and the two `PGVectorStore`s. Search routes go through these so the embedding client and DB engine aren't constructed at import time. Do not instantiate `PGVectorStore` per request.

### Seeding & embedding pipeline

- `app/data/courses.json` + `app/data/courses/<pid>.json` (one detail file per course, ~4,300 files) and the equivalent `programs` tree are the source of truth. `app/seed.py` merges them into Postgres in batches of 500.
- `app/embed.py` reads from Postgres (not JSON), composes per-record text via `course_document` / `program_document` (title + HTML-stripped description, prereqs, requirements, specializations), and writes to the pgvector tables in batches of 200.
- The embedding endpoint hits OpenRouter (`OPENROUTER_BASE_URL`) using the OpenAI SDK — note the model string is `openai/text-embedding-3-small` (OpenRouter-prefixed), and `check_embedding_ctx_length=False` is required for non-OpenAI base URLs.
- The whole app uses psycopg3 — `POSTGRES_URL` in `app/db.py` carries the `postgresql+psycopg://` driver prefix, which both SQLModel/SQLAlchemy and `langchain-postgres` accept directly.

### Type conventions

`app/types.py` defines layered SQLModel response models: `*ListItem` (lightweight, for list endpoints), `*Detail` (extends list item with the JSONB `detail`), and `*SearchHit` (list item + `score`). When adding fields, update all three tiers consistently.
