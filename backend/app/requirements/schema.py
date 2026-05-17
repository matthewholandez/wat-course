"""Grammar for the normalized requirement tree.

Every node is a dict. Operators have ``op`` and ``children``; leaves have
``type`` and type-specific fields. Keep this file small — it's the contract
the LLM fallback prompt is built against.
"""

from __future__ import annotations

from typing import Any, Literal, TypedDict


OPERATORS = {"all_of", "one_of", "n_of"}

LEAF_TYPES = {
    "course",
    "course_min_grade",
    "min_level",
    "enrolled_in",
    "not_enrolled_in",
    "min_cumulative_avg",
    "min_major_avg",
    "milestone",
    "antireq_courses",
    "raw",
}


RequirementNode = dict[str, Any]


class _OperatorNode(TypedDict, total=False):
    op: Literal["all_of", "one_of", "n_of"]
    n: int
    children: list[RequirementNode]


def all_of(children: list[RequirementNode]) -> RequirementNode:
    return {"op": "all_of", "children": children}


def one_of(children: list[RequirementNode]) -> RequirementNode:
    return {"op": "one_of", "children": children}


def n_of(n: int, children: list[RequirementNode]) -> RequirementNode:
    return {"op": "n_of", "n": n, "children": children}


def collapse(node: RequirementNode) -> RequirementNode:
    """Flatten single-child operators and merge nested operators of the same kind."""
    if "op" not in node:
        return node
    kids = [collapse(c) for c in node.get("children", [])]
    flat: list[RequirementNode] = []
    for k in kids:
        if k.get("op") == node["op"] and node["op"] in ("all_of", "one_of"):
            flat.extend(k["children"])
        else:
            flat.append(k)
    if len(flat) == 1 and node["op"] in ("all_of", "one_of"):
        return flat[0]
    out = dict(node)
    out["children"] = flat
    return out


def validate(node: RequirementNode) -> bool:
    if "op" in node:
        if node["op"] not in OPERATORS:
            return False
        if node["op"] == "n_of" and not isinstance(node.get("n"), int):
            return False
        return all(validate(c) for c in node.get("children", []))
    return node.get("type") in LEAF_TYPES
