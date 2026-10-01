package cart

import (
	"context"
	"errors"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"

	db "github.com/cungcung-design/food-delivery-platform/backend/db/generated"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/pgutil"
)

var (
	ErrNotFound  = errors.New("not found")
	ErrForbidden = errors.New("access denied")
	ErrInvalid   = errors.New("invalid cart data")
	ErrConflict  = errors.New("cart belongs to another restaurant")
)

type Service struct {
	queries *db.Queries
}

func NewService(queries *db.Queries) *Service {
	return &Service{queries: queries}
}

type AddressInput struct {
	Label       string
	AddressLine string
	City        string
	PostalCode  *string
	Latitude    *float64
	Longitude   *float64
}

func (s *Service) View(ctx context.Context, userID string) (cartJSON, error) {
	userUUID, err := pgutil.ParseUUID(userID)
	if err != nil {
		return emptyCart(), ErrInvalid
	}

	return s.view(ctx, s.queries, userUUID)
}

func (s *Service) AddItem(ctx context.Context, userID string, menuItemID string, quantity int) (cartJSON, error) {
	if quantity < 1 || quantity > 20 {
		return emptyCart(), ErrInvalid
	}

	userUUID, err := pgutil.ParseUUID(userID)
	if err != nil {
		return emptyCart(), ErrInvalid
	}

	itemUUID, err := pgutil.ParseUUID(menuItemID)
	if err != nil {
		return emptyCart(), ErrInvalid
	}

	item, err := s.queries.GetMenuItemByID(ctx, itemUUID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return emptyCart(), ErrNotFound
		}
		return emptyCart(), err
	}
	if !item.IsAvailable {
		return emptyCart(), ErrInvalid
	}

	restaurant, err := s.queries.GetRestaurantByID(ctx, item.RestaurantID)
	if err != nil {
		return emptyCart(), err
	}
	if restaurant.Status != "OPEN" {
		return emptyCart(), ErrInvalid
	}

	current, err := s.queries.GetCartByUser(ctx, userUUID)
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return emptyCart(), err
	}

	if err == nil {
		details, listErr := s.queries.ListCartDetails(ctx, current.ID)
		if listErr != nil {
			return emptyCart(), listErr
		}
		if len(details) == 0 && !pgutil.SameUUID(current.RestaurantID, item.RestaurantID) {
			if deleteErr := s.queries.DeleteCartByUser(ctx, userUUID); deleteErr != nil {
				return emptyCart(), deleteErr
			}
			err = pgx.ErrNoRows
		} else if !pgutil.SameUUID(current.RestaurantID, item.RestaurantID) {
			return emptyCart(), ErrConflict
		} else {
			for _, line := range details {
				if pgutil.SameUUID(line.MenuItemID, item.ID) && line.Quantity+int32(quantity) > 20 {
					return emptyCart(), ErrInvalid
				}
			}
		}
	}

	if errors.Is(err, pgx.ErrNoRows) {
		current, err = s.queries.CreateCart(ctx, db.CreateCartParams{
			UserID:       userUUID,
			RestaurantID: item.RestaurantID,
		})
		if err != nil {
			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) && pgErr.Code == "23505" {
				current, err = s.queries.GetCartByUser(ctx, userUUID)
			}
			if err != nil {
				return emptyCart(), err
			}
		}
	}

	_, err = s.queries.UpsertCartItem(ctx, db.UpsertCartItemParams{
		CartID:     current.ID,
		MenuItemID: item.ID,
		Quantity:   int32(quantity),
	})
	if err != nil {
		return emptyCart(), err
	}

	return s.view(ctx, s.queries, userUUID)
}

func (s *Service) UpdateItem(ctx context.Context, userID string, itemID string, quantity int) (cartJSON, error) {
	if quantity < 1 || quantity > 20 {
		return emptyCart(), ErrInvalid
	}

	userUUID, err := pgutil.ParseUUID(userID)
	if err != nil {
		return emptyCart(), ErrInvalid
	}

	lineID, err := pgutil.ParseUUID(itemID)
	if err != nil {
		return emptyCart(), ErrNotFound
	}

	current, err := s.queries.GetCartByUser(ctx, userUUID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return emptyCart(), ErrNotFound
		}
		return emptyCart(), err
	}

	_, err = s.queries.UpdateCartItemQuantity(ctx, db.UpdateCartItemQuantityParams{
		ID:       lineID,
		CartID:   current.ID,
		Quantity: int32(quantity),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return emptyCart(), ErrNotFound
		}
		return emptyCart(), err
	}

	return s.view(ctx, s.queries, userUUID)
}

