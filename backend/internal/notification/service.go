package notification

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"

	db "github.com/cungcung-design/food-delivery-platform/backend/db/generated"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/pgutil"
)

type Type string

const (
	TypeNewOrder          Type = "NEW_ORDER"
	TypeOrderConfirmed    Type = "ORDER_CONFIRMED"
	TypeOrderRejected     Type = "ORDER_REJECTED"
	TypeOrderPreparing    Type = "ORDER_PREPARING"
	TypeOrderReady        Type = "ORDER_READY"
	TypeDriverAssigned    Type = "DRIVER_ASSIGNED"
	TypeOrderPickedUp     Type = "ORDER_PICKED_UP"
	TypeOutForDelivery    Type = "OUT_FOR_DELIVERY"
	TypeOrderDelivered    Type = "ORDER_DELIVERED"
	TypeOrderCancelled    Type = "ORDER_CANCELLED"
	TypeDispatchSuggested Type = "DISPATCH_SUGGESTED"
)

var ErrNotFound = errors.New("notification not found")

type CreateInput struct {
	UserID  pgtype.UUID
	Type    Type
	Title   string
	Message string
	Data    []byte
}

type Service struct {
	queries *db.Queries
}

func NewService(queries *db.Queries) *Service {
	return &Service{queries: queries}
}

func (s *Service) Create(ctx context.Context, input CreateInput) (db.Notification, error) {
	return Insert(ctx, s.queries, input)
}

func Insert(ctx context.Context, queries *db.Queries, input CreateInput) (db.Notification, error) {
	data := input.Data
	if len(data) == 0 {
		data = []byte(`{}`)
	}

	return queries.CreateNotification(ctx, db.CreateNotificationParams{
		UserID:  input.UserID,
		Type:    string(input.Type),
		Title:   input.Title,
		Message: input.Message,
		Data:    data,
	})
}

func (s *Service) List(ctx context.Context, userID string, limit int32, offset int32) ([]db.Notification, error) {
	userUUID, err := pgutil.ParseUUID(userID)
	if err != nil {
		return nil, err
	}

	return s.queries.ListNotificationsByUser(ctx, db.ListNotificationsByUserParams{
		UserID: userUUID,
		Limit:  limit,
		Offset: offset,
	})
}

func (s *Service) UnreadCount(ctx context.Context, userID string) (int64, error) {
	userUUID, err := pgutil.ParseUUID(userID)
	if err != nil {
		return 0, err
	}

	return s.queries.CountUnreadNotifications(ctx, userUUID)
}

func (s *Service) MarkRead(ctx context.Context, userID string, notificationID string) (db.Notification, error) {
	userUUID, err := pgutil.ParseUUID(userID)
	if err != nil {
		return db.Notification{}, ErrNotFound
	}

	notificationUUID, err := pgutil.ParseUUID(notificationID)
	if err != nil {
		return db.Notification{}, ErrNotFound
	}

	item, err := s.queries.MarkNotificationRead(ctx, db.MarkNotificationReadParams{
		ID:     notificationUUID,
		UserID: userUUID,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return db.Notification{}, ErrNotFound
		}
		return db.Notification{}, err
	}

	return item, nil
}

func (s *Service) MarkAllRead(ctx context.Context, userID string) error {
	userUUID, err := pgutil.ParseUUID(userID)
	if err != nil {
		return err
	}

	return s.queries.MarkAllNotificationsRead(ctx, userUUID)
}
