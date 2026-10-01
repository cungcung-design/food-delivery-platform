package cart

import (
	db "github.com/cungcung-design/food-delivery-platform/backend/db/generated"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/pgutil"
)

type cartItemJSON struct {
	ID          string `json:"id"`
	MenuItemID  string `json:"menu_item_id"`
	Name        string `json:"name"`
	Price       string `json:"price"`
	Quantity    int32  `json:"quantity"`
	LineTotal   string `json:"line_total"`
	IsAvailable bool   `json:"is_available"`
}

type cartJSON struct {
	ID             string         `json:"id,omitempty"`
	RestaurantID   string         `json:"restaurant_id,omitempty"`
	RestaurantName string         `json:"restaurant_name,omitempty"`
	Items          []cartItemJSON `json:"items"`
	Subtotal       string         `json:"subtotal"`
	DeliveryFee    string         `json:"delivery_fee"`
	Discount       string         `json:"discount"`
	Total          string         `json:"total"`
}

type addressJSON struct {
	ID          string   `json:"id"`
	Label       string   `json:"label"`
	AddressLine string   `json:"address_line"`
	City        string   `json:"city"`
	PostalCode  *string  `json:"postal_code"`
	Latitude    *float64 `json:"latitude"`
	Longitude   *float64 `json:"longitude"`
}

func emptyCart() cartJSON {
	return cartJSON{
		Items:       []cartItemJSON{},
		Subtotal:    "0.00",
		DeliveryFee: "0.00",
		Discount:    "0.00",
		Total:       "0.00",
	}
}

func toAddress(item db.Address) addressJSON {
	return addressJSON{
		ID:          item.ID.String(),
		Label:       item.Label,
		AddressLine: item.AddressLine,
		City:        item.City,
		PostalCode:  pgutil.TextOut(item.PostalCode),
		Latitude:    pgutil.FloatOut(item.Latitude),
		Longitude:   pgutil.FloatOut(item.Longitude),
	}
}

func toAddresses(items []db.Address) []addressJSON {
	out := make([]addressJSON, 0, len(items))
	for _, item := range items {
		out = append(out, toAddress(item))
	}
	return out
}
