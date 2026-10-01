package notification

import (
	"github.com/gin-gonic/gin"

	auth "github.com/cungcung-design/food-delivery-platform/backend/internal/auth"
)

func RegisterRoutes(router *gin.Engine, handler *Handler, jwtSecret []byte) {
	group := router.Group("/api/notifications")
	group.Use(auth.RequireAuth(jwtSecret))

	group.GET("", handler.List)
	group.GET("/unread-count", handler.UnreadCount)
	group.PATCH("/:id/read", handler.MarkRead)
	group.POST("/read-all", handler.MarkAllRead)
}
