from dataclasses import dataclass


@dataclass
class EvaluationResult:
    name: str
    passed: bool
    reason: str


def evaluate_tools(
    name: str,
    used_tools: list[str],
    expected_tools: list[str] | None = None,
    forbidden_tools: list[str] | None = None,
) -> EvaluationResult:
    expected_tools = expected_tools or []
    forbidden_tools = forbidden_tools or []

    for tool in expected_tools:
        if tool not in used_tools:
            return EvaluationResult(
                name=name,
                passed=False,
                reason=f"Missing expected tool: {tool}",
            )

    for tool in forbidden_tools:
        if tool in used_tools:
            return EvaluationResult(
                name=name,
                passed=False,
                reason=f"Forbidden tool used: {tool}",
            )

    return EvaluationResult(name=name, passed=True, reason="ok")


def evaluate_dispatch(name: str, execution, expected: dict) -> EvaluationResult:
    driver_id = execution.driver_id
    candidate_ids = execution.candidate_ids or []

    if expected.get("recommended_driver_must_be_candidate"):
        if driver_id not in candidate_ids:
            return EvaluationResult(
                name=name,
                passed=False,
                reason="Recommended driver is not a candidate",
            )

    if "driver_id" in expected and execution.driver_id != expected["driver_id"]:
        return EvaluationResult(
            name=name,
            passed=False,
            reason=f"Expected driver {expected['driver_id']}, got {execution.driver_id}",
        )

    if expected.get("fallback") and not execution.fallback:
        return EvaluationResult(
            name=name,
            passed=False,
            reason="Expected dispatch fallback",
        )

    if expected.get("rejected_unknown") and not execution.rejected_unknown:
        return EvaluationResult(
            name=name,
            passed=False,
            reason="Unknown or busy driver was not rejected",
        )

    return EvaluationResult(name=name, passed=True, reason="ok")
