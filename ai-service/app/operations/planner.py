from app.guardrails.input import validate_message
from app.guardrails.tools import filter_tools


def plan_operations(message: str) -> list[str]:
    message = validate_message(message)
    text = message.lower()
    tools = ["get_active_orders", "get_delayed_orders"]

    if any(word in text for word in ("driver", "dispatch", "metric")):
        tools.append("get_driver_metrics")

    if "restaurant" in text or "load" in text:
        tools.append("get_restaurant_load")

    return filter_tools("operations", list(dict.fromkeys(tools)))
