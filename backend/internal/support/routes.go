package support

import (
	"github.com/gin-gonic/gin"

	auth "github.com/cungcung-design/food-delivery-platform/backend/internal/auth"
)

func RegisterRoutes(router *gin.Engine, handler *Handler, jwtSecret []byte) {
	group := router.Group("/api/support")
	group.Use(auth.RequireAuth(jwtSecret), auth.RequireRole("CUSTOMER"))
	group.POST("/ask", handler.Ask)
	group.GET("/tickets", handler.Tickets)
}
