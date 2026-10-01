package delivery

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	db "github.com/cungcung-design/food-delivery-platform/backend/db/generated"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/event"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/pgutil"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/tracking"
)

var (
	ErrNotFound  = errors.New("delivery not found")
	ErrForbidden = errors.New("delivery access denied")
	ErrInvalid   = errors.New("invalid delivery transition")
)

type Service struct {
	queries *db.Queries
	pool    *pgxpool.Pool
	hub     *tracking.Hub
}

func NewService(queries *db.Queries, pool *pgxpool.Pool, hub *tracking.Hub) *Service {
	return &Service{queries: queries, pool: pool, hub: hub}
}

func (s *Service) ListAvailable(ctx context.Context, userID string) ([]deliveryJSON, error) {
	driver, err := s.availableDriver(ctx, userID)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			return []deliveryJSON{}, nil
		}
		return nil, err
	}

	if active, activeErr := s.queries.GetActiveDeliveryByDriver(ctx, driver.ID); activeErr == nil {
		view, viewErr := s.one(ctx, active)
		if viewErr != nil {
			return nil, viewErr
		}
		return []deliveryJSON{view}, nil
	} else if !errors.Is(activeErr, pgx.ErrNoRows) {
		return nil, activeErr
	}

	if driver.Status != "AVAILABLE" {
		return []deliveryJSON{}, nil
	}

	items, err := s.queries.ListDispatchableDeliveries(ctx)
	if err != nil {
		return nil, err
	}

	return s.toDeliveries(ctx, items)
}

func (s *Service) Accept(ctx context.Context, userID string, deliveryID string) (deliveryJSON, error) {
	driver, err := s.availableDriver(ctx, userID)
	if err != nil {
		return deliveryJSON{}, err
	}
	if driver.Status != "AVAILABLE" {
		return deliveryJSON{}, ErrInvalid
	}

	if _, err := s.queries.GetActiveDeliveryByDriver(ctx, driver.ID); err == nil {
		return deliveryJSON{}, ErrInvalid
	} else if !errors.Is(err, pgx.ErrNoRows) {
		return deliveryJSON{}, err
	}

	id, err := pgutil.ParseUUID(deliveryID)
	if err != nil {
		return deliveryJSON{}, ErrNotFound
	}

	current, err := s.queries.GetDeliveryByID(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return deliveryJSON{}, ErrNotFound
		}
		return deliveryJSON{}, err
	}

	order, err := s.queries.GetOrderByID(ctx, current.OrderID)
	if err != nil {
		return deliveryJSON{}, err
	}
	if order.Status != "READY" || current.Status != "UNASSIGNED" {
		return deliveryJSON{}, ErrInvalid
	}

	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return deliveryJSON{}, err
	}
	defer tx.Rollback(ctx)

	q := s.queries.WithTx(tx)
	assigned, err := q.AssignDelivery(ctx, db.AssignDeliveryParams{
		ID:       current.ID,
		DriverID: driver.ID,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return deliveryJSON{}, ErrInvalid
		}
		return deliveryJSON{}, err
	}

	if _, err := q.UpdateOrderStatus(ctx, db.UpdateOrderStatusParams{
		ID:     order.ID,
		Status: "DRIVER_ASSIGNED",
	}); err != nil {
		return deliveryJSON{}, err
	}

	if _, err := q.UpdateDriverStatus(ctx, db.UpdateDriverStatusParams{
		ID:     driver.ID,
		Status: "BUSY",
	}); err != nil {
		return deliveryJSON{}, err
	}

	if err := event.PublishTx(ctx, q, event.DriverAssigned, order.ID, event.OrderPayload{
		OrderID:      order.ID.String(),
		UserID:       order.UserID.String(),
		RestaurantID: order.RestaurantID.String(),
		DeliveryID:   assigned.ID.String(),
	}); err != nil {
		return deliveryJSON{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return deliveryJSON{}, err
	}

	s.Publish(ctx, order.ID.String())
	return s.one(ctx, assigned)
}

func (s *Service) Advance(ctx context.Context, userID string, deliveryID string, next string) (deliveryJSON, error) {
	driver, err := s.driverByUser(ctx, userID)
	if err != nil {
		return deliveryJSON{}, err
	}

	id, err := pgutil.ParseUUID(deliveryID)
	if err != nil {
		return deliveryJSON{}, ErrNotFound
	}

	current, err := s.queries.GetDeliveryByID(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return deliveryJSON{}, ErrNotFound
		}
		return deliveryJSON{}, err
	}
	if !pgutil.SameUUID(current.DriverID, driver.ID) {
		return deliveryJSON{}, ErrForbidden
	}

	expected := map[string]string{
		"ASSIGNED":         "PICKED_UP",
		"PICKED_UP":        "OUT_FOR_DELIVERY",
		"OUT_FOR_DELIVERY": "DELIVERED",
	}[current.Status]
	if expected == "" || next != expected {
		return deliveryJSON{}, ErrInvalid
	}

	order, err := s.queries.GetOrderByID(ctx, current.OrderID)
	if err != nil {
		return deliveryJSON{}, err
	}

	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return deliveryJSON{}, err
	}
	defer tx.Rollback(ctx)

	q := s.queries.WithTx(tx)
	updated, err := q.UpdateDeliveryProgress(ctx, db.UpdateDeliveryProgressParams{
		ID:       current.ID,
		Status:   next,
		DriverID: driver.ID,
	})
	if err != nil {
		return deliveryJSON{}, err
	}

	orderStatus := map[string]string{
		"PICKED_UP":        "PICKED_UP",
		"OUT_FOR_DELIVERY": "OUT_FOR_DELIVERY",
		"DELIVERED":        "DELIVERED",
	}[next]

	if _, err := q.UpdateOrderStatus(ctx, db.UpdateOrderStatusParams{
		ID:     current.OrderID,
		Status: orderStatus,
	}); err != nil {
		return deliveryJSON{}, err
	}

	if next == "DELIVERED" {
		if _, err := q.UpdateDriverStatus(ctx, db.UpdateDriverStatusParams{
			ID:     driver.ID,
			Status: "AVAILABLE",
		}); err != nil {
			return deliveryJSON{}, err
		}
	}

	kind, ok := event.ForOrderStatus(orderStatus)
	if !ok {
		return deliveryJSON{}, ErrInvalid
	}
	if err := event.PublishTx(ctx, q, kind, current.OrderID, event.OrderPayload{
		OrderID:      order.ID.String(),
		UserID:       order.UserID.String(),
		RestaurantID: order.RestaurantID.String(),
		DeliveryID:   current.ID.String(),
	}); err != nil {
		return deliveryJSON{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return deliveryJSON{}, err
	}

	s.Publish(ctx, current.OrderID.String())
	return s.one(ctx, updated)
}

