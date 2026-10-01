package order

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	db "github.com/cungcung-design/food-delivery-platform/backend/db/generated"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/event"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/pgutil"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/tracking"
)

var (
	ErrNotFound  = errors.New("order not found")
	ErrForbidden = errors.New("order access denied")
	ErrInvalid   = errors.New("invalid order transition")
)

type Service struct {
	queries *db.Queries
	pool    *pgxpool.Pool
	hub     *tracking.Hub
	publish func(ctx context.Context, orderID string)
}

func NewService(queries *db.Queries, pool *pgxpool.Pool, hub *tracking.Hub) *Service {
	return &Service{queries: queries, pool: pool, hub: hub}
}

func (s *Service) SetPublisher(publish func(ctx context.Context, orderID string)) {
	s.publish = publish
}

func (s *Service) Checkout(ctx context.Context, userID string, addressID string) (db.Order, error) {
	userUUID, err := pgutil.ParseUUID(userID)
	if err != nil {
		return db.Order{}, ErrInvalid
	}

	addressUUID, err := pgutil.ParseUUID(addressID)
	if err != nil {
		return db.Order{}, ErrInvalid
	}

	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return db.Order{}, err
	}
	defer tx.Rollback(ctx)

	q := s.queries.WithTx(tx)

	current, err := q.LockCartByUser(ctx, userUUID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return db.Order{}, ErrInvalid
		}
		return db.Order{}, err
	}

	lines, err := q.ListCartDetails(ctx, current.ID)
	if err != nil {
		return db.Order{}, err
	}
	if len(lines) == 0 {
		return db.Order{}, ErrInvalid
	}
	for _, line := range lines {
		if !line.IsAvailable {
			return db.Order{}, ErrInvalid
		}
	}

	address, err := q.GetAddressByID(ctx, addressUUID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return db.Order{}, ErrNotFound
		}
		return db.Order{}, err
	}
	if !pgutil.SameUUID(address.UserID, userUUID) {
		return db.Order{}, ErrForbidden
	}

	restaurant, err := q.GetRestaurantByID(ctx, current.RestaurantID)
	if err != nil {
		return db.Order{}, err
	}
	if restaurant.Status != "OPEN" {
		return db.Order{}, ErrInvalid
	}

	pricing, err := q.CartPricing(ctx, current.ID)
	if err != nil {
		return db.Order{}, err
	}

	created, err := q.CreateOrder(ctx, db.CreateOrderParams{
		UserID:            userUUID,
		RestaurantID:      current.RestaurantID,
		DeliveryAddressID: address.ID,
		Subtotal:          pricing.Subtotal,
		DeliveryFee:       pricing.DeliveryFee,
		Discount:          pricing.Discount,
		Total:             pricing.Total,
	})
	if err != nil {
		return db.Order{}, err
	}

	for _, line := range lines {
		_, err = q.CreateOrderItem(ctx, db.CreateOrderItemParams{
			OrderID:       created.ID,
			MenuItemID:    line.MenuItemID,
			NameSnapshot:  line.Name,
			PriceSnapshot: line.Price,
			Quantity:      line.Quantity,
			Subtotal:      line.LineTotal,
		})
		if err != nil {
			return db.Order{}, err
		}
	}

	_, err = q.CreateDelivery(ctx, db.CreateDeliveryParams{
		OrderID:          created.ID,
		PickupLatitude:   restaurant.Latitude,
		PickupLongitude:  restaurant.Longitude,
		DropoffLatitude:  address.Latitude,
		DropoffLongitude: address.Longitude,
	})
	if err != nil {
		return db.Order{}, err
	}

	if err := q.DeleteCartByUser(ctx, userUUID); err != nil {
		return db.Order{}, err
	}

	if err := event.PublishTx(ctx, q, event.OrderCreated, created.ID, event.OrderPayload{
		OrderID:      created.ID.String(),
		UserID:       created.UserID.String(),
		RestaurantID: created.RestaurantID.String(),
		OwnerID:      restaurant.OwnerID.String(),
	}); err != nil {
		return db.Order{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return db.Order{}, err
	}

	s.notify(ctx, created.ID.String())
	return created, nil
}

func (s *Service) ListMine(ctx context.Context, userID string) ([]db.Order, error) {
	userUUID, err := pgutil.ParseUUID(userID)
	if err != nil {
		return nil, ErrInvalid
	}

	return s.queries.ListOrdersByUser(ctx, userUUID)
}

