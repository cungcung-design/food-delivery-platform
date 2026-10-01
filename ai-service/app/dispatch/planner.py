from app.guardrails.tools import filter_tools


def choose_driver(candidates: list[dict], proposed_id: str | None, ai_failed: bool) -> dict:
    available = [
        candidate
        for candidate in candidates
        if candidate.get("status", "AVAILABLE") == "AVAILABLE"
    ]
    tools = filter_tools(
        "dispatch",
        ["get_dispatch_context", "find_available_drivers"],
    )

    if not available:
        return {
            "tools": tools,
            "driver_id": None,
            "candidate_ids": [],
            "fallback": ai_failed,
            "rejected_unknown": False,
        }

    candidate_ids = [candidate["driver_id"] for candidate in available]

    if ai_failed:
        return {
            "tools": tools,
            "driver_id": candidate_ids[0],
            "candidate_ids": candidate_ids,
            "fallback": True,
            "rejected_unknown": False,
        }

    if proposed_id and proposed_id not in candidate_ids:
        return {
            "tools": tools,
            "driver_id": candidate_ids[0],
            "candidate_ids": candidate_ids,
            "fallback": True,
            "rejected_unknown": True,
        }

    if proposed_id:
        return {
            "tools": tools,
            "driver_id": proposed_id,
            "candidate_ids": candidate_ids,
            "fallback": False,
            "rejected_unknown": False,
        }

    return {
        "tools": tools,
        "driver_id": candidate_ids[0],
        "candidate_ids": candidate_ids,
        "fallback": False,
        "rejected_unknown": False,
    }
