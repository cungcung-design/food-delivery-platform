package support

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgtype"

	db "github.com/cungcung-design/food-delivery-platform/backend/db/generated"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/ai"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/order"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/pgutil"
)

const refundPolicy = "You can cancel an order while it is pending or confirmed. Payment is not captured in this phase, so a cancelled or rejected order is not charged. Delivered orders are not refunded automatically. Open a support ticket and the restaurant can review it."

type Trace struct {
	Name   string `json:"name"`
	OK     bool   `json:"ok"`
	Detail string `json:"detail"`
}

type Reply struct {
	Reply   string  `json:"reply"`
	Tools   []Trace `json:"tools"`
	OrderID string  `json:"order_id,omitempty"`
}

type Ticket struct {
	ID        string `json:"id"`
	OrderID   string `json:"order_id,omitempty"`
	Subject   string `json:"subject"`
	Message   string `json:"message"`
	Status    string `json:"status"`
	CreatedAt string `json:"created_at"`
}

type Service struct {
	queries *db.Queries
	orders  *order.Service
	client  *ai.Client
	logs    *ai.Logger
}

func NewService(queries *db.Queries, orders *order.Service, client *ai.Client, logs *ai.Logger) *Service {
	return &Service{queries: queries, orders: orders, client: client, logs: logs}
}

func (s *Service) Ask(ctx context.Context, userID string, role string, message string, orderID string) (Reply, error) {
	message, err := ai.ValidateMessage(message)
	if err != nil {
		return Reply{}, err
	}

	requestID := ai.NewRequestID()
	started := time.Now()
	tools := ai.PlanSupport(message, orderID)
	if s.client != nil {
		plan, planErr := s.client.Plan(ctx, ai.PlanRequest{
			Agent:   "support",
			Message: message,
			OrderID: orderID,
		})
		if planErr != nil {
			s.logs.Record(ctx, userID, "SUPPORT", requestID, "", false, time.Since(started), "ai unavailable")
		} else if len(plan.Tools) > 0 {
			tools = plan.Tools
		}
	}

	reply := Reply{OrderID: orderID}
	for _, name := range tools {
		toolStarted := time.Now()
		if !ai.ValidateTool("support", name) {
			s.logs.Record(ctx, userID, "SUPPORT", requestID, name, false, time.Since(toolStarted), "Tool is not allowed for this agent")
			continue
		}
		if name == "cancel_order" && !ai.IsCancelAction(message) {
			s.logs.Record(ctx, userID, "SUPPORT", requestID, name, false, time.Since(toolStarted), "informational cancel request")
			continue
		}
		trace := s.run(ctx, userID, role, name, message, orderID)
		errorMessage := ""
		if !trace.OK {
			errorMessage = "tool failed"
		}
		s.logs.Record(ctx, userID, "SUPPORT", requestID, name, trace.OK, time.Since(toolStarted), errorMessage)
		reply.Tools = append(reply.Tools, trace)
		if !trace.OK && name == "get_order" && strings.Contains(trace.Detail, "can't access") {
			break
		}
	}
	if len(reply.Tools) == 0 {
		reply.Tools = append(reply.Tools, Trace{Name: "get_policy", OK: true, Detail: refundPolicy})
	}
	reply.Reply = ai.ValidateOutput(explain(reply.Tools))
	return reply, nil
}

func (s *Service) ListTickets(ctx context.Context, userID string) ([]Ticket, error) {
	userUUID, err := pgutil.ParseUUID(userID)
	if err != nil {
		return nil, err
	}
	items, err := s.queries.ListSupportTicketsByUser(ctx, userUUID)
	if err != nil {
		return nil, err
	}
	out := make([]Ticket, 0, len(items))
	for _, item := range items {
		view := Ticket{
			ID:        item.ID.String(),
			Subject:   item.Subject,
			Message:   item.Message,
			Status:    item.Status,
			CreatedAt: pgutil.Timestamp(item.CreatedAt),
		}
		if item.OrderID.Valid {
			view.OrderID = item.OrderID.String()
		}
		out = append(out, view)
	}
	return out, nil
}

func (s *Service) run(ctx context.Context, userID string, role string, name string, message string, orderID string) Trace {
	switch name {
	case "get_policy":
		return Trace{Name: name, OK: true, Detail: refundPolicy}
	case "list_recent_orders":
		return s.recentOrders(ctx, userID)
	case "get_order":
		return s.orderStatus(ctx, userID, role, orderID)
	case "get_delivery":
		return s.deliveryStatus(ctx, userID, role, orderID)
	case "cancel_order":
		return s.cancel(ctx, userID, role, orderID)
	case "create_support_ticket":
		return s.ticket(ctx, userID, orderID, message)
	default:
		return Trace{Name: name, Detail: "That action is not available."}
	}
}

