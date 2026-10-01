package event

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"

	db "github.com/cungcung-design/food-delivery-platform/backend/db/generated"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/pgutil"
)

func ConsumeOnce(
	ctx context.Context,
	pool *pgxpool.Pool,
	queries *db.Queries,
	consumerName string,
	eventID string,
	action func(context.Context, *db.Queries) error,
) error {
	id, err := pgutil.ParseUUID(eventID)
	if err != nil {
		return err
	}

	tx, err := pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	qtx := queries.WithTx(tx)
	done, err := qtx.IsEventProcessed(ctx, db.IsEventProcessedParams{
		ConsumerName: consumerName,
		EventID:      id,
	})
	if err != nil {
		return err
	}
	if done {
		return tx.Commit(ctx)
	}

	if err := action(ctx, qtx); err != nil {
		return err
	}

	if err := qtx.MarkEventProcessed(ctx, db.MarkEventProcessedParams{
		ConsumerName: consumerName,
		EventID:      id,
	}); err != nil {
		return err
	}

	return tx.Commit(ctx)
}
