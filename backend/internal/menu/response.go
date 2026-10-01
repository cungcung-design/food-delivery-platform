package menu

import (
	"github.com/jackc/pgx/v5/pgtype"

	db "github.com/cungcung-design/food-delivery-platform/backend/db/generated"
)

type categoryJSON struct {
	ID           string `json:"id"`
	RestaurantID string `json:"restaurant_id"`
	Name         string `json:"name"`
}

type itemJSON struct {
	ID           string  `json:"id"`
	RestaurantID string  `json:"restaurant_id"`
	CategoryID   *string `json:"category_id"`
	Name         string  `json:"name"`
	Description  *string `json:"description"`
	Price        string  `json:"price"`
	ImageURL     *string `json:"image_url"`
	IsAvailable  bool    `json:"is_available"`
}

func toCategory(item db.MenuCategory) categoryJSON {
	return categoryJSON{
		ID:           item.ID.String(),
		RestaurantID: item.RestaurantID.String(),
		Name:         item.Name,
	}
}

func toCategories(items []db.MenuCategory) []categoryJSON {
	out := make([]categoryJSON, 0, len(items))
	for _, item := range items {
		out = append(out, toCategory(item))
	}
	return out
}

func toItem(item db.MenuItem) itemJSON {
	return itemJSON{
		ID:           item.ID.String(),
		RestaurantID: item.RestaurantID.String(),
		CategoryID:   uuidPtr(item.CategoryID),
		Name:         item.Name,
		Description:  textPtr(item.Description),
		Price:        numericString(item.Price),
		ImageURL:     textPtr(item.ImageUrl),
		IsAvailable:  item.IsAvailable,
	}
}

func toItems(items []db.MenuItem) []itemJSON {
	out := make([]itemJSON, 0, len(items))
	for _, item := range items {
		out = append(out, toItem(item))
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

func uuidPtr(value pgtype.UUID) *string {
	if !value.Valid {
		return nil
	}

	text := value.String()
	return &text
}

func numericString(value pgtype.Numeric) string {
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

	return text
}