func (s *Service) recentOrders(ctx context.Context, userID string) Trace {
	items, err := s.orders.ListMine(ctx, userID)
	if err != nil {
		return Trace{Name: "list_recent_orders", Detail: "I could not load your orders."}
	}
	if len(items) == 0 {
		return Trace{Name: "list_recent_orders", OK: true, Detail: "You have no recent orders."}
	}
	return Trace{Name: "list_recent_orders", OK: true, Detail: "You have " + itoa(len(items)) + " recent orders. The latest status is " + items[0].Status + "."}
}

func (s *Service) orderStatus(ctx context.Context, userID string, role string, orderID string) Trace {
	if orderID == "" {
		return Trace{Name: "get_order", Detail: "Which order should I look up? Open support from the order page."}
	}
	item, _, err := s.orders.Get(ctx, orderID, userID, role)
	if err != nil {
		return Trace{Name: "get_order", Detail: accessDetail(err)}
	}
	return Trace{Name: "get_order", OK: true, Detail: "Order status is " + item.Status + ". Total RM " + pgutil.Money(item.Total) + "."}
}

func (s *Service) deliveryStatus(ctx context.Context, userID string, role string, orderID string) Trace {
	if orderID == "" {
		return Trace{Name: "get_delivery", Detail: "A delivery lookup needs an order."}
	}
	if _, _, err := s.orders.Get(ctx, orderID, userID, role); err != nil {
		return Trace{Name: "get_delivery", Detail: accessDetail(err)}
	}
	id, err := pgutil.ParseUUID(orderID)
	if err != nil {
		return Trace{Name: "get_delivery", Detail: "That order was not found."}
	}
	current, err := s.queries.GetDeliveryByOrderID(ctx, id)
	if err != nil {
		return Trace{Name: "get_delivery", Detail: "No delivery is attached to this order yet."}
	}
	return Trace{Name: "get_delivery", OK: true, Detail: "Delivery status is " + current.Status + "."}
}

func (s *Service) cancel(ctx context.Context, userID string, role string, orderID string) Trace {
	if orderID == "" {
		return Trace{Name: "cancel_order", Detail: "Tell me which order to cancel."}
	}
	updated, err := s.orders.Transition(ctx, orderID, userID, role, "CANCELLED")
	if err != nil {
		if errors.Is(err, order.ErrForbidden) {
			return Trace{Name: "cancel_order", Detail: "I can't access that order."}
		}
		return Trace{Name: "cancel_order", Detail: "This order can no longer be cancelled. The order state was not changed."}
	}
	return Trace{Name: "cancel_order", OK: true, Detail: "The order is now " + updated.Status + "."}
}

func (s *Service) ticket(ctx context.Context, userID string, orderID string, message string) Trace {
	userUUID, err := pgutil.ParseUUID(userID)
	if err != nil {
		return Trace{Name: "create_support_ticket", Detail: "I could not open a ticket."}
	}
	var orderUUID pgtype.UUID
	if orderID != "" {
		if _, _, err := s.orders.Get(ctx, orderID, userID, "CUSTOMER"); err != nil {
			return Trace{Name: "create_support_ticket", Detail: accessDetail(err)}
		}
		orderUUID, err = pgutil.ParseUUID(orderID)
		if err != nil {
			return Trace{Name: "create_support_ticket", Detail: "That order was not found."}
		}
	}
	subject := message
	if len(subject) > 80 {
		subject = subject[:80]
	}
	created, err := s.queries.CreateSupportTicket(ctx, db.CreateSupportTicketParams{
		UserID:  userUUID,
		OrderID: orderUUID,
		Subject: subject,
		Message: message,
	})
	if err != nil {
		return Trace{Name: "create_support_ticket", Detail: "I could not open a ticket."}
	}
	return Trace{Name: "create_support_ticket", OK: true, Detail: "Support ticket " + created.ID.String() + " is open."}
}

func accessDetail(err error) string {
	if errors.Is(err, order.ErrForbidden) {
		return "I can't access that order."
	}
	if errors.Is(err, order.ErrNotFound) {
		return "That order was not found."
	}
	return "I could not load that order."
}

func explain(tools []Trace) string {
	if len(tools) == 0 {
		return "I can check an order, explain the refund policy, cancel a pending order, or open a support ticket."
	}
	parts := make([]string, 0, len(tools))
	for _, tool := range tools {
		if tool.Detail != "" {
			parts = append(parts, tool.Detail)
		}
	}
	return strings.Join(parts, " ")
}

func itoa(value int) string {
	if value == 0 {
		return "0"
	}
	digits := ""
	for value > 0 {
		digits = string(rune('0'+value%10)) + digits
		value /= 10
	}
	return digits
}
