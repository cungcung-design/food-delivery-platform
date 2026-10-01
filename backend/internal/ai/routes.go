package ai

import (
	"github.com/gin-gonic/gin"

	auth "github.com/cungcung-design/food-delivery-platform/backend/internal/auth"
)

func RegisterRoutes(router *gin.Engine, handler *Handler, jwtSecret []byte) {
	group := router.Group("/api/ai")
	group.Use(auth.RequireAuth(jwtSecret), auth.RequireRole("ADMIN"))
	group.GET("/health", handler.Health)
}
