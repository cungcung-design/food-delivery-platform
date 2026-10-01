package consumers

import (
	"context"
	"encoding/json"

	"github.com/jackc/pgx/v5/pgxpool"

	db "github.com/cungcung-design/food-delivery-platform/backend/db/generated"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/dispatch"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/event"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/notification"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/pgutil"
)

type DispatchConsumer struct {
	pool    *pgxpool.Pool
	queries *db.Queries
	service *dispatch.Service
}

func NewDispatchConsumer(pool *pgxpool.Pool, queries *db.Queries, service *dispatch.Service) *DispatchConsumer {
	return &DispatchConsumer{pool: pool, queries: queries, service: service}
}

func (c *DispatchConsumer) HandleOrderReady(ctx context.Context, e event.Event) error {
	return event.ConsumeOnce(ctx, c.pool, c.queries, "dispatch", e.ID, func(ctx context.Context, q *db.Queries) error {
		var payload event.OrderPayload
		if err := json.Unmarshal(e.Payload, &payload); err != nil {
			return err
		}
		if err := c.service.Dispatch(ctx, payload.OrderID); err != nil {
			return err
		}
		suggestion, err := c.service.Recommend(ctx, q, payload.OrderID)
		if err != nil || suggestion.DriverUserID == "" {
			return err
		}
		userID, err := pgutil.ParseUUID(suggestion.DriverUserID)
		if err != nil {
			return err
		}
		data, err := json.Marshal(map[string]string{"order_id": payload.OrderID})
		if err != nil {
			return err
		}
		_, err = notification.Insert(ctx, q, notification.CreateInput{
			UserID:  userID,
			Type:    notification.TypeDispatchSuggested,
			Title:   "Nearby order ready",
			Message: suggestion.Reason,
			Data:    data,
		})
		return err
	})
}