func (s *Service) RemoveItem(ctx context.Context, userID string, itemID string) (cartJSON, error) {
	userUUID, err := pgutil.ParseUUID(userID)
	if err != nil {
		return emptyCart(), ErrInvalid
	}

	lineID, err := pgutil.ParseUUID(itemID)
	if err != nil {
		return emptyCart(), ErrNotFound
	}

	current, err := s.queries.GetCartByUser(ctx, userUUID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return emptyCart(), ErrNotFound
		}
		return emptyCart(), err
	}

	if err := s.queries.DeleteCartItem(ctx, db.DeleteCartItemParams{
		ID:     lineID,
		CartID: current.ID,
	}); err != nil {
		return emptyCart(), err
	}

	return s.view(ctx, s.queries, userUUID)
}

func (s *Service) Clear(ctx context.Context, userID string) error {
	userUUID, err := pgutil.ParseUUID(userID)
	if err != nil {
		return ErrInvalid
	}

	return s.queries.DeleteCartByUser(ctx, userUUID)
}

func (s *Service) CreateAddress(ctx context.Context, userID string, input AddressInput) (db.Address, error) {
	if strings.TrimSpace(input.Label) == "" ||
		strings.TrimSpace(input.AddressLine) == "" ||
		strings.TrimSpace(input.City) == "" {
		return db.Address{}, ErrInvalid
	}

	userUUID, err := pgutil.ParseUUID(userID)
	if err != nil {
		return db.Address{}, ErrInvalid
	}

	return s.queries.CreateAddress(ctx, db.CreateAddressParams{
		UserID:      userUUID,
		Label:       strings.TrimSpace(input.Label),
		AddressLine: strings.TrimSpace(input.AddressLine),
		City:        strings.TrimSpace(input.City),
		PostalCode:  pgutil.Text(input.PostalCode),
		Latitude:    pgutil.Float(input.Latitude),
		Longitude:   pgutil.Float(input.Longitude),
	})
}

func (s *Service) ListAddresses(ctx context.Context, userID string) ([]db.Address, error) {
	userUUID, err := pgutil.ParseUUID(userID)
	if err != nil {
		return nil, ErrInvalid
	}

	return s.queries.ListAddressesByUser(ctx, userUUID)
}

func (s *Service) view(ctx context.Context, queries *db.Queries, userID pgtype.UUID) (cartJSON, error) {
	current, err := queries.GetCartByUser(ctx, userID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return emptyCart(), nil
		}
		return emptyCart(), err
	}

	restaurant, err := queries.GetRestaurantByID(ctx, current.RestaurantID)
	if err != nil {
		return emptyCart(), err
	}

	lines, err := queries.ListCartDetails(ctx, current.ID)
	if err != nil {
		return emptyCart(), err
	}

	pricing, err := queries.CartPricing(ctx, current.ID)
	if err != nil {
		return emptyCart(), err
	}

	view := cartJSON{
		ID:             current.ID.String(),
		RestaurantID:   current.RestaurantID.String(),
		RestaurantName: restaurant.Name,
		Items:          make([]cartItemJSON, 0, len(lines)),
		Subtotal:       pgutil.Money(pricing.Subtotal),
		DeliveryFee:    pgutil.Money(pricing.DeliveryFee),
		Discount:       pgutil.Money(pricing.Discount),
		Total:          pgutil.Money(pricing.Total),
	}

	if len(lines) == 0 {
		view.DeliveryFee = "0.00"
		view.Total = "0.00"
	}

	for _, line := range lines {
		view.Items = append(view.Items, cartItemJSON{
			ID:          line.ID.String(),
			MenuItemID:  line.MenuItemID.String(),
			Name:        line.Name,
			Price:       pgutil.Money(line.Price),
			Quantity:    line.Quantity,
			LineTotal:   pgutil.Money(line.LineTotal),
			IsAvailable: line.IsAvailable,
		})
	}

	return view, nil
}
