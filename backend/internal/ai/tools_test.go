package ai

import "testing"

func TestCancelQuestionDoesNotAct(t *testing.T) {
	if IsCancelAction("Can I cancel my order?") {
		t.Fatal("question was treated as a cancellation")
	}
	tools := PlanSupport("Can I cancel my order?", "order-1")
	for _, tool := range tools {
		if tool == "cancel_order" {
			t.Fatal("cancel_order was planned")
		}
	}
}

func TestCancelActionUsesTool(t *testing.T) {
	if !IsCancelAction("Cancel my order.") {
		t.Fatal("action was treated as a question")
	}
	tools := PlanSupport("Cancel my order.", "order-1")
	found := false
	for _, tool := range tools {
		if tool == "cancel_order" {
			found = true
		}
	}
	if !found {
		t.Fatal("cancel_order was not planned")
	}
}

func TestSupportCannotUseOperationsTools(t *testing.T) {
	if ValidateTool("support", "get_active_orders") || ValidateTool("operations", "cancel_order") {
		t.Fatal("allowlist accepted a foreign tool")
	}
}

func TestMessageLimits(t *testing.T) {
	if _, err := ValidateMessage("  "); err == nil {
		t.Fatal("empty message accepted")
	}
	if _, err := ValidateMessage(string(make([]byte, MaxMessageLength+1))); err == nil {
		t.Fatal("long message accepted")
	}
	if ValidateOutput("") != "I couldn't complete that request." {
		t.Fatal("empty output was kept")
	}
}
