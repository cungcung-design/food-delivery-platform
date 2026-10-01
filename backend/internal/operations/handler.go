package operations

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

type askRequest struct {
	Message string `json:"message"`
}

func (h *Handler) Report(c *gin.Context) {
	report, err := h.service.Ask(c.Request.Context(), c.MustGet("userID").(string), "What needs attention, including drivers?")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Could not load the operations report."})
		return
	}
	c.JSON(http.StatusOK, report)
}

func (h *Handler) Ask(c *gin.Context) {
	var request askRequest
	if err := c.ShouldBindJSON(&request); err != nil || request.Message == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Ask what needs attention."})
		return
	}
	report, err := h.service.Ask(c.Request.Context(), c.MustGet("userID").(string), request.Message)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Could not answer that."})
		return
	}
	c.JSON(http.StatusOK, report)
}
