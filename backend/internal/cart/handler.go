package cart

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

func (h *Handler) View(c *gin.Context) {
	view, err := h.service.View(c.Request.Context(), c.MustGet("userID").(string))
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"cart": view})
}

type addItemRequest struct {
	MenuItemID string `json:"menu_item_id"`
	Quantity   int    `json:"quantity"`
}

func (h *Handler) AddItem(c *gin.Context) {
	var request addItemRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request."})
		return
	}

	view, err := h.service.AddItem(
		c.Request.Context(),
		c.MustGet("userID").(string),
		request.MenuItemID,
		request.Quantity,
	)
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"cart": view})
}

type quantityRequest struct {
	Quantity int `json:"quantity"`
}

func (h *Handler) UpdateItem(c *gin.Context) {
	var request quantityRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request."})
		return
	}

	view, err := h.service.UpdateItem(
		c.Request.Context(),
		c.MustGet("userID").(string),
		c.Param("id"),
		request.Quantity,
	)
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"cart": view})
}

func (h *Handler) RemoveItem(c *gin.Context) {
	view, err := h.service.RemoveItem(
		c.Request.Context(),
		c.MustGet("userID").(string),
		c.Param("id"),
	)
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"cart": view})
}

func (h *Handler) Clear(c *gin.Context) {
	if err := h.service.Clear(c.Request.Context(), c.MustGet("userID").(string)); err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"cart": emptyCart()})
}

type addressRequest struct {
	Label       string   `json:"label"`
	AddressLine string   `json:"address_line"`
	City        string   `json:"city"`
	PostalCode  *string  `json:"postal_code"`
	Latitude    *float64 `json:"latitude"`
	Longitude   *float64 `json:"longitude"`
}

func (h *Handler) CreateAddress(c *gin.Context) {
	var request addressRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request."})
		return
	}

	item, err := h.service.CreateAddress(c.Request.Context(), c.MustGet("userID").(string), AddressInput{
		Label:       request.Label,
		AddressLine: request.AddressLine,
		City:        request.City,
		PostalCode:  request.PostalCode,
		Latitude:    request.Latitude,
		Longitude:   request.Longitude,
	})
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{"address": toAddress(item)})
}

func (h *Handler) ListAddresses(c *gin.Context) {
	items, err := h.service.ListAddresses(c.Request.Context(), c.MustGet("userID").(string))
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"addresses": toAddresses(items)})
}

func writeError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, ErrConflict):
		c.JSON(http.StatusConflict, gin.H{"message": "Your cart is for another restaurant."})
	case errors.Is(err, ErrNotFound):
		c.JSON(http.StatusNotFound, gin.H{"message": "Not found."})
	case errors.Is(err, ErrForbidden):
		c.JSON(http.StatusForbidden, gin.H{"message": "Access denied."})
	default:
		c.JSON(http.StatusBadRequest, gin.H{"message": "Could not update the cart."})
	}
}
