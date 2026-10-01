package delivery

import (
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgtype"

	db "github.com/cungcung-design/food-delivery-platform/backend/db/generated"
)

func TestSummarizeEarningsUsesDeliveryFees(t *testing.T) {
	now := time.Date(2026, 10, 2, 10, 0, 0, 0, earningsLocation)
	yesterday := now.Add(-24 * time.Hour)

	summary, err := summarizeEarnings([]db.ListCompletedDeliveriesByDriverRow{
		{DeliveryFee: numeric("5.00"), DeliveredAt: timestamp(now)},
		{DeliveryFee: numeric("5.00"), DeliveredAt: timestamp(yesterday)},
	}, now)
	if err != nil {
		t.Fatal(err)
	}
	if summary.CompletedCount != 2 || summary.Total != "10.00" {
		t.Fatalf("total = %+v", summary)
	}
	if summary.TodayCount != 1 || summary.TodayTotal != "5.00" {
		t.Fatalf("today = %+v", summary)
	}
}

func TestParseCents(t *testing.T) {
	cents, err := parseCents("12.50")
	if err != nil || cents != 1250 {
		t.Fatalf("cents = %d, err = %v", cents, err)
	}
}

func numeric(value string) pgtype.Numeric {
	var amount pgtype.Numeric
	if err := amount.Scan(value); err != nil {
		panic(err)
	}
	return amount
}

func timestamp(value time.Time) pgtype.Timestamptz {
	return pgtype.Timestamptz{Time: value, Valid: true}
}
