package menu

import (
	"github.com/gin-gonic/gin"

	auth "github.com/cungcung-design/food-delivery-platform/backend/internal/auth"
)

func RegisterRoutes(router *gin.Engine, handler *Handler, jwtSecret []byte) {
	router.GET("/api/restaurants/:id/menu", handler.PublicMenu)

	owner := router.Group("/api/restaurant-owner")
	owner.Use(
		auth.RequireAuth(jwtSecret),
		auth.RequireRole("RESTAURANT"),
	)

	owner.GET("/restaurants/:restaurantId/menu", handler.OwnerMenu)
	owner.POST("/restaurants/:restaurantId/categories", handler.CreateCategory)
	owner.POST("/restaurants/:restaurantId/menu-items", handler.CreateItem)
	owner.PATCH("/menu-items/:itemId/availability", handler.SetAvailability)
}
