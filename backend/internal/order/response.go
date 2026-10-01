package order

import (
	db "github.com/cungcung-design/food-delivery-platform/backend/db/generated"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/pgutil"
)

type orderJSON struct {
	ID            string          `json:"id"`
	UserID        string          `json:"user_id"`
	RestaurantID  string          `json:"restaurant_id"`
	AddressID     string          `json:"delivery_address_id"`
	Status        string          `json:"status"`
	PaymentStatus string          `json:"payment_status"`
	Subtotal      string          `json:"subtotal"`
	DeliveryFee   string          `json:"delivery_fee"`
	Discount      string          `json:"discount"`
	Total         string          `json:"total"`
	CreatedAt     string          `json:"created_at"`
	Items         []orderItemJSON `json:"items,omitempty"`
}

type orderItemJSON struct {
	ID         string `json:"id"`
	MenuItemID string `json:"menu_item_id"`
	Name       string `json:"name"`
	Price      string `json:"price"`
	Quantity   int32  `json:"quantity"`
	Subtotal   string `json:"subtotal"`
}

func toOrder(item db.Order, lines []db.OrderItem) orderJSON {
	view := orderJSON{
		ID:            item.ID.String(),
		UserID:        item.UserID.String(),
		RestaurantID:  item.RestaurantID.String(),
		AddressID:     item.DeliveryAddressID.String(),
		Status:        item.Status,
		PaymentStatus: item.PaymentStatus,
		Subtotal:      pgutil.Money(item.Subtotal),
		DeliveryFee:   pgutil.Money(item.DeliveryFee),
		Discount:      pgutil.Money(item.Discount),
		Total:         pgutil.Money(item.Total),
		CreatedAt:     pgutil.Timestamp(item.CreatedAt),
	}

	if lines == nil {
		return view
	}

	view.Items = make([]orderItemJSON, 0, len(lines))
	for _, line := range lines {
		menuItemID := ""
		if line.MenuItemID.Valid {
			menuItemID = line.MenuItemID.String()
		}
		view.Items = append(view.Items, orderItemJSON{
			ID:         line.ID.String(),
			MenuItemID: menuItemID,
			Name:       line.NameSnapshot,
			Price:      pgutil.Money(line.PriceSnapshot),
			Quantity:   line.Quantity,
			Subtotal:   pgutil.Money(line.Subtotal),
		})
	}

	return view
}

func toOrders(items []db.Order) []orderJSON {
	out := make([]orderJSON, 0, len(items))
	for _, item := range items {
		out = append(out, toOrder(item, nil))
	}
	return out
}
