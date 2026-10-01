package delivery

import (
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgtype"

	db "github.com/cungcung-design/food-delivery-platform/backend/db/generated"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/pgutil"
)

// Driver pay is the delivery fee stored on each completed order.
var earningsLocation = loadEarningsLocation()

func loadEarningsLocation() *time.Location {
	location, err := time.LoadLocation("Asia/Kuala_Lumpur")
	if err != nil {
		return time.UTC
	}
	return location
}

func summarizeEarnings(rows []db.ListCompletedDeliveriesByDriverRow, now time.Time) (earningsJSON, error) {
	summary := earningsJSON{
		Total:      "0.00",
		TodayTotal: "0.00",
	}
	today := now.In(earningsLocation)

	var totalCents int64
	var todayCents int64
	for _, row := range rows {
		cents, err := moneyCents(row.DeliveryFee)
		if err != nil {
			return earningsJSON{}, err
		}
		totalCents += cents
		summary.CompletedCount++

		if row.DeliveredAt.Valid && sameDay(row.DeliveredAt.Time, today) {
			todayCents += cents
			summary.TodayCount++
		}
	}

	summary.Total = formatCents(totalCents)
	summary.TodayTotal = formatCents(todayCents)
	return summary, nil
}

func sameDay(left time.Time, right time.Time) bool {
	left = left.In(earningsLocation)
	right = right.In(earningsLocation)
	return left.Year() == right.Year() && left.Month() == right.Month() && left.Day() == right.Day()
}

func moneyCents(value pgtype.Numeric) (int64, error) {
	return parseCents(pgutil.Money(value))
}

func parseCents(text string) (int64, error) {
	text = strings.TrimSpace(text)
	if text == "" {
		return 0, nil
	}

	negative := strings.HasPrefix(text, "-")
	text = strings.TrimPrefix(text, "-")
	parts := strings.SplitN(text, ".", 2)
	whole, err := strconv.ParseInt(parts[0], 10, 64)
	if err != nil {
		return 0, err
	}

	frac := "00"
	if len(parts) == 2 {
		frac = parts[1]
		if len(frac) == 1 {
			frac += "0"
		}
		if len(frac) > 2 {
			frac = frac[:2]
		}
	}
	minor, err := strconv.ParseInt(frac, 10, 64)
	if err != nil {
		return 0, err
	}

	cents := whole*100 + minor
	if negative {
		cents = -cents
	}
	return cents, nil
}

func formatCents(cents int64) string {
	sign := ""
	if cents < 0 {
		sign = "-"
		cents = -cents
	}
	return sign + strconv.FormatInt(cents/100, 10) + "." + twoDigits(cents%100)
}

func twoDigits(value int64) string {
	if value < 10 {
		return "0" + strconv.FormatInt(value, 10)
	}
	return strconv.FormatInt(value, 10)
}
