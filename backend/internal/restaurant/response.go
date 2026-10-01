package restaurant

import (
	"github.com/jackc/pgx/v5/pgtype"

	db "github.com/cungcung-design/food-delivery-platform/backend/db/generated"
)

type restaurantJSON struct {
	ID          string   `json:"id"`
	OwnerID     string   `json:"owner_id"`
	Name        string   `json:"name"`
	Description *string  `json:"description"`
	AddressLine string   `json:"address_line"`
	City        string   `json:"city"`
	Latitude    *float64 `json:"latitude"`
	Longitude   *float64 `json:"longitude"`
	ImageURL    *string  `json:"image_url"`
	Status      string   `json:"status"`
}

func toRestaurant(item db.Restaurant) restaurantJSON {
	return restaurantJSON{
		ID:          item.ID.String(),
		OwnerID:     item.OwnerID.String(),
		Name:        item.Name,
		Description: textPtr(item.Description),
		AddressLine: item.AddressLine,
		City:        item.City,
		Latitude:    floatPtr(item.Latitude),
		Longitude:   floatPtr(item.Longitude),
		ImageURL:    textPtr(item.ImageUrl),
		Status:      item.Status,
	}
}

func toRestaurants(items []db.Restaurant) []restaurantJSON {
	out := make([]restaurantJSON, 0, len(items))
	for _, item := range items {
		out = append(out, toRestaurant(item))
	}
	return out
}

func textPtr(value pgtype.Text) *string {
	if !value.Valid {
		return nil
	}

	text := value.String
	return &text
}

func floatPtr(value pgtype.Float8) *float64 {
	if !value.Valid {
		return nil
	}

	number := value.Float64
	return &number
}
