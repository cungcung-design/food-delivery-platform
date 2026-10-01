package driver

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"

	db "github.com/cungcung-design/food-delivery-platform/backend/db/generated"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/pgutil"
)

var (
	ErrNotFound = errors.New("driver not found")
	ErrInvalid  = errors.New("invalid driver data")
)

type Publisher interface {
	PublishForDriver(ctx context.Context, driverID pgtype.UUID)
}

type Service struct {
	queries   *db.Queries
	publisher Publisher
}

func NewService(queries *db.Queries, publisher Publisher) *Service {
	return &Service{queries: queries, publisher: publisher}
}

type ProfileInput struct {
	VehicleType   *string
	VehicleNumber *string
}

func (s *Service) SaveProfile(ctx context.Context, userID string, input ProfileInput) (db.Driver, error) {
	userUUID, err := pgutil.ParseUUID(userID)
	if err != nil {
		return db.Driver{}, ErrInvalid
	}

	existing, err := s.queries.GetDriverByUserID(ctx, userUUID)
	if err == nil {
		return existing, nil
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		return db.Driver{}, err
	}

	created, err := s.queries.CreateDriver(ctx, db.CreateDriverParams{
		UserID:        userUUID,
		VehicleType:   pgutil.Text(input.VehicleType),
		VehicleNumber: pgutil.Text(input.VehicleNumber),
	})
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return s.queries.GetDriverByUserID(ctx, userUUID)
		}
		return db.Driver{}, err
	}

	return created, nil
}

func (s *Service) Me(ctx context.Context, userID string) (db.Driver, error) {
	userUUID, err := pgutil.ParseUUID(userID)
	if err != nil {
		return db.Driver{}, ErrInvalid
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

func (s *Service) SetStatus(ctx context.Context, userID string, status string) (db.Driver, error) {
	switch status {
	case "OFFLINE", "AVAILABLE", "PAUSED":
	default:
		return db.Driver{}, ErrInvalid
	}

	item, err := s.Me(ctx, userID)
	if err != nil {
		return db.Driver{}, err
	}
	if item.Status == "BUSY" {
		return db.Driver{}, ErrInvalid
	}

	return s.queries.UpdateDriverStatus(ctx, db.UpdateDriverStatusParams{
		ID:     item.ID,
		Status: status,
	})
}

func (s *Service) SetLocation(ctx context.Context, userID string, latitude float64, longitude float64) (db.Driver, error) {
	if latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180 {
		return db.Driver{}, ErrInvalid
	}

	item, err := s.Me(ctx, userID)
	if err != nil {
		return db.Driver{}, err
	}

	updated, err := s.queries.UpdateDriverLocation(ctx, db.UpdateDriverLocationParams{
		ID:               item.ID,
		CurrentLatitude:  pgutil.Float(&latitude),
		CurrentLongitude: pgutil.Float(&longitude),
	})
	if err != nil {
		return db.Driver{}, err
	}

	if _, err := s.queries.InsertDriverLocation(ctx, db.InsertDriverLocationParams{
		DriverID:  item.ID,
		Latitude:  latitude,
		Longitude: longitude,
	}); err != nil {
		return db.Driver{}, err
	}

	if s.publisher != nil {
		s.publisher.PublishForDriver(ctx, item.ID)
	}

	return updated, nil
}
