package menu

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

type createCategoryRequest struct {
	Name string `json:"name"`
}

func (h *Handler) CreateCategory(c *gin.Context) {
	var request createCategoryRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request."})
		return
	}

	ownerID := c.MustGet("userID").(string)
	category, err := h.service.CreateCategory(
		c.Request.Context(),
		c.Param("restaurantId"),
		ownerID,
		request.Name,
	)
	if err != nil {
		writeError(c, err, "Could not create category.")
		return
	}

	c.JSON(http.StatusCreated, gin.H{"category": toCategory(category)})
}

type createItemRequest struct {
	CategoryID  string  `json:"category_id"`
	Name        string  `json:"name"`
	Description *string `json:"description"`
	Price       string  `json:"price"`
	ImageURL    *string `json:"image_url"`
}

func (h *Handler) CreateItem(c *gin.Context) {
	var request createItemRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request."})
		return
	}

	ownerID := c.MustGet("userID").(string)
	item, err := h.service.CreateItem(
		c.Request.Context(),
		c.Param("restaurantId"),
		ownerID,
		CreateItemInput{
			CategoryID:  request.CategoryID,
			Name:        request.Name,
			Description: request.Description,
			Price:       request.Price,
			ImageURL:    request.ImageURL,
		},
	)
	if err != nil {
		writeError(c, err, "Could not create menu item.")
		return
	}

	c.JSON(http.StatusCreated, gin.H{"item": toItem(item)})
}

func (h *Handler) PublicMenu(c *gin.Context) {
	restaurantID, err := parseUUID(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid restaurant."})
		return
	}

	categories, err := h.service.queries.ListMenuCategories(c.Request.Context(), restaurantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Could not load menu."})
		return
	}

	items, err := h.service.queries.ListAvailableMenuItems(c.Request.Context(), restaurantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Could not load menu."})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"categories": toCategories(categories),
		"items":      toItems(items),
	})
}

type availabilityRequest struct {
	IsAvailable bool `json:"is_available"`
}

func (h *Handler) SetAvailability(c *gin.Context) {
	var request availabilityRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request."})
		return
	}

	ownerID := c.MustGet("userID").(string)
	item, err := h.service.SetAvailability(
		c.Request.Context(),
		c.Param("itemId"),
		ownerID,
		request.IsAvailable,
	)
	if err != nil {
		writeError(c, err, "Unable to update item.")
		return
	}

	c.JSON(http.StatusOK, gin.H{"item": toItem(item)})
}

func (h *Handler) OwnerMenu(c *gin.Context) {
	ownerID := c.MustGet("userID").(string)
	categories, items, err := h.service.OwnerMenu(
		c.Request.Context(),
		c.Param("restaurantId"),
		ownerID,
	)
	if err != nil {
		writeError(c, err, "Unable to load menu.")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"categories": toCategories(categories),
		"items":      toItems(items),
	})
}

func writeError(c *gin.Context, err error, fallback string) {
	switch {
	case errors.Is(err, ErrForbidden):
		c.JSON(http.StatusForbidden, gin.H{"message": fallback})
	case errors.Is(err, ErrNotFound):
		c.JSON(http.StatusNotFound, gin.H{"message": fallback})
	default:
		c.JSON(http.StatusBadRequest, gin.H{"message": fallback})
	}
}
