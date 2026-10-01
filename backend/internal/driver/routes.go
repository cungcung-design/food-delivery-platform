package driver

import (
	"github.com/gin-gonic/gin"

	auth "github.com/cungcung-design/food-delivery-platform/backend/internal/auth"
)

func RegisterRoutes(router *gin.Engine, handler *Handler, jwtSecret []byte) {
	group := router.Group("/api/driver")
	group.Use(
		auth.RequireAuth(jwtSecret),
		auth.RequireRole("DRIVER"),
	)

	group.POST("/profile", handler.SaveProfile)
	group.GET("/me", handler.Me)
	group.PATCH("/status", handler.SetStatus)
	group.PATCH("/location", handler.SetLocation)
}
