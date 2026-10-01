package consumers

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"

	db "github.com/cungcung-design/food-delivery-platform/backend/db/generated"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/event"
)

type AnalyticsConsumer struct {
	pool    *pgxpool.Pool
	queries *db.Queries
}

func NewAnalyticsConsumer(pool *pgxpool.Pool, queries *db.Queries) *AnalyticsConsumer {
	return &AnalyticsConsumer{pool: pool, queries: queries}
}

func (c *AnalyticsConsumer) HandleOrderDelivered(ctx context.Context, e event.Event) error {
	return event.ConsumeOnce(ctx, c.pool, c.queries, "analytics", e.ID, func(context.Context, *db.Queries) error {
		log.Printf("analytics event=%s order=%s", e.ID, e.AggregateID)
		return nil
	})
}
