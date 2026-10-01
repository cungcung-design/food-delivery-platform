package auth

import (
	"context"
	"errors"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"

	db "github.com/cungcung-design/food-delivery-platform/backend/db/generated"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrEmailAlreadyExists = errors.New("email already exists")
	ErrInvalidInput       = errors.New("invalid input")
)

type Service struct {
	queries *db.Queries
}

func NewService(queries *db.Queries) *Service {
	return &Service{queries: queries}
}

type RegisterInput struct {
	Name     string
	Email    string
	Password string
}

func (s *Service) Register(ctx context.Context, input RegisterInput) (db.User, error) {
	name := strings.TrimSpace(input.Name)
	email := strings.ToLower(strings.TrimSpace(input.Email))

	if len(name) < 2 {
		return db.User{}, ErrInvalidInput
	}

	if !strings.Contains(email, "@") {
		return db.User{}, ErrInvalidInput
	}

	passwordBytes := []byte(input.Password)
	if len(passwordBytes) < 8 || len(passwordBytes) > 72 {
		return db.User{}, ErrInvalidInput
	}

	_, err := s.queries.GetUserByEmail(ctx, email)
	if err == nil {
		return db.User{}, ErrEmailAlreadyExists
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		return db.User{}, err
	}

	passwordHash, err := HashPassword(input.Password)
	if err != nil {
		return db.User{}, err
	}

	user, err := s.queries.CreateUser(ctx, db.CreateUserParams{
		Name:  name,
		Email: email,
		PasswordHash: pgtype.Text{
			String: passwordHash,
			Valid:  true,
		},
	})
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return db.User{}, ErrEmailAlreadyExists
		}
		return db.User{}, err
	}

	return user, nil
}

func (s *Service) Login(ctx context.Context, email string, password string) (db.User, error) {
	email = strings.ToLower(strings.TrimSpace(email))

	user, err := s.queries.GetUserByEmail(ctx, email)
	if err != nil {
		return db.User{}, ErrInvalidCredentials
	}

	if !user.PasswordHash.Valid || user.PasswordHash.String == "" {
		return db.User{}, ErrInvalidCredentials
	}

	if CheckPassword(password, user.PasswordHash.String) != nil {
		return db.User{}, ErrInvalidCredentials
	}

	return user, nil
}
