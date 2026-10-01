from app.guardrails.input import validate_message
from app.guardrails.tools import filter_tools


def is_cancel_action(message: str) -> bool:
    text = message.strip().lower()
    if "?" in text:
        return False
    if text.startswith(("can ", "could ", "should ", "may ", "what ", "how ", "is ", "do ")):
        return False
    return "cancel" in text


def plan_support(message: str, order_id: str = "") -> list[str]:
    message = validate_message(message)
    text = message.lower()
    tools: list[str] = []

    if any(word in text for word in ("where", "status", "track", "delivery", "my order")):
        tools.append("list_recent_orders")
        if order_id:
            tools.extend(["get_order", "get_delivery"])

    if any(word in text for word in ("refund", "money", "charge", "payment", "policy")):
        tools.append("get_policy")

    if "cancel" in text and not is_cancel_action(message):
        tools.append("get_policy")

    if is_cancel_action(message):
        tools.append("cancel_order")

    if any(word in text for word in ("ticket", "human", "complaint", "help", "support")):
        tools.append("create_support_ticket")

    if not tools:
        tools.append("get_policy")

    deduped = list(dict.fromkeys(tools))
    return filter_tools("support", deduped)
