"""LLM fallback: only used when the deterministic parser returns None.

Routes through OpenRouter (same env var as ``app.embed``). Uses JSON mode
with the grammar spelled out in the system prompt — broader OpenRouter
model compatibility than json_schema mode.
"""

from __future__ import annotations

import json
import os
from functools import cache

from openai import OpenAI

from .schema import RequirementNode, collapse, validate

LLM_FALLBACK_MODEL = "openai/gpt-4o-mini"
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

_SYSTEM_PROMPT = """You convert University of Waterloo course requirement HTML into a normalized JSON tree.

Output JSON shape — every node is either an operator or a leaf:

OPERATORS:
  {"op": "all_of", "children": [...]}
  {"op": "one_of", "children": [...]}
  {"op": "n_of",   "n": <int>, "children": [...]}

LEAVES:
  {"type": "course", "code": "CS245"}
  {"type": "course_min_grade", "code": "SYDE212", "min_grade": 70}
  {"type": "min_level", "level": "3A"}
  {"type": "enrolled_in", "program": "H-Biomedical Engineering"}
  {"type": "not_enrolled_in", "program": "Faculty of Mathematics"}
  {"type": "min_cumulative_avg", "min": 75}
  {"type": "min_major_avg", "major": "Psychology", "min": 75.0}
  {"type": "milestone", "name": "Fine Arts Health and Safety Milestone"}
  {"type": "antireq_courses", "codes": ["STAT331", "STAT371"]}

Rules:
- Course codes must be uppercase with no spaces (e.g. "CS245", not "CS 245").
- Strip program prefixes like "H-" only if the source omits them; otherwise preserve verbatim.
- If the input is empty or has no requirements, return null.
- Return ONLY the JSON tree (or null). No prose, no markdown fences.
- Top-level response shape: {"tree": <node or null>}
"""


@cache
def _client() -> OpenAI:
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        raise SystemExit("OPENROUTER_API_KEY is required for LLM fallback")
    return OpenAI(api_key=api_key, base_url=OPENROUTER_BASE_URL)


def parse_with_llm(html: str | None) -> RequirementNode | None:
    if not html or not html.strip():
        return None
    resp = _client().chat.completions.create(
        model=LLM_FALLBACK_MODEL,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": html},
        ],
    )
    raw = resp.choices[0].message.content or ""
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        return None
    tree = payload.get("tree")
    if tree is None:
        return None
    if not validate(tree):
        return None
    return collapse(tree)
