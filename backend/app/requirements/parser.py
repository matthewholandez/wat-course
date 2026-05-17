"""Deterministic HTML → requirement tree parser.

The upstream catalog HTML is highly regular: every leaf is wrapped in
``<li data-test="ruleView-...">`` and operators come from literal
``Complete all of the following`` / ``Complete 1 of the following`` spans.
We exploit that. Anything that doesn't match the expected shape returns
``None`` and is handed to the LLM fallback by the batch driver.
"""

from __future__ import annotations

import re

from bs4 import BeautifulSoup, NavigableString, Tag

from ..types import normalize_code
from .schema import RequirementNode, all_of, collapse, n_of, one_of


_OPERATOR_RE = re.compile(r"^\s*Complete\s+(all|\d+)\s+of\s+the\s+following\s*$", re.I)
_AT_LEAST_RE = re.compile(r"Must have completed at least\s+(\d+)\s+of the following", re.I)
_MUST_COMPLETE_RE = re.compile(r"Must have completed the following", re.I)
_MIN_GRADE_RE = re.compile(r"Earned a minimum grade of\s+(\d+)\s*%", re.I)
_MIN_LEVEL_RE = re.compile(r"Students must be in level\s+([0-9A-Z]+)\s+or higher", re.I)
_EXACT_LEVEL_RE = re.compile(r"Students must be in level\s+([0-9A-Z]+)\s*$", re.I)
_ENROLLED_RE = re.compile(r"^Enrolled in\s+", re.I)
_NOT_OPEN_RE = re.compile(r"Not open to students enrolled in\s+(.+)", re.I)
_MIN_CUM_AVG_RE = re.compile(r"Earned a minimum cumulative average of\s+([\d.]+)", re.I)
_MIN_MAJOR_AVG_RE = re.compile(
    r"Earned a minimum\s+(.+?)\s+(?:major\s+)?average of\s+([\d.]+)", re.I
)
_ANTIREQ_RE = re.compile(
    r"Not completed(?:\s+nor concurrently enrolled in)?(?:\s+any of the following)?", re.I
)
_MILESTONE_RE = re.compile(r"Obtained\s+(?:all|at least \d+)\s+of", re.I)
_CODE_RE = re.compile(r"\b([A-Z]{2,6}\d{1,3}[A-Z]?)\b")


def parse_tree(html: str | None) -> RequirementNode | None:
    if not html or not html.strip():
        return None
    soup = BeautifulSoup(html, "html.parser")
    root_ul = soup.find("ul")
    if not isinstance(root_ul, Tag):
        return None
    node = _parse_ul(root_ul)
    if node is None:
        return None
    return collapse(node)


def _direct_lis(ul: Tag) -> list[Tag]:
    """Yield the <li> children of a <ul>, descending through inert wrapper <div>s.

    The catalog often wraps groups in ``<div><span class="rules_groupHeader_37"/><li>...</li></div>``
    which would otherwise be missed by ``recursive=False``.
    """
    out: list[Tag] = []
    for child in ul.children:
        if not isinstance(child, Tag):
            continue
        if child.name == "li":
            out.append(child)
        elif child.name == "div":
            for sub in child.children:
                if isinstance(sub, Tag) and sub.name == "li":
                    out.append(sub)
    return out


def _parse_ul(ul: Tag) -> RequirementNode | None:
    """Parse a <ul> into an operator node.

    The <ul>'s direct <li> children are either:
      - an operator wrapper: <li><span>Complete X of the following</span><ul>...</ul></li>
      - a leaf: <li data-test="ruleView-..."><div data-test="...-result">...</div></li>
    Top-level <ul>s sometimes contain only one leaf with no wrapper — treat that as all_of.
    """
    children_nodes: list[RequirementNode] = []
    for li in _direct_lis(ul):
        node = _parse_li(li)
        if node is None:
            return None
        children_nodes.append(node)
    if not children_nodes:
        return None
    return all_of(children_nodes)


def _parse_li(li: Tag) -> RequirementNode | None:
    # Leaf: has data-test="ruleView-..." (the ones with .X.Y suffixes too).
    dt = li.get("data-test", "")
    if isinstance(dt, str) and dt.startswith("ruleView-"):
        return _parse_leaf(li)

    # Operator wrapper: first child <span> tells us the op; the nested <ul> holds children.
    span = li.find("span", recursive=False)
    nested_ul = li.find("ul", recursive=False)
    if not isinstance(span, Tag) or not isinstance(nested_ul, Tag):
        return None
    op_text = span.get_text(" ", strip=True)
    m = _OPERATOR_RE.match(op_text)
    if not m:
        return None
    inner = _parse_ul(nested_ul)
    if inner is None:
        return None
    inner_children = inner.get("children", [inner]) if inner.get("op") == "all_of" else [inner]
    token = m.group(1).lower()
    if token == "all":
        return all_of(inner_children)
    if token == "1":
        return one_of(inner_children)
    return n_of(int(token), inner_children)


