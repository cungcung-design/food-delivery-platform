package delivery

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/cungcung-design/food-delivery-platform/backend/internal/tracking"
)

type Handler struct {
	service *Service
	hub     *tracking.Hub
}

func NewHandler(service *Service, hub *tracking.Hub) *Handler {
	return &Handler{service: service, hub: hub}
}

func (h *Handler) History(c *gin.Context) {
	items, err := h.service.History(c.Request.Context(), c.MustGet("userID").(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Could not load delivery history."})
		return
	}

	c.JSON(http.StatusOK, gin.H{"deliveries": items})
}

func (h *Handler) Earnings(c *gin.Context) {
	summary, err := h.service.Earnings(c.Request.Context(), c.MustGet("userID").(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Could not load earnings."})
		return
	}

	c.JSON(http.StatusOK, gin.H{"earnings": summary})
}

func (h *Handler) ListAvailable(c *gin.Context) {
	items, err := h.service.ListAvailable(c.Request.Context(), c.MustGet("userID").(string))
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"deliveries": items})
}

func (h *Handler) Accept(c *gin.Context) {
	item, err := h.service.Accept(
		c.Request.Context(),
		c.MustGet("userID").(string),
		c.Param("id"),
	)
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"delivery": item})
}

type advanceRequest struct {
	Status string `json:"status"`
}

func (h *Handler) Advance(c *gin.Context) {
	var request advanceRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request."})
		return
	}

	item, err := h.service.Advance(
		c.Request.Context(),
		c.MustGet("userID").(string),
		c.Param("id"),
		request.Status,
	)
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"delivery": item})
}

func (h *Handler) Tracking(c *gin.Context) {
	view, err := h.service.Snapshot(
		c.Request.Context(),
		c.Param("id"),
		c.MustGet("userID").(string),
		c.MustGet("role").(string),
	)
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"tracking": view})
}

func (h *Handler) Stream(c *gin.Context) {
	orderID := c.Param("id")
	if _, err := h.service.Snapshot(
		c.Request.Context(),
		orderID,
		c.MustGet("userID").(string),
		c.MustGet("role").(string),
	); err != nil {
		writeError(c, err)
		return
	}

	events := h.hub.Subscribe(orderID)
	defer h.hub.Unsubscribe(orderID, events)

	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("X-Accel-Buffering", "no")

	h.service.Publish(c.Request.Context(), orderID)

	c.Stream(func(w io.Writer) bool {
		select {
		case <-c.Request.Context().Done():
			return false
		case payload, ok := <-events:
			if !ok {
				return false
			}
			fmt.Fprintf(w, "event: tracking\ndata: %s\n\n", payload)
			return true
		case <-time.After(15 * time.Second):
			fmt.Fprint(w, "event: ping\ndata: ok\n\n")
			return true
		}
	})
}

func writeError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, ErrForbidden):
		c.JSON(http.StatusForbidden, gin.H{"message": "Access denied."})
	case errors.Is(err, ErrNotFound):
		c.JSON(http.StatusNotFound, gin.H{"message": "Delivery not found."})
	default:
		c.JSON(http.StatusBadRequest, gin.H{"message": "Could not update the delivery."})
	}
}
