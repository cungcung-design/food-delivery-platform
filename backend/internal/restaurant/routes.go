package restaurant

import (
	"github.com/gin-gonic/gin"

	auth "github.com/cungcung-design/food-delivery-platform/backend/internal/auth"
)

func RegisterRoutes(router *gin.Engine, handler *Handler, jwtSecret []byte) {
	public := router.Group("/api/restaurants")
	public.GET("", handler.List)
	public.GET("/:id", handler.Get)

	owner := router.Group("/api/restaurant-owner")
	owner.Use(
		auth.RequireAuth(jwtSecret),
		auth.RequireRole("RESTAURANT"),
	)
	owner.POST("/restaurants", handler.Create)
	owner.GET("/restaurants", handler.Mine)
	owner.PATCH("/restaurants/:id/status", handler.UpdateStatus)
}