def _parse_leaf(li: Tag) -> RequirementNode | None:
    # The result div carries the actual rule text + (usually) <a> course/program links.
    result = li.find("div", attrs={"data-test": re.compile(r"-result$")})
    if not isinstance(result, Tag):
        # Some leaves nest the result deeper or omit data-test on the inner div.
        result = li
    text = result.get_text(" ", strip=True)
    course_codes = _extract_course_codes(result)
    program_name = _extract_program_name(result)

    # Antireqs — most specific check first.
    if _ANTIREQ_RE.search(text):
        codes = course_codes or _CODE_RE.findall(text)
        if not codes:
            return None
        return {"type": "antireq_courses", "codes": [normalize_code(c) for c in codes]}

    if _NOT_OPEN_RE.search(text):
        m = _NOT_OPEN_RE.search(text)
        assert m is not None
        return {"type": "not_enrolled_in", "program": m.group(1).strip()}

    if m := _MIN_GRADE_RE.search(text):
        grade = int(m.group(1))
        codes = course_codes or _CODE_RE.findall(text)
        if not codes:
            return None
        leaves: list[RequirementNode] = [
            {"type": "course_min_grade", "code": normalize_code(c), "min_grade": grade}
            for c in codes
        ]
        if len(leaves) == 1:
            return leaves[0]
        # "in each of the following" implies all_of.
        return all_of(leaves)

    if m := _AT_LEAST_RE.search(text):
        n = int(m.group(1))
        codes = course_codes or _CODE_RE.findall(text)
        if not codes:
            return None
        leaves = [{"type": "course", "code": normalize_code(c)} for c in codes]
        return one_of(leaves) if n == 1 else n_of(n, leaves)

    if _MUST_COMPLETE_RE.search(text):
        codes = course_codes or _CODE_RE.findall(text)
        if not codes:
            return None
        leaves = [{"type": "course", "code": normalize_code(c)} for c in codes]
        return leaves[0] if len(leaves) == 1 else all_of(leaves)

    if m := _MIN_LEVEL_RE.search(text):
        return {"type": "min_level", "level": m.group(1)}

    if m := _EXACT_LEVEL_RE.search(text):
        return {"type": "min_level", "level": m.group(1)}

    if _ENROLLED_RE.search(text):
        programs = _extract_all_program_names(result)
        if not programs:
            program = _ENROLLED_RE.sub("", text).strip()
            return {"type": "enrolled_in", "program": program}
        if len(programs) == 1:
            return {"type": "enrolled_in", "program": programs[0]}
        return one_of([{"type": "enrolled_in", "program": p} for p in programs])

    if m := _MIN_CUM_AVG_RE.search(text):
        return {"type": "min_cumulative_avg", "min": float(m.group(1))}

    if m := _MIN_MAJOR_AVG_RE.search(text):
        # Guard: cumulative-average phrasing also matches this regex; the cumulative
        # check above runs first so we only land here for major averages.
        return {"type": "min_major_avg", "major": m.group(1).strip(), "min": float(m.group(2))}

    if _MILESTONE_RE.search(text):
        # Milestone names aren't linkified — fall back to splitting after the colon.
        tail = text.split(":", 1)[1] if ":" in text else text
        names = [n.strip() for n in re.split(r"\s+AND\s+", tail) if n.strip()]
        if not names:
            return None
        leaves = [{"type": "milestone", "name": n} for n in names]
        return leaves[0] if len(leaves) == 1 else all_of(leaves)

    return None


def _extract_course_codes(tag: Tag) -> list[str]:
    """Pull course codes from <a href="#/courses/view/..."> anchor text."""
    codes: list[str] = []
    for a in tag.find_all("a"):
        href = a.get("href", "")
        if isinstance(href, str) and "/courses/view/" in href:
            label = a.get_text(strip=True)
            if label:
                codes.append(label)
    return codes


def _extract_program_name(tag: Tag) -> str | None:
    names = _extract_all_program_names(tag)
    return names[0] if names else None


def _extract_all_program_names(tag: Tag) -> list[str]:
    out: list[str] = []
    for a in tag.find_all("a"):
        href = a.get("href", "")
        if isinstance(href, str) and "/programs/view/" in href:
            label = a.get_text(strip=True)
            if label:
                out.append(label)
    return out


def _coerce_navstring(s: NavigableString) -> str:
    return str(s)
