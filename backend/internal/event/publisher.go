package event

import (
	"context"
	"encoding/json"

	"github.com/jackc/pgx/v5/pgtype"

	db "github.com/cungcung-design/food-delivery-platform/backend/db/generated"
)

func PublishTx(ctx context.Context, queries *db.Queries, eventType Type, aggregateID pgtype.UUID, payload any) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	_, err = queries.CreateOutboxEvent(ctx, db.CreateOutboxEventParams{
		EventType:     string(eventType),
		AggregateType: "order",
		AggregateID:   aggregateID,
		Payload:       data,
	})
	return err
}
