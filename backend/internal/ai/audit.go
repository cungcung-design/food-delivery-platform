package ai

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"

	db "github.com/cungcung-design/food-delivery-platform/backend/db/generated"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/pgutil"
)

type Logger struct {
	queries *db.Queries
}

func NewLogger(queries *db.Queries) *Logger {
	return &Logger{queries: queries}
}

func NewRequestID() string {
	return uuid.NewString()
}

func (l *Logger) Record(ctx context.Context, userID string, agent string, requestID string, toolName string, success bool, latency time.Duration, errorMessage string) {
	if l == nil || l.queries == nil {
		return
	}
	var user pgtype.UUID
	if userID != "" {
		if parsed, err := pgutil.ParseUUID(userID); err == nil {
			user = parsed
		}
	}
	latencyMS := latency.Milliseconds()
	_ = l.queries.CreateAIRequestLog(ctx, db.CreateAIRequestLogParams{
		UserID:       user,
		AgentType:    agent,
		RequestID:    textOrEmpty(requestID),
		ToolName:     textOrEmpty(toolName),
		ToolSuccess:  pgtype.Bool{Bool: success, Valid: true},
		LatencyMs:    pgtype.Int8{Int64: latencyMS, Valid: true},
		ErrorMessage: textOrEmpty(errorMessage),
	})
}

func textOrEmpty(value string) pgtype.Text {
	if value == "" {
		return pgtype.Text{}
	}
	return pgtype.Text{String: value, Valid: true}
}
