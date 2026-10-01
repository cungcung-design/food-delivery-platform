package consumers

import (
	"context"
	"encoding/json"

	"github.com/jackc/pgx/v5/pgxpool"

	db "github.com/cungcung-design/food-delivery-platform/backend/db/generated"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/event"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/notification"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/pgutil"
)

type NotificationConsumer struct {
	pool    *pgxpool.Pool
	queries *db.Queries
}

func NewNotificationConsumer(pool *pgxpool.Pool, queries *db.Queries) *NotificationConsumer {
	return &NotificationConsumer{pool: pool, queries: queries}
}

func (c *NotificationConsumer) HandleOrderCreated(ctx context.Context, e event.Event) error {
	return c.deliver(ctx, e, notice{
		recipient: "owner",
		kind:      notification.TypeNewOrder,
		title:     "New order received",
		message:   "A customer placed a new order.",
	})
}

func (c *NotificationConsumer) HandleOrderConfirmed(ctx context.Context, e event.Event) error {
	return c.deliver(ctx, e, notice{
		recipient: "customer",
		kind:      notification.TypeOrderConfirmed,
		title:     "Order confirmed",
		message:   "The restaurant accepted your order.",
	})
}

func (c *NotificationConsumer) HandleOrderRejected(ctx context.Context, e event.Event) error {
	return c.deliver(ctx, e, notice{
		recipient: "customer",
		kind:      notification.TypeOrderRejected,
		title:     "Order rejected",
		message:   "The restaurant could not accept your order.",
	})
}

func (c *NotificationConsumer) HandleOrderPreparing(ctx context.Context, e event.Event) error {
	return c.deliver(ctx, e, notice{
		recipient: "customer",
		kind:      notification.TypeOrderPreparing,
		title:     "Order is being prepared",
		message:   "The restaurant is preparing your order.",
	})
}

func (c *NotificationConsumer) HandleOrderReady(ctx context.Context, e event.Event) error {
	return c.deliver(ctx, e, notice{
		recipient: "owner",
		kind:      notification.TypeOrderReady,
		title:     "Order ready for pickup",
		message:   "An order is ready for a driver.",
	})
}

func (c *NotificationConsumer) HandleDriverAssigned(ctx context.Context, e event.Event) error {
	return c.deliver(ctx, e, notice{
		recipient: "customer",
		kind:      notification.TypeDriverAssigned,
		title:     "Driver assigned",
		message:   "A driver has been assigned to your order.",
	})
}

func (c *NotificationConsumer) HandleOrderPickedUp(ctx context.Context, e event.Event) error {
	return c.deliver(ctx, e, notice{
		recipient: "customer",
		kind:      notification.TypeOrderPickedUp,
		title:     "Order picked up",
		message:   "Your driver picked up your order.",
	})
}

func (c *NotificationConsumer) HandleOutForDelivery(ctx context.Context, e event.Event) error {
	return c.deliver(ctx, e, notice{
		recipient: "customer",
		kind:      notification.TypeOutForDelivery,
		title:     "Order on the way",
		message:   "Your driver is on the way with your order.",
	})
}

func (c *NotificationConsumer) HandleOrderDelivered(ctx context.Context, e event.Event) error {
	return c.deliver(ctx, e, notice{
		recipient: "customer",
		kind:      notification.TypeOrderDelivered,
		title:     "Order delivered",
		message:   "Your order has been delivered.",
	})
}

func (c *NotificationConsumer) HandleOrderCancelled(ctx context.Context, e event.Event) error {
	return c.deliver(ctx, e, notice{
		recipient: "owner",
		kind:      notification.TypeOrderCancelled,
		title:     "Order cancelled",
		message:   "A customer cancelled an order.",
	})
}

type notice struct {
	recipient string
	kind      notification.Type
	title     string
	message   string
}

func (c *NotificationConsumer) deliver(ctx context.Context, e event.Event, spec notice) error {
	return event.ConsumeOnce(ctx, c.pool, c.queries, "notification", e.ID, func(ctx context.Context, q *db.Queries) error {
		var payload event.OrderPayload
		if err := json.Unmarshal(e.Payload, &payload); err != nil {
			return err
		}

		recipient := payload.UserID
		if spec.recipient == "owner" {
			recipient = payload.OwnerID
		}

		userID, err := pgutil.ParseUUID(recipient)
		if err != nil {
			return err
		}

		data, err := json.Marshal(payload.Meta())
		if err != nil {
			return err
		}

		_, err = notification.Insert(ctx, q, notification.CreateInput{
			UserID:  userID,
			Type:    spec.kind,
			Title:   spec.title,
			Message: spec.message,
			Data:    data,
		})
		return err
	})
}
