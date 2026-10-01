package pgutil

import (
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

func ParseUUID(value string) (pgtype.UUID, error) {
	parsed, err := uuid.Parse(value)
	if err != nil {
		return pgtype.UUID{}, err
	}

	return pgtype.UUID{Bytes: parsed, Valid: true}, nil
}

func SameUUID(left pgtype.UUID, right pgtype.UUID) bool {
	return left.Valid && right.Valid && left.Bytes == right.Bytes
}

func Text(value *string) pgtype.Text {
	if value == nil {
		return pgtype.Text{}
	}

	return pgtype.Text{String: *value, Valid: true}
}

func TextOut(value pgtype.Text) *string {
	if !value.Valid {
		return nil
	}

	text := value.String
	return &text
}

func Float(value *float64) pgtype.Float8 {
	if value == nil {
		return pgtype.Float8{}
	}

	return pgtype.Float8{Float64: *value, Valid: true}
}

func FloatOut(value pgtype.Float8) *float64 {
	if !value.Valid {
		return nil
	}

	number := value.Float64
	return &number
}

func Money(value pgtype.Numeric) string {
	if !value.Valid {
		return "0.00"
	}

	raw, err := value.Value()
	if err != nil || raw == nil {
		return "0.00"
	}

	text, ok := raw.(string)
	if !ok || text == "" {
		return "0.00"
	}
	if !strings.Contains(text, ".") {
		return text + ".00"
	}

	return text
}

func Timestamp(value pgtype.Timestamptz) string {
	if !value.Valid {
		return ""
	}

	return value.Time.UTC().Format(time.RFC3339)
}
