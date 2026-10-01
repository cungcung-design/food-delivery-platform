package cart

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

	customer.GET("/cart", handler.View)
	customer.POST("/cart/items", handler.AddItem)
	customer.PATCH("/cart/items/:id", handler.UpdateItem)
	customer.DELETE("/cart/items/:id", handler.RemoveItem)
	customer.DELETE("/cart", handler.Clear)
	customer.GET("/addresses", handler.ListAddresses)
	customer.POST("/addresses", handler.CreateAddress)
}
