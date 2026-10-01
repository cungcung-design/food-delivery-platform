package delivery

import (
	"github.com/gin-gonic/gin"

	auth "github.com/cungcung-design/food-delivery-platform/backend/internal/auth"
)

func RegisterRoutes(router *gin.Engine, handler *Handler, jwtSecret []byte) {
	driver := router.Group("/api/driver")
	driver.Use(
		auth.RequireAuth(jwtSecret),
		auth.RequireRole("DRIVER"),
	)
	driver.GET("/deliveries", handler.ListAvailable)
	driver.POST("/deliveries/:id/accept", handler.Accept)
	driver.POST("/deliveries/:id/advance", handler.Advance)

	tracking := router.Group("/api/orders/:id/tracking")
	tracking.Use(auth.RequireAuth(jwtSecret))
	tracking.GET("", handler.Tracking)
	tracking.GET("/stream", handler.Stream)
}
