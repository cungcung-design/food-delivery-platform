package notification

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) List(c *gin.Context) {
	userID := c.MustGet("userID").(string)
	limit := int32(20)
	offset := int32(0)

	if value := c.Query("limit"); value != "" {
		if parsed, err := strconv.Atoi(value); err == nil && parsed > 0 && parsed <= 100 {
			limit = int32(parsed)
		}
	}

	if value := c.Query("offset"); value != "" {
		if parsed, err := strconv.Atoi(value); err == nil && parsed >= 0 {
			offset = int32(parsed)
		}
	}

	items, err := h.service.List(c.Request.Context(), userID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Could not load notifications."})
		return
	}

	c.JSON(http.StatusOK, gin.H{"notifications": toNotifications(items)})
}

func (h *Handler) UnreadCount(c *gin.Context) {
	userID := c.MustGet("userID").(string)

	count, err := h.service.UnreadCount(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Could not load unread count."})
		return
	}

	c.JSON(http.StatusOK, gin.H{"count": count})
}

func (h *Handler) MarkRead(c *gin.Context) {
	userID := c.MustGet("userID").(string)

	item, err := h.service.MarkRead(c.Request.Context(), userID, c.Param("id"))
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"message": "Notification not found."})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Could not update notification."})
		return
	}

	c.JSON(http.StatusOK, gin.H{"notification": toNotification(item)})
}

func (h *Handler) MarkAllRead(c *gin.Context) {
	userID := c.MustGet("userID").(string)

	if err := h.service.MarkAllRead(c.Request.Context(), userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Could not update notifications."})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notifications marked as read."})
}
