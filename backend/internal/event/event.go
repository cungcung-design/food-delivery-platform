package event

import (
	"encoding/json"
	"time"
)

type Type string

const (
	OrderCreated        Type = "ORDER_CREATED"
	OrderConfirmed      Type = "ORDER_CONFIRMED"
	OrderRejected       Type = "ORDER_REJECTED"
	OrderPreparing      Type = "ORDER_PREPARING"
	OrderReady          Type = "ORDER_READY"
	DriverAssigned      Type = "DRIVER_ASSIGNED"
	OrderPickedUp       Type = "ORDER_PICKED_UP"
	OrderOutForDelivery Type = "ORDER_OUT_FOR_DELIVERY"
	OrderDelivered      Type = "ORDER_DELIVERED"
	OrderCancelled      Type = "ORDER_CANCELLED"
)

type Event struct {
	ID          string          `json:"id"`
	Type        Type            `json:"type"`
	Aggregate   string          `json:"aggregate"`
	AggregateID string          `json:"aggregate_id"`
	Payload     json.RawMessage `json:"payload"`
	OccurredAt  time.Time       `json:"occurred_at"`
}

type OrderPayload struct {
	OrderID      string `json:"order_id"`
	UserID       string `json:"user_id"`
	RestaurantID string `json:"restaurant_id,omitempty"`
	OwnerID      string `json:"owner_id,omitempty"`
	DeliveryID   string `json:"delivery_id,omitempty"`
}

func (p OrderPayload) Meta() map[string]string {
	meta := map[string]string{}
	if p.OrderID != "" {
		meta["order_id"] = p.OrderID
	}
	if p.DeliveryID != "" {
		meta["delivery_id"] = p.DeliveryID
	}
	if p.RestaurantID != "" {
		meta["restaurant_id"] = p.RestaurantID
	}
	return meta
}

func ForOrderStatus(status string) (Type, bool) {
	switch status {
	case "CONFIRMED":
		return OrderConfirmed, true
	case "REJECTED":
		return OrderRejected, true
	case "PREPARING":
		return OrderPreparing, true
	case "READY":
		return OrderReady, true
	case "CANCELLED":
		return OrderCancelled, true
	case "DRIVER_ASSIGNED":
		return DriverAssigned, true
	case "PICKED_UP":
		return OrderPickedUp, true
	case "OUT_FOR_DELIVERY":
		return OrderOutForDelivery, true
	case "DELIVERED":
		return OrderDelivered, true
	default:
		return "", false
	}
}
