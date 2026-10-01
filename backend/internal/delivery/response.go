package delivery

import (
	db "github.com/cungcung-design/food-delivery-platform/backend/db/generated"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/pgutil"
)

type deliveryJSON struct {
	ID           string `json:"id"`
	OrderID      string `json:"order_id"`
	OrderStatus  string `json:"order_status"`
	Status       string `json:"status"`
	RestaurantID string `json:"restaurant_id"`
	Total        string `json:"total"`
}

type completedDeliveryJSON struct {
	ID             string `json:"id"`
	OrderID        string `json:"order_id"`
	Status         string `json:"status"`
	RestaurantName string `json:"restaurant_name"`
	PickupAddress  string `json:"pickup_address"`
	Earning        string `json:"earning"`
	OrderTotal     string `json:"order_total"`
	DeliveredAt    string `json:"delivered_at"`
}

type earningsJSON struct {
	CompletedCount int    `json:"completed_count"`
	Total          string `json:"total"`
	TodayCount     int    `json:"today_count"`
	TodayTotal     string `json:"today_total"`
}

type pointJSON struct {
	Latitude   float64 `json:"latitude"`
	Longitude  float64 `json:"longitude"`
	RecordedAt string  `json:"recorded_at"`
}

type trackingJSON struct {
	OrderID          string      `json:"order_id"`
	OrderStatus      string      `json:"order_status"`
	DeliveryID       string      `json:"delivery_id,omitempty"`
	DeliveryStatus   string      `json:"delivery_status,omitempty"`
	Latitude         *float64    `json:"latitude"`
	Longitude        *float64    `json:"longitude"`
	PickupLatitude   *float64    `json:"pickup_latitude"`
	PickupLongitude  *float64    `json:"pickup_longitude"`
	DropoffLatitude  *float64    `json:"dropoff_latitude"`
	DropoffLongitude *float64    `json:"dropoff_longitude"`
	Points           []pointJSON `json:"points"`
}

func toDelivery(item db.Delivery, order db.Order) deliveryJSON {
	return deliveryJSON{
		ID:           item.ID.String(),
		OrderID:      item.OrderID.String(),
		OrderStatus:  order.Status,
		Status:       item.Status,
		RestaurantID: order.RestaurantID.String(),
		Total:        pgutil.Money(order.Total),
	}
}
