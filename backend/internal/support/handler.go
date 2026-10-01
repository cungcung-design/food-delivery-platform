package support

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/cungcung-design/food-delivery-platform/backend/internal/ai"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

type askRequest struct {
	Message string `json:"message"`
	OrderID string `json:"order_id"`
}

func (h *Handler) Ask(c *gin.Context) {
	var request askRequest
	if err := c.ShouldBindJSON(&request); err != nil || strings.TrimSpace(request.Message) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Tell me what you need help with."})
		return
	}

	reply, err := h.service.Ask(
		c.Request.Context(),
		c.MustGet("userID").(string),
		c.MustGet("role").(string),
		request.Message,
		request.OrderID,
	)
	if err != nil {
		var inputError ai.InputError
		if errors.As(err, &inputError) {
			c.JSON(http.StatusBadRequest, gin.H{"message": inputError.Message})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"message": "Tell me what you need help with."})
		return
	}

	c.JSON(http.StatusOK, reply)
}

func (h *Handler) Tickets(c *gin.Context) {
	items, err := h.service.ListTickets(c.Request.Context(), c.MustGet("userID").(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Could not load support tickets."})
		return
	}
	c.JSON(http.StatusOK, gin.H{"tickets": items})
}
