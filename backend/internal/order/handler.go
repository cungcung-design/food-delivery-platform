package order

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

type checkoutRequest struct {
	AddressID string `json:"address_id"`
}

func (h *Handler) Checkout(c *gin.Context) {
	var request checkoutRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request."})
		return
	}

	item, err := h.service.Checkout(
		c.Request.Context(),
		c.MustGet("userID").(string),
		request.AddressID,
	)
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{"order": toOrder(item, nil)})
}

func (h *Handler) ListMine(c *gin.Context) {
	items, err := h.service.ListMine(c.Request.Context(), c.MustGet("userID").(string))
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"orders": toOrders(items)})
}

func (h *Handler) ListForOwner(c *gin.Context) {
	items, err := h.service.ListForOwner(c.Request.Context(), c.MustGet("userID").(string))
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"orders": toOrders(items)})
}

func (h *Handler) Get(c *gin.Context) {
	item, lines, err := h.service.Get(
		c.Request.Context(),
		c.Param("id"),
		c.MustGet("userID").(string),
		c.MustGet("role").(string),
	)
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"order": toOrder(item, lines)})
}

type statusRequest struct {
	Status string `json:"status"`
}

func (h *Handler) Transition(c *gin.Context) {
	var request statusRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request."})
		return
	}

	item, err := h.service.Transition(
		c.Request.Context(),
		c.Param("id"),
		c.MustGet("userID").(string),
		c.MustGet("role").(string),
		request.Status,
	)
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"order": toOrder(item, nil)})
}

func writeError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, ErrForbidden):
		c.JSON(http.StatusForbidden, gin.H{"message": "Access denied."})
	case errors.Is(err, ErrNotFound):
		c.JSON(http.StatusNotFound, gin.H{"message": "Order not found."})
	default:
		c.JSON(http.StatusBadRequest, gin.H{"message": "Could not update the order."})
	}
}
