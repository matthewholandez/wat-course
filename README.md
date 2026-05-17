# wc-api-rewrite

**Note: This document was written with Claude Opus 4.7. It will (eventually) be rewritten by my own hand.**

A rewrite of the University of Waterloo course/program catalog API. Exposes structured lookups and semantic search over UW's courses and programs, plus a normalized prerequisite/corequisite/antirequisite tree for each course.

## Layout

- `backend/` — FastAPI service (Python 3.12+, `uv`). See [`backend/CLAUDE.md`](backend/CLAUDE.md) for architecture details.

## Stack

- **FastAPI** + **SQLModel** on **Postgres** for structured data (`Course`, `Program`, `CourseRequirements`).
- **pgvector** via `langchain-postgres` for semantic search, embedded with OpenAI `text-embedding-3-small` (1536-dim) through OpenRouter.
- **psycopg3** driver throughout.

## Quick start

```bash
cd backend

# Install dependencies
uv sync

# Run the API (dev server with reload)
uv run fastapi dev app/main.py

# Seed Postgres from bundled JSON fixtures
uv run python -m app.seed

# Embed all courses and programs into pgvector
uv run python -m app.embed

# Parse prereq/coreq/antireq HTML into normalized requirement trees
uv run python -m app.requirements.extract
```

Requires a local Postgres at `postgresql://matthew@localhost:5432/watcourse` with the `pgvector` extension available, and `OPENROUTER_API_KEY` set in `backend/.env.local` for embedding and LLM-fallback requirement parsing.

## Endpoints

- `GET /courses` and `GET /courses/{code}` — paginated list / detail by course code (codes are normalized, so `CS 245` and `cs245` both resolve).
- `GET /courses/{code}/requirements` — normalized AND/OR tree of prereqs, coreqs, and antireqs.
- `GET /programs` and `GET /programs/{code}` — same shape as courses.
- `GET /search/courses` and `GET /search/programs` — vector similarity search; returns typed hits with a `score`.

## Data flow

1. `app/data/courses.json` + `app/data/courses/<pid>.json` (and equivalent for programs) are the source of truth.
2. `app.seed` merges them into Postgres in batches.
3. `app.embed` reads back from Postgres, builds per-record text via `course_document` / `program_document`, and upserts into pgvector tables.
4. `app.requirements.extract` parses each course's requirement HTML with a deterministic BeautifulSoup walker, falling back to an LLM (via OpenRouter) only when the deterministic parser can't resolve the rule. Unresolved course-code leaves are appended to `unresolved_leaves.csv`.

Search routes hydrate Postgres rows from the `pid`s returned by the vector store, so the two stores stay linked by `pid` only.
