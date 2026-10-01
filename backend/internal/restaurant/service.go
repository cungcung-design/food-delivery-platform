package restaurant

import (
	"context"
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"

	db "github.com/cungcung-design/food-delivery-platform/backend/db/generated"
)

var (
	ErrNotFound  = errors.New("restaurant not found")
	ErrForbidden = errors.New("restaurant access denied")
	ErrInvalid   = errors.New("invalid restaurant data")
)

type Service struct {
	queries *db.Queries
}

func NewService(queries *db.Queries) *Service {
	return &Service{queries: queries}
}

type CreateInput struct {
	Name        string
	Description *string
	AddressLine string
	City        string
	Latitude    *float64
	Longitude   *float64
	ImageURL    *string
}

func (s *Service) Create(ctx context.Context, ownerID string, input CreateInput) (db.Restaurant, error) {
	if strings.TrimSpace(input.Name) == "" ||
		strings.TrimSpace(input.AddressLine) == "" ||
		strings.TrimSpace(input.City) == "" {
		return db.Restaurant{}, ErrInvalid
	}

	ownerUUID, err := parseUUID(ownerID)
	if err != nil {
		return db.Restaurant{}, ErrInvalid
	}

	return s.queries.CreateRestaurant(ctx, db.CreateRestaurantParams{
		OwnerID:     ownerUUID,
		Name:        strings.TrimSpace(input.Name),
		Description: textFromPtr(input.Description),
		AddressLine: strings.TrimSpace(input.AddressLine),
		City:        strings.TrimSpace(input.City),
		Latitude:    floatFromPtr(input.Latitude),
		Longitude:   floatFromPtr(input.Longitude),
		ImageUrl:    textFromPtr(input.ImageURL),
	})
}

func (s *Service) GetOwnedRestaurant(ctx context.Context, restaurantID string, ownerID string) (db.Restaurant, error) {
	restaurantUUID, err := parseUUID(restaurantID)
	if err != nil {
		return db.Restaurant{}, ErrNotFound
	}

	ownerUUID, err := parseUUID(ownerID)
	if err != nil {
		return db.Restaurant{}, ErrForbidden
	}

	item, err := s.queries.GetRestaurantByID(ctx, restaurantUUID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return db.Restaurant{}, ErrNotFound
		}
		return db.Restaurant{}, err
	}

	if !sameUUID(item.OwnerID, ownerUUID) {
		return db.Restaurant{}, ErrForbidden
	}

	return item, nil
}

func (s *Service) UpdateStatus(ctx context.Context, restaurantID string, ownerID string, status string) (db.Restaurant, error) {
	if status != "OPEN" && status != "CLOSED" {
		return db.Restaurant{}, ErrInvalid
	}

	item, err := s.GetOwnedRestaurant(ctx, restaurantID, ownerID)
	if err != nil {
		return db.Restaurant{}, err
	}

	return s.queries.UpdateRestaurantStatus(ctx, db.UpdateRestaurantStatusParams{
		ID:     item.ID,
		Status: status,
	})
}

func parseUUID(value string) (pgtype.UUID, error) {
	parsed, err := uuid.Parse(value)
	if err != nil {
		return pgtype.UUID{}, err
	}

	return pgtype.UUID{Bytes: parsed, Valid: true}, nil
}

func sameUUID(left pgtype.UUID, right pgtype.UUID) bool {
	return left.Valid && right.Valid && left.Bytes == right.Bytes
}

func textFromPtr(value *string) pgtype.Text {
	if value == nil {
		return pgtype.Text{}
	}

	return pgtype.Text{String: *value, Valid: true}
}

func floatFromPtr(value *float64) pgtype.Float8 {
	if value == nil {
		return pgtype.Float8{}
	}

	return pgtype.Float8{Float64: *value, Valid: true}
}
