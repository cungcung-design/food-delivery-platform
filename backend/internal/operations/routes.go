package operations

import (
	"github.com/gin-gonic/gin"

	auth "github.com/cungcung-design/food-delivery-platform/backend/internal/auth"
)

func RegisterRoutes(router *gin.Engine, handler *Handler, jwtSecret []byte) {
	group := router.Group("/api/operations")
	group.Use(auth.RequireAuth(jwtSecret), auth.RequireRole("ADMIN"))
	group.GET("/report", handler.Report)
	group.POST("/ask", handler.Ask)
}