func (s *Service) Snapshot(ctx context.Context, orderID string, userID string, role string) (trackingJSON, error) {
	orderUUID, err := pgutil.ParseUUID(orderID)
	if err != nil {
		return trackingJSON{}, ErrNotFound
	}

	item, err := s.queries.GetOrderByID(ctx, orderUUID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return trackingJSON{}, ErrNotFound
		}
		return trackingJSON{}, err
	}

	if err := s.canView(ctx, item, userID, role); err != nil {
		return trackingJSON{}, err
	}

	return s.snapshot(ctx, item)
}

func (s *Service) Publish(ctx context.Context, orderID string) {
	orderUUID, err := pgutil.ParseUUID(orderID)
	if err != nil {
		return
	}

	item, err := s.queries.GetOrderByID(ctx, orderUUID)
	if err != nil {
		return
	}

	view, err := s.snapshot(ctx, item)
	if err != nil {
		return
	}

	payload, err := json.Marshal(view)
	if err != nil {
		return
	}

	s.hub.Publish(orderID, payload)
}

func (s *Service) PublishForDriver(ctx context.Context, driverID pgtype.UUID) {
	current, err := s.queries.GetActiveDeliveryByDriver(ctx, driverID)
	if err != nil {
		return
	}

	s.Publish(ctx, current.OrderID.String())
}

func (s *Service) availableDriver(ctx context.Context, userID string) (db.Driver, error) {
	return s.driverByUser(ctx, userID)
}

func (s *Service) driverByUser(ctx context.Context, userID string) (db.Driver, error) {
	userUUID, err := pgutil.ParseUUID(userID)
	if err != nil {
		return db.Driver{}, ErrForbidden
	}

	item, err := s.queries.GetDriverByUserID(ctx, userUUID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return db.Driver{}, ErrNotFound
		}
		return db.Driver{}, err
	}

	return item, nil
}

func (s *Service) canView(ctx context.Context, item db.Order, userID string, role string) error {
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
		if err == nil && pgutil.SameUUID(restaurant.OwnerID, actorID) {
			return nil
		}
	case "DRIVER":
		driver, err := s.queries.GetDriverByUserID(ctx, actorID)
		if err != nil {
			return ErrForbidden
		}
		current, err := s.queries.GetDeliveryByOrderID(ctx, item.ID)
		if err == nil && pgutil.SameUUID(current.DriverID, driver.ID) {
			return nil
		}
	}

	return ErrForbidden
}

func (s *Service) snapshot(ctx context.Context, item db.Order) (trackingJSON, error) {
	view := trackingJSON{
		OrderID:     item.ID.String(),
		OrderStatus: item.Status,
		Points:      []pointJSON{},
	}

	current, err := s.queries.GetDeliveryByOrderID(ctx, item.ID)
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return trackingJSON{}, err
	}
	if err == nil {
		view.DeliveryID = current.ID.String()
		view.DeliveryStatus = current.Status
		view.PickupLatitude = pgutil.FloatOut(current.PickupLatitude)
		view.PickupLongitude = pgutil.FloatOut(current.PickupLongitude)
		view.DropoffLatitude = pgutil.FloatOut(current.DropoffLatitude)
		view.DropoffLongitude = pgutil.FloatOut(current.DropoffLongitude)

		if current.DriverID.Valid {
			driver, driverErr := s.queries.GetDriverByID(ctx, current.DriverID)
			if driverErr == nil {
				view.Latitude = pgutil.FloatOut(driver.CurrentLatitude)
				view.Longitude = pgutil.FloatOut(driver.CurrentLongitude)
			}

			points, pointErr := s.queries.ListRecentDriverLocations(ctx, db.ListRecentDriverLocationsParams{
				DriverID: current.DriverID,
				Limit:    20,
			})
			if pointErr == nil {
				for _, point := range points {
					view.Points = append(view.Points, pointJSON{
						Latitude:   point.Latitude,
						Longitude:  point.Longitude,
						RecordedAt: pgutil.Timestamp(point.RecordedAt),
					})
				}
			}
		}
	}

	return view, nil
}

func (s *Service) one(ctx context.Context, item db.Delivery) (deliveryJSON, error) {
	order, err := s.queries.GetOrderByID(ctx, item.OrderID)
	if err != nil {
		return deliveryJSON{}, err
	}

	return toDelivery(item, order), nil
}

func (s *Service) toDeliveries(ctx context.Context, items []db.Delivery) ([]deliveryJSON, error) {
	out := make([]deliveryJSON, 0, len(items))
	for _, item := range items {
		view, err := s.one(ctx, item)
		if err != nil {
			return nil, err
		}
		out = append(out, view)
	}
	return out, nil
}
