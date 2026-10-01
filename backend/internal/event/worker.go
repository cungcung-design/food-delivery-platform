package event

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgtype"

	db "github.com/cungcung-design/food-delivery-platform/backend/db/generated"
)

const maxAttempts int32 = 5

type Worker struct {
	queries *db.Queries
	router  *Router
}

func NewWorker(queries *db.Queries, router *Router) *Worker {
	return &Worker{queries: queries, router: router}
}

func (w *Worker) Run(ctx context.Context) {
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			w.processBatch(ctx)
		}
	}
}

func (w *Worker) processBatch(ctx context.Context) {
	if err := w.queries.RecoverStaleOutboxEvents(ctx); err != nil {
		log.Println("outbox recover:", err)
	}

	events, err := w.queries.GetPendingOutboxEvents(ctx, 50)
	if err != nil {
		log.Println("outbox query:", err)
		return
	}

	for _, item := range events {
		w.processOne(ctx, item)
	}
}

func (w *Worker) processOne(ctx context.Context, item db.OutboxEvent) {
	rows, err := w.queries.MarkOutboxProcessing(ctx, item.ID)
	if err != nil || rows == 0 {
		return
	}

	occurred := time.Now().UTC()
	if item.CreatedAt.Valid {
		occurred = item.CreatedAt.Time
	}

	payload := json.RawMessage(item.Payload)
	if len(payload) == 0 {
		payload = json.RawMessage(`{}`)
	}

	err = w.router.Publish(ctx, Event{
		ID:          item.ID.String(),
		Type:        Type(item.EventType),
		Aggregate:   item.AggregateType,
		AggregateID: item.AggregateID.String(),
		Payload:     payload,
		OccurredAt:  occurred,
	})
	if err != nil {
		w.fail(ctx, item, err)
		return
	}

	if err := w.queries.MarkOutboxProcessed(ctx, item.ID); err != nil {
		log.Println("outbox processed:", err)
	}
}

func (w *Worker) fail(ctx context.Context, item db.OutboxEvent, cause error) {
	attempts := item.Attempts + 1
	message := cause.Error()
	if len(message) > 500 {
		message = message[:500]
	}
	lastError := pgtype.Text{String: message, Valid: true}

	if attempts >= maxAttempts {
		if err := w.queries.MarkOutboxFailed(ctx, db.MarkOutboxFailedParams{
			ID:        item.ID,
			LastError: lastError,
		}); err != nil {
			log.Println("outbox failed:", err)
		}
		return
	}

	delay := time.Duration(attempts*attempts) * time.Second
	log.Printf("outbox retry id=%s attempts=%d err=%s", item.ID.String(), attempts, message)
	if err := w.queries.RetryOutboxEvent(ctx, db.RetryOutboxEventParams{
		ID:          item.ID,
		AvailableAt: pgtype.Timestamptz{Time: time.Now().Add(delay), Valid: true},
		LastError:   lastError,
	}); err != nil {
		log.Println("outbox retry:", err)
	}
}
