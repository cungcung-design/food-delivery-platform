package ai

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	client *Client
}

func NewHandler(client *Client) *Handler {
	return &Handler{client: client}
}

func (h *Handler) Health(c *gin.Context) {
	if h.client != nil && h.client.Healthy(c.Request.Context()) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "ai_service": "connected"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "ok", "ai_service": "unavailable"})
}
