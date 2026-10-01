package dispatch

import (
	"github.com/gin-gonic/gin"

	auth "github.com/cungcung-design/food-delivery-platform/backend/internal/auth"
)

func RegisterRoutes(router *gin.Engine, handler *Handler, jwtSecret []byte) {
	group := router.Group("/api/dispatch")
	group.Use(auth.RequireAuth(jwtSecret), auth.RequireRole("ADMIN"))
	group.POST("/recommend", handler.Recommend)
	group.GET("/recommendations", handler.List)
}
