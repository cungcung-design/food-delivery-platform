package menu

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
	ErrNotFound  = errors.New("not found")
	ErrForbidden = errors.New("access denied")
	ErrInvalid   = errors.New("invalid menu data")
)

type Service struct {
	queries *db.Queries
}

func NewService(queries *db.Queries) *Service {
	return &Service{queries: queries}
}

func (s *Service) verifyRestaurantOwner(ctx context.Context, restaurantID pgtype.UUID, ownerID string) error {
	ownerUUID, err := parseUUID(ownerID)
	if err != nil {
		return ErrForbidden
	}

	restaurant, err := s.queries.GetRestaurantByID(ctx, restaurantID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrNotFound
		}
		return err
	}

	if !sameUUID(restaurant.OwnerID, ownerUUID) {
		return ErrForbidden
	}

	return nil
}

func (s *Service) CreateCategory(ctx context.Context, restaurantID string, ownerID string, name string) (db.MenuCategory, error) {
	restaurantUUID, err := parseUUID(restaurantID)
	if err != nil {
		return db.MenuCategory{}, ErrInvalid
	}

	if strings.TrimSpace(name) == "" {
		return db.MenuCategory{}, ErrInvalid
	}

	if err := s.verifyRestaurantOwner(ctx, restaurantUUID, ownerID); err != nil {
		return db.MenuCategory{}, err
	}

	return s.queries.CreateMenuCategory(ctx, db.CreateMenuCategoryParams{
		RestaurantID: restaurantUUID,
		Name:         strings.TrimSpace(name),
	})
}

func (s *Service) verifyCategory(ctx context.Context, categoryID pgtype.UUID, restaurantID pgtype.UUID) error {
	category, err := s.queries.GetMenuCategoryByID(ctx, categoryID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrNotFound
		}
		return err
	}

	if !sameUUID(category.RestaurantID, restaurantID) {
		return ErrInvalid
	}

	return nil
}

type CreateItemInput struct {
	CategoryID  string
	Name        string
	Description *string
	Price       string
	ImageURL    *string
}

func (s *Service) CreateItem(ctx context.Context, restaurantID string, ownerID string, input CreateItemInput) (db.MenuItem, error) {
	restaurantUUID, err := parseUUID(restaurantID)
	if err != nil {
		return db.MenuItem{}, ErrInvalid
	}

	categoryUUID, err := parseUUID(input.CategoryID)
	if err != nil {
		return db.MenuItem{}, ErrInvalid
	}

	if strings.TrimSpace(input.Name) == "" {
		return db.MenuItem{}, ErrInvalid
	}

	price, err := parsePrice(input.Price)
	if err != nil {
		return db.MenuItem{}, ErrInvalid
	}

	if err := s.verifyRestaurantOwner(ctx, restaurantUUID, ownerID); err != nil {
		return db.MenuItem{}, err
	}

	if err := s.verifyCategory(ctx, categoryUUID, restaurantUUID); err != nil {
		return db.MenuItem{}, err
	}

	return s.queries.CreateMenuItem(ctx, db.CreateMenuItemParams{
		RestaurantID: restaurantUUID,
		CategoryID:   categoryUUID,
		Name:         strings.TrimSpace(input.Name),
		Description:  textFromPtr(input.Description),
		Price:        price,
		ImageUrl:     textFromPtr(input.ImageURL),
	})
}

func (s *Service) SetAvailability(ctx context.Context, itemID string, ownerID string, available bool) (db.MenuItem, error) {
	itemUUID, err := parseUUID(itemID)
	if err != nil {
		return db.MenuItem{}, ErrInvalid
	}

	item, err := s.queries.GetMenuItemByID(ctx, itemUUID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return db.MenuItem{}, ErrNotFound
		}
		return db.MenuItem{}, err
	}

	if err := s.verifyRestaurantOwner(ctx, item.RestaurantID, ownerID); err != nil {
		return db.MenuItem{}, err
	}

	return s.queries.UpdateMenuItemAvailability(ctx, db.UpdateMenuItemAvailabilityParams{
		ID:          item.ID,
		IsAvailable: available,
	})
}

func (s *Service) OwnerMenu(ctx context.Context, restaurantID string, ownerID string) ([]db.MenuCategory, []db.MenuItem, error) {
	restaurantUUID, err := parseUUID(restaurantID)
	if err != nil {
		return nil, nil, ErrInvalid
	}

	if err := s.verifyRestaurantOwner(ctx, restaurantUUID, ownerID); err != nil {
		return nil, nil, err
	}

	categories, err := s.queries.ListMenuCategories(ctx, restaurantUUID)
	if err != nil {
		return nil, nil, err
	}

	items, err := s.queries.ListMenuItemsByRestaurant(ctx, restaurantUUID)
	if err != nil {
		return nil, nil, err
	}

	return categories, items, nil
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

func parsePrice(value string) (pgtype.Numeric, error) {
	var price pgtype.Numeric
	if err := price.Scan(strings.TrimSpace(value)); err != nil || !price.Valid {
		return pgtype.Numeric{}, ErrInvalid
	}

	asFloat, err := price.Float64Value()
	if err != nil || !asFloat.Valid || asFloat.Float64 < 0 {
		return pgtype.Numeric{}, ErrInvalid
	}

	return price, nil
}
