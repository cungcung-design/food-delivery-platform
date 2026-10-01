SUPPORT_TOOLS = {
    "get_order",
    "get_delivery",
    "get_policy",
    "list_recent_orders",
    "cancel_order",
    "create_support_ticket",
}

DISPATCH_TOOLS = {
    "get_dispatch_context",
    "find_available_drivers",
}

OPERATIONS_TOOLS = {
    "get_active_orders",
    "get_delayed_orders",
    "get_restaurant_load",
    "get_driver_metrics",
}


def validate_tool(agent: str, tool_name: str) -> bool:
    allowlists = {
        "support": SUPPORT_TOOLS,
        "dispatch": DISPATCH_TOOLS,
        "operations": OPERATIONS_TOOLS,
    }

    allowed = allowlists.get(agent)

    if allowed is None:
        return False

    return tool_name in allowed


def filter_tools(agent: str, tool_names: list[str]) -> list[str]:
    allowed = []
    for tool_name in tool_names:
        if not validate_tool(agent, tool_name):
            raise ValueError("Tool is not allowed for this agent")
        allowed.append(tool_name)
    return allowed