func (s *Service) ListForOwner(ctx context.Context, ownerID string) ([]db.Order, error) {
	ownerUUID, err := pgutil.ParseUUID(ownerID)
	if err != nil {
		return nil, ErrInvalid
	}

	return s.queries.ListOrdersByOwner(ctx, ownerUUID)
}

func (s *Service) Get(ctx context.Context, orderID string, userID string, role string) (db.Order, []db.OrderItem, error) {
	orderUUID, err := pgutil.ParseUUID(orderID)
	if err != nil {
		return db.Order{}, nil, ErrNotFound
	}

	item, err := s.queries.GetOrderByID(ctx, orderUUID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return db.Order{}, nil, ErrNotFound
		}
		return db.Order{}, nil, err
	}

	if err := s.authorize(ctx, item, userID, role); err != nil {
		return db.Order{}, nil, err
	}

	lines, err := s.queries.ListOrderItems(ctx, item.ID)
	if err != nil {
		return db.Order{}, nil, err
	}

	return item, lines, nil
}

func (s *Service) Transition(ctx context.Context, orderID string, userID string, role string, next string) (db.Order, error) {
	orderUUID, err := pgutil.ParseUUID(orderID)
	if err != nil {
		return db.Order{}, ErrNotFound
	}

	item, err := s.queries.GetOrderByID(ctx, orderUUID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return db.Order{}, ErrNotFound
		}
		return db.Order{}, err
	}

	if err := s.authorize(ctx, item, userID, role); err != nil {
		return db.Order{}, err
	}

	allowedRole, ok := transitions[item.Status][next]
	if !ok || allowedRole != role {
		return db.Order{}, ErrInvalid
	}

	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return db.Order{}, err
	}
	defer tx.Rollback(ctx)

	q := s.queries.WithTx(tx)
	updated, err := q.UpdateOrderStatus(ctx, db.UpdateOrderStatusParams{
		ID:     item.ID,
		Status: next,
	})
	if err != nil {
		return db.Order{}, err
	}

	if next == "CANCELLED" || next == "REJECTED" {
		if err := q.CancelDeliveryByOrder(ctx, item.ID); err != nil {
			return db.Order{}, err
		}
	}

	restaurant, err := q.GetRestaurantByID(ctx, item.RestaurantID)
	if err != nil {
		return db.Order{}, err
	}

	if kind, ok := event.ForOrderStatus(next); ok {
		if err := event.PublishTx(ctx, q, kind, updated.ID, event.OrderPayload{
			OrderID:      updated.ID.String(),
			UserID:       updated.UserID.String(),
			RestaurantID: updated.RestaurantID.String(),
			OwnerID:      restaurant.OwnerID.String(),
		}); err != nil {
			return db.Order{}, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return db.Order{}, err
	}

	s.notify(ctx, updated.ID.String())
	return updated, nil
}

func (s *Service) authorize(ctx context.Context, item db.Order, userID string, role string) error {
	actorID, err := pgutil.ParseUUID(userID)
	if err != nil {
		return ErrForbidden
	}

	switch role {
	case "CUSTOMER":
		if pgutil.SameUUID(item.UserID, actorID) {
			return nil
		}
	case "RESTAURANT":
		restaurant, err := s.queries.GetRestaurantByID(ctx, item.RestaurantID)
		if err != nil {
			return ErrNotFound
		}
		if pgutil.SameUUID(restaurant.OwnerID, actorID) {
			return nil
		}
	case "DRIVER":
		driver, err := s.queries.GetDriverByUserID(ctx, actorID)
		if err != nil {
			return ErrForbidden
		}
		delivery, err := s.queries.GetDeliveryByOrderID(ctx, item.ID)
		if err != nil {
			return ErrForbidden
		}
		if pgutil.SameUUID(delivery.DriverID, driver.ID) {
			return nil
		}
	}

	return ErrForbidden
}

func (s *Service) notify(ctx context.Context, orderID string) {
	if s.publish != nil {
		s.publish(ctx, orderID)
	}
}

var transitions = map[string]map[string]string{
	"PENDING": {
		"CONFIRMED": "RESTAURANT",
		"REJECTED":  "RESTAURANT",
		"CANCELLED": "CUSTOMER",
	},
	"CONFIRMED": {
		"PREPARING": "RESTAURANT",
		"CANCELLED": "CUSTOMER",
	},
	"PREPARING": {
		"READY": "RESTAURANT",
	},
}
