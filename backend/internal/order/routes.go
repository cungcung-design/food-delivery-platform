package order

import (
	"github.com/gin-gonic/gin"

	auth "github.com/cungcung-design/food-delivery-platform/backend/internal/auth"
)

func RegisterRoutes(router *gin.Engine, handler *Handler, jwtSecret []byte) {
	customer := router.Group("/api")
	customer.Use(
		auth.RequireAuth(jwtSecret),
		auth.RequireRole("CUSTOMER"),
	)
	customer.POST("/checkout", handler.Checkout)
	customer.GET("/orders", handler.ListMine)

	reader := router.Group("/api/orders")
	reader.Use(auth.RequireAuth(jwtSecret))
	reader.GET("/:id", handler.Get)
	reader.POST("/:id/status", handler.Transition)

	owner := router.Group("/api/restaurant-owner")
	owner.Use(
		auth.RequireAuth(jwtSecret),
		auth.RequireRole("RESTAURANT"),
	)
	owner.GET("/orders", handler.ListForOwner)
	owner.POST("/orders/:id/status", handler.Transition)
}
