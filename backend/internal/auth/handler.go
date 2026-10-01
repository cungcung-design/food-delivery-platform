package auth

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"

	db "github.com/cungcung-design/food-delivery-platform/backend/db/generated"
)

type Handler struct {
	service   *Service
	jwtSecret []byte
	jwtExpiry time.Duration
}

func NewHandler(service *Service, jwtSecret string, jwtExpiry time.Duration) *Handler {
	return &Handler{
		service:   service,
		jwtSecret: []byte(jwtSecret),
		jwtExpiry: jwtExpiry,
	}
}

type registerRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *Handler) Register(c *gin.Context) {
	var request registerRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request.",
		})
		return
	}

	user, err := h.service.Register(c.Request.Context(), RegisterInput{
		Name:     request.Name,
		Email:    request.Email,
		Password: request.Password,
	})
	if err != nil {
		switch err {
		case ErrEmailAlreadyExists:
			c.JSON(http.StatusConflict, gin.H{
				"message": "Email already exists.",
			})
		default:
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Invalid registration data.",
			})
		}
		return
	}

	h.setAuthCookie(c, user)

	c.JSON(http.StatusCreated, gin.H{
		"user": publicUser(user),
	})
}

func (h *Handler) Login(c *gin.Context) {
	var request loginRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request.",
		})
		return
	}

	user, err := h.service.Login(
		c.Request.Context(),
		request.Email,
		request.Password,
	)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Invalid email or password.",
		})
		return
	}

	h.setAuthCookie(c, user)

	c.JSON(http.StatusOK, gin.H{
		"user": publicUser(user),
	})
}

func (h *Handler) Logout(c *gin.Context) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(
		"access_token",
		"",
		-1,
		"/",
		"",
		false,
		true,
	)

	c.JSON(http.StatusOK, gin.H{
		"message": "Logged out.",
	})
}

func (h *Handler) Me(c *gin.Context) {
	userID := c.MustGet("userID").(string)

	var id pgtype.UUID
	if err := id.Scan(userID); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "User not found.",
		})
		return
	}

	user, err := h.service.queries.GetUserByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "User not found.",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": publicUser(user),
	})
}

func publicUser(user db.User) gin.H {
	return gin.H{
		"id":    user.ID,
		"name":  user.Name,
		"email": user.Email,
		"role":  user.Role,
	}
}

func (h *Handler) setAuthCookie(c *gin.Context, user db.User) {
	token, err := CreateToken(
		user.ID.String(),
		user.Role,
		h.jwtSecret,
		h.jwtExpiry,
	)
	if err != nil {
		c.Error(err)
		return
	}

	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(
		"access_token",
		token,
		int(h.jwtExpiry.Seconds()),
		"/",
		"",
		false,
		true,
	)
}
