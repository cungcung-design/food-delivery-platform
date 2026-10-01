package restaurant

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

type createRequest struct {
	Name        string   `json:"name"`
	Description *string  `json:"description"`
	AddressLine string   `json:"address_line"`
	City        string   `json:"city"`
	Latitude    *float64 `json:"latitude"`
	Longitude   *float64 `json:"longitude"`
	ImageURL    *string  `json:"image_url"`
}

func (h *Handler) Create(c *gin.Context) {
	var request createRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request."})
		return
	}

	ownerID := c.MustGet("userID").(string)
	item, err := h.service.Create(c.Request.Context(), ownerID, CreateInput{
		Name:        request.Name,
		Description: request.Description,
		AddressLine: request.AddressLine,
		City:        request.City,
		Latitude:    request.Latitude,
		Longitude:   request.Longitude,
		ImageURL:    request.ImageURL,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Could not create restaurant."})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"restaurant": toRestaurant(item)})
}

func (h *Handler) List(c *gin.Context) {
	items, err := h.service.queries.ListOpenRestaurants(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Could not load restaurants."})
		return
	}

	c.JSON(http.StatusOK, gin.H{"restaurants": toRestaurants(items)})
}

func (h *Handler) Get(c *gin.Context) {
	restaurantID, err := parseUUID(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid restaurant ID."})
		return
	}

	item, err := h.service.queries.GetRestaurantByID(c.Request.Context(), restaurantID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Restaurant not found."})
		return
	}

	c.JSON(http.StatusOK, gin.H{"restaurant": toRestaurant(item)})
}

func (h *Handler) Mine(c *gin.Context) {
	ownerID := c.MustGet("userID").(string)
	ownerUUID, err := parseUUID(ownerID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid user."})
		return
	}

	items, err := h.service.queries.ListRestaurantsByOwner(c.Request.Context(), ownerUUID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Could not load restaurants."})
		return
	}

	c.JSON(http.StatusOK, gin.H{"restaurants": toRestaurants(items)})
}

type statusRequest struct {
	Status string `json:"status"`
}

func (h *Handler) UpdateStatus(c *gin.Context) {
	var request statusRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request."})
		return
	}

	ownerID := c.MustGet("userID").(string)
	item, err := h.service.UpdateStatus(
		c.Request.Context(),
		c.Param("id"),
		ownerID,
		request.Status,
	)
	if err != nil {
		writeError(c, err, "Unable to update restaurant.")
		return
	}

	c.JSON(http.StatusOK, gin.H{"restaurant": toRestaurant(item)})
}

func writeError(c *gin.Context, err error, forbiddenMessage string) {
	switch {
	case errors.Is(err, ErrForbidden):
		c.JSON(http.StatusForbidden, gin.H{"message": forbiddenMessage})
	case errors.Is(err, ErrNotFound), errors.Is(err, pgx.ErrNoRows):
		c.JSON(http.StatusNotFound, gin.H{"message": "Restaurant not found."})
	default:
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid restaurant data."})
	}
}
