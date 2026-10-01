package ai

import "strings"

const (
	MaxMessageLength  = 4000
	MaxResponseLength = 8000
)

var (
	supportTools = map[string]struct{}{
		"get_order":             {},
		"get_delivery":          {},
		"get_policy":            {},
		"list_recent_orders":    {},
		"cancel_order":          {},
		"create_support_ticket": {},
	}
	dispatchTools = map[string]struct{}{
		"get_dispatch_context":   {},
		"find_available_drivers": {},
	}
	operationsTools = map[string]struct{}{
		"get_active_orders":   {},
		"get_delayed_orders":  {},
		"get_restaurant_load": {},
		"get_driver_metrics":  {},
	}
)

type InputError struct {
	Message string
}

func (e InputError) Error() string {
	return e.Message
}

func ValidateTool(agent string, toolName string) bool {
	var allowed map[string]struct{}
	switch agent {
	case "support":
		allowed = supportTools
	case "dispatch":
		allowed = dispatchTools
	case "operations":
		allowed = operationsTools
	default:
		return false
	}
	_, ok := allowed[toolName]
	return ok
}

func ValidateMessage(message string) (string, error) {
	message = strings.TrimSpace(message)
	if message == "" {
		return "", InputError{Message: "Message cannot be empty"}
	}
	if len(message) > MaxMessageLength {
		return "", InputError{Message: "Message is too long"}
	}
	return message, nil
}

func ValidateOutput(output string) string {
	output = strings.TrimSpace(output)
	if output == "" {
		return "I couldn't complete that request."
	}
	if len(output) > MaxResponseLength {
		return output[:MaxResponseLength]
	}
	return output
}

func IsCancelAction(message string) bool {
	text := strings.ToLower(strings.TrimSpace(message))
	if strings.Contains(text, "?") {
		return false
	}
	for _, prefix := range []string{"can ", "could ", "should ", "may ", "what ", "how ", "is ", "do "} {
		if strings.HasPrefix(text, prefix) {
			return false
		}
	}
	return strings.Contains(text, "cancel")
}

func PlanSupport(message string, orderID string) []string {
	text := strings.ToLower(message)
	var tools []string
	if strings.Contains(text, "where") || strings.Contains(text, "status") || strings.Contains(text, "track") || strings.Contains(text, "delivery") || strings.Contains(text, "my order") {
		tools = append(tools, "list_recent_orders")
		if orderID != "" {
			tools = append(tools, "get_order", "get_delivery")
		}
	}
	if strings.Contains(text, "refund") || strings.Contains(text, "money") || strings.Contains(text, "charge") || strings.Contains(text, "payment") || strings.Contains(text, "policy") {
		tools = append(tools, "get_policy")
	}
	if strings.Contains(text, "cancel") && !IsCancelAction(message) {
		tools = append(tools, "get_policy")
	}
	if IsCancelAction(message) {
		tools = append(tools, "cancel_order")
	}
	if strings.Contains(text, "ticket") || strings.Contains(text, "human") || strings.Contains(text, "complaint") || strings.Contains(text, "help") || strings.Contains(text, "support") {
		tools = append(tools, "create_support_ticket")
	}
	if len(tools) == 0 {
		tools = []string{"get_policy"}
	}
	return unique(tools)
}

func PlanOperations(message string) []string {
	text := strings.ToLower(message)
	tools := []string{"get_active_orders", "get_delayed_orders"}
	if strings.Contains(text, "driver") || strings.Contains(text, "dispatch") || strings.Contains(text, "metric") {
		tools = append(tools, "get_driver_metrics")
	}
	if strings.Contains(text, "restaurant") || strings.Contains(text, "load") {
		tools = append(tools, "get_restaurant_load")
	}
	return unique(tools)
}

func unique(tools []string) []string {
	seen := map[string]struct{}{}
	out := make([]string, 0, len(tools))
	for _, tool := range tools {
		if _, ok := seen[tool]; ok {
			continue
		}
		seen[tool] = struct{}{}
		out = append(out, tool)
	}
	return out
}
