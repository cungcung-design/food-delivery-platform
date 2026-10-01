import asyncio
from dataclasses import dataclass

from app.dispatch.planner import choose_driver
from app.evaluation.cases import EVALUATION_CASES
from app.evaluation.evaluator import evaluate_dispatch, evaluate_tools
from app.guardrails.input import InvalidInputError, validate_message
from app.guardrails.output import validate_output
from app.guardrails.tools import validate_tool
from app.operations.planner import plan_operations
from app.support.planner import plan_support


@dataclass
class Execution:
    used_tools: list[str]
    driver_id: str | None = None
    candidate_ids: list[str] | None = None
    fallback: bool = False
    rejected_unknown: bool = False


async def run_evaluations(execute_case):
    results = []

    for case in EVALUATION_CASES:
        execution = await execute_case(case)
        expected = case.get("expected")
        if expected is not None:
            result = evaluate_dispatch(
                name=case["name"],
                execution=execution,
                expected=expected,
            )
        else:
            result = evaluate_tools(
                name=case["name"],
                used_tools=execution.used_tools,
                expected_tools=case.get("expected_tools"),
                forbidden_tools=case.get("forbidden_tools"),
            )
        results.append(result)

    return results


async def execute_case(case) -> Execution:
    agent = case["agent"]

    if agent == "support":
        return Execution(used_tools=plan_support(case["input"]))

    if agent == "operations":
        return Execution(used_tools=plan_operations(case["input"]))

    if case["name"] == "dispatch_no_candidates":
        decision = choose_driver([], None, False)
    elif case["name"] == "dispatch_ai_failure":
        decision = choose_driver(
            [{"driver_id": "driver-a", "status": "AVAILABLE"}],
            None,
            True,
        )
    elif case["name"] == "dispatch_unknown_driver":
        decision = choose_driver(
            [{"driver_id": "driver-a", "status": "AVAILABLE"}],
            "driver-unknown",
            False,
        )
    elif case["name"] == "dispatch_busy_candidate":
        decision = choose_driver(
            [
                {"driver_id": "driver-busy", "status": "BUSY"},
                {"driver_id": "driver-available", "status": "AVAILABLE"},
            ],
            "driver-busy",
            False,
        )
    else:
        decision = choose_driver(
            [
                {"driver_id": "driver-a", "status": "AVAILABLE"},
                {"driver_id": "driver-b", "status": "AVAILABLE"},
            ],
            "driver-a",
            False,
        )

    return Execution(
        used_tools=decision["tools"],
        driver_id=decision["driver_id"],
        candidate_ids=decision["candidate_ids"],
        fallback=decision["fallback"],
        rejected_unknown=decision["rejected_unknown"],
    )


def check_guardrails() -> None:
    try:
        validate_message("   ")
        raise AssertionError("empty message was accepted")
    except InvalidInputError:
        pass

    try:
        validate_message("x" * 4001)
        raise AssertionError("long message was accepted")
    except InvalidInputError:
        pass

    if validate_message("  Where is my order?  ") != "Where is my order?":
        raise AssertionError("message was not trimmed")

    if validate_output("  ") != "I couldn't complete that request.":
        raise AssertionError("empty output was not replaced")

    if len(validate_output("y" * 9000)) != 8000:
        raise AssertionError("output was not truncated")

    if validate_tool("support", "get_active_orders"):
        raise AssertionError("support can use an operations tool")

    if validate_tool("operations", "cancel_order"):
        raise AssertionError("operations can cancel")

    if validate_tool("unknown", "get_order"):
        raise AssertionError("unknown agent was allowed")

    try:
        from app.guardrails.tools import filter_tools

        filter_tools("support", ["get_active_orders"])
        raise AssertionError("disallowed tool was not rejected")
    except ValueError as error:
        if str(error) != "Tool is not allowed for this agent":
            raise


def main() -> None:
    check_guardrails()
    results = asyncio.run(run_evaluations(execute_case))
    failed = False
    for result in results:
        status = "PASS" if result.passed else "FAIL"
        print(f"{status} {result.name} {result.reason}")
        failed = failed or not result.passed
    if failed:
        raise SystemExit(1)
    print(f"{len(results)} evaluations passed")


if __name__ == "__main__":
    main()
