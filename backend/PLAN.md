# PLAN.md — WatCourse extension roadmap

Forward-looking work, ordered roughly by leverage. Each item lists *why*, *what to build*, and *where it lands in the codebase*.

## 1. Prereq logic layer (foundation for everything else)

Right now `Course.detail.prerequisites` is free-form HTML written for humans ("One of CS 245, CS 245E; MATH 239 or 249; Level at least 3A Computer Science"). Nothing downstream can reason about it.

**Build:**
- New table `course_requirements` keyed by `pid`, storing a normalized requirement tree as JSONB. Tree grammar: `{all_of|one_of|min_grade|min_level|antireq: [...]}` with leaves being `{course: "CS245"}` or `{program: ...}`.
- Batch script `app/extract_requirements.py` that runs every course's raw prereq/coreq/antireq HTML through an LLM (Claude Sonnet 4.6 with structured outputs) and writes the parsed tree. Idempotent on `(pid, source_hash)` so re-runs only re-parse changed entries. Use prompt caching for the system prompt + grammar spec — corpus is ~4.3k courses, so cache hit rate matters.
- Validation pass: every `{course: "..."}` leaf must resolve to a real `Course.code`; emit a CSV of unresolved leaves for manual review.
- Expose `GET /courses/{code}/requirements` returning the structured tree.

**Why first:** the chatbot, prereq graph, degree audit, and "can I take this?" check all depend on this. Doing it once and storing it beats re-parsing on every request.

## 2. Course advisor chatbot

**Build:**
- `POST /chat` streaming endpoint (SSE) using Claude with tool use. Tools wrap existing API surface:
  - `search_courses(query, k)` → vector search
  - `get_course(code)` → detail + parsed requirements
  - `check_prereqs(target_code, completed_codes[])` → walks the requirement tree from (1)
  - `find_path_to(target_code, completed_codes[])` → returns minimal set of courses needed
- System prompt anchors the model to the Waterloo catalog and forbids hallucinated course codes (must come from a tool result).
- Conversation state: store transcripts in a new `chat_sessions` table; thread by session id from the Next.js client.
- Use prompt caching on the system prompt + tool schemas (they're stable per deploy).

**Frontend:** streaming chat UI in Next.js that renders course-code mentions as inline links to `/courses/[code]`.

## 3. Prerequisite graph

With (1) in place, derive a directed graph: edge from each `{course: X}` leaf to the parent course. Cache the full subject-level subgraph (e.g. all CS) in Redis or a static JSON blob regenerated on embed runs.

**Endpoints:**
- `GET /courses/{code}/graph?depth=2&direction=prereqs|unlocks` — returns nodes + edges scoped to a neighborhood.
- `GET /subjects/{code}/graph` — full subgraph for a subject.

**Frontend:** render with `react-flow` or `cytoscape.js`. "What does CS 245 unlock?" is a high-value query that's impossible today.

## 4. Hybrid search (BM25 + vector)

Pure vector search misses exact-code queries ("CS 350") and rare proper nouns. Add a Postgres FTS index on `code || ' ' || title || ' ' || stripped_description`, then fuse with vector scores via Reciprocal Rank Fusion in `app/routers/search.py`. Keeps the existing endpoint shape; just better recall + precision.

Also: support `subject` and `course_level` filters as query params, passed into pgvector's metadata filter.

## 5. Incremental embedding

`app/embed.py` currently drops and re-creates both tables on every run. That's fine at 4.5k docs but breaks once we add term offerings, reviews, or anything mutable.

**Build:** compute a content hash per record at seed time, store it on `Course`/`Program`. In `embed.py`, diff against the existing pgvector rows by UUIDv5 id and only re-embed changed records. The UUIDv5 scheme already makes this safe.

## 6. Term-offering data

Courses currently have no "when is this offered" data. Scrape (or pull from the official schedule of classes) `{pid, term, section, instructor, meeting_times, enrollment_cap}` into a `course_offerings` table. Unlocks:
- "What's offered in F2026?"
- Conflict-free schedule generation (constraint solver over user's chosen courses).
- Instructor-aware ranking in search.

## 7. Degree audit / program planner

With (1) + (6), build a planner that takes `{program_code, completed_courses, target_term}` and returns a valid term-by-term schedule satisfying program requirements. Frame as constraint satisfaction (use `python-constraint` or `cpmpy`) over: program rules, prereqs, term offerings, max courses per term, antireqs.

Expose as `POST /plan` and surface in the chatbot as a tool.

## 8. User accounts + saved state

Once (2) and (7) exist, users want to persist completed courses, saved plans, and chat history. Add auth (Clerk or NextAuth on the frontend, JWT verification middleware on FastAPI), plus `users`, `user_courses_completed`, `saved_plans` tables.

## 9. Operational hygiene

Not glamorous, becomes painful without:
- Move `POSTGRES_URL` and other config to env vars (currently hard-coded in `app/db.py`); use `pydantic-settings`.
- Drop the dual psycopg2/psycopg3 setup — standardize on psycopg3 so `app/db.py` and `app/embed.py` share one driver.
- Add `ruff` + `pytest`. First tests should cover `normalize_code`, the requirement-tree parser's grammar validator, and the hybrid-search fusion.
- Structured logging (replace SQLAlchemy `echo=True`) + request IDs.
- Dockerize: `Dockerfile` + `docker-compose.yml` with Postgres+pgvector, so the project is one `docker compose up` away from running.

## 10. Frontend polish (Next.js side)

- Course detail pages with rendered prereq tree (collapsible AND/OR groups) sourced from (1).
- Search-as-you-type with debounced calls to `/search/courses` and `/search/programs` in parallel.
- "Compare programs" view leveraging `ProgramDetail.detail`.
- Share-able plan URLs that encode the user's completed courses + target program into the path.

---

### Suggested order

1 → 2 → 4 → 3 → 5 → 6 → 7 → 8, with 9 interleaved continuously and 10 picked up opportunistically as backend endpoints land.
