package operations

import (
	"context"
	"fmt"
	"strings"
	"time"

	db "github.com/cungcung-design/food-delivery-platform/backend/db/generated"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/ai"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/pgutil"
)

type Issue struct {
	OrderID    string `json:"order_id"`
	Restaurant string `json:"restaurant"`
	Status     string `json:"status"`
	Delivery   string `json:"delivery_status,omitempty"`
	Reason     string `json:"reason"`
}

type Recommendation struct {
	ID         string   `json:"id"`
	OrderID    string   `json:"order_id"`
	DriverID   string   `json:"driver_id,omitempty"`
	Reason     string   `json:"reason"`
	DistanceKM *float64 `json:"distance_km,omitempty"`
	CreatedAt  string   `json:"created_at"`
}

type Trace struct {
	Name   string `json:"name"`
	OK     bool   `json:"ok"`
	Detail string `json:"detail"`
}

type Report struct {
	Reply           string           `json:"reply"`
	Tools           []Trace          `json:"tools"`
	Issues          []Issue          `json:"issues"`
	Recommendations []Recommendation `json:"recommendations,omitempty"`
}

type Service struct {
	queries *db.Queries
	client  *ai.Client
	logs    *ai.Logger
}

func NewService(queries *db.Queries, client *ai.Client, logs *ai.Logger) *Service {
	return &Service{queries: queries, client: client, logs: logs}
}

func (s *Service) Ask(ctx context.Context, userID string, message string) (Report, error) {
	message, err := ai.ValidateMessage(message)
	if err != nil {
		return Report{}, err
	}
	requestID := ai.NewRequestID()
	started := time.Now()
	tools := ai.PlanOperations(message)
	if s.client != nil {
		plan, planErr := s.client.Plan(ctx, ai.PlanRequest{Agent: "operations", Message: message})
		if planErr != nil {
			s.logs.Record(ctx, userID, "OPERATIONS", requestID, "", false, time.Since(started), "ai unavailable")
		} else if len(plan.Tools) > 0 {
			tools = plan.Tools
		}
	}

	report := Report{Issues: []Issue{}}
	for _, name := range tools {
		toolStarted := time.Now()
		if !ai.ValidateTool("operations", name) {
			s.logs.Record(ctx, userID, "OPERATIONS", requestID, name, false, time.Since(toolStarted), "Tool is not allowed for this agent")
			continue
		}
		trace, err := s.run(ctx, name, &report)
		if err != nil {
			return Report{}, err
		}
		s.logs.Record(ctx, userID, "OPERATIONS", requestID, name, trace.OK, time.Since(toolStarted), "")
		report.Tools = append(report.Tools, trace)
	}
	parts := make([]string, 0, len(report.Tools)+len(report.Issues))
	for _, tool := range report.Tools {
		parts = append(parts, tool.Detail)
	}
	for _, issue := range report.Issues {
		parts = append(parts, issue.Restaurant+": "+issue.Reason)
	}
	report.Reply = ai.ValidateOutput(strings.Join(parts, " "))
	return report, nil
}

func (s *Service) run(ctx context.Context, name string, report *Report) (Trace, error) {
	switch name {
	case "get_active_orders":
		rows, err := s.queries.ListOpenOrders(ctx)
		if err != nil {
			return Trace{}, err
		}
		return Trace{Name: name, OK: true, Detail: fmt.Sprintf("%d active order(s).", len(rows))}, nil
	case "get_delayed_orders":
		issues, err := s.issues(ctx)
		if err != nil {
			return Trace{}, err
		}
		report.Issues = issues
		detail := "No orders need attention."
		if len(issues) > 0 {
			detail = fmt.Sprintf("%d order(s) need attention.", len(issues))
		}
		return Trace{Name: name, OK: true, Detail: detail}, nil
	case "get_restaurant_load":
		rows, err := s.queries.ListOpenOrders(ctx)
		if err != nil {
			return Trace{}, err
		}
		counts := map[string]int{}
		for _, row := range rows {
			counts[row.RestaurantName]++
		}
		return Trace{Name: name, OK: true, Detail: fmt.Sprintf("%d restaurant(s) have active orders.", len(counts))}, nil
	case "get_driver_metrics":
		drivers, err := s.queries.ListAvailableDriversForDispatch(ctx)
		if err != nil {
			return Trace{}, err
		}
		recommendations, err := s.recommendations(ctx)
		if err != nil {
			return Trace{}, err
		}
		report.Recommendations = recommendations
		return Trace{Name: name, OK: true, Detail: fmt.Sprintf("%d available driver(s). %d dispatch suggestion(s) on record.", len(drivers), len(recommendations))}, nil
	default:
		return Trace{Name: name, Detail: "That action is not available."}, nil
	}
}

func (s *Service) issues(ctx context.Context) ([]Issue, error) {
	rows, err := s.queries.ListOpenOrders(ctx)
	if err != nil {
		return nil, err
	}
	now := time.Now()
	out := make([]Issue, 0)
	for _, row := range rows {
		if !row.UpdatedAt.Valid {
			continue
		}
		age := now.Sub(row.UpdatedAt.Time)
		delivery := ""
		if row.DeliveryStatus.Valid {
			delivery = row.DeliveryStatus.String
		}
		reason := ""
		switch {
		case row.Status == "PENDING" && age > 10*time.Minute:
			reason = "Still pending after 10 minutes."
		case row.Status == "READY" && (delivery == "" || delivery == "UNASSIGNED") && age > 5*time.Minute:
			reason = "Ready for a driver, but nobody has accepted."
		case row.Status == "OUT_FOR_DELIVERY" && age > 30*time.Minute:
			reason = "Out for delivery for more than 30 minutes."
		}
		if reason == "" {
			continue
		}
		out = append(out, Issue{
			OrderID:    row.ID.String(),
			Restaurant: row.RestaurantName,
			Status:     row.Status,
			Delivery:   delivery,
			Reason:     reason,
		})
	}
	return out, nil
}

func (s *Service) recommendations(ctx context.Context) ([]Recommendation, error) {
	rows, err := s.queries.ListDispatchRecommendations(ctx)
	if err != nil {
		return nil, err
	}
	out := make([]Recommendation, 0, len(rows))
	for _, row := range rows {
		item := Recommendation{
			ID:        row.ID.String(),
			OrderID:   row.OrderID.String(),
			Reason:    row.Reason,
			CreatedAt: pgutil.Timestamp(row.CreatedAt),
		}
		if row.DriverID.Valid {
			item.DriverID = row.DriverID.String()
		}
		if row.DistanceKm.Valid {
			distance := row.DistanceKm.Float64
			item.DistanceKM = &distance
		}
		out = append(out, item)
	}
	return out, nil
}
