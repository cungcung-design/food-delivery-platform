package dispatch

import (
	"net/http"

	"github.com/gin-gonic/gin"

	db "github.com/cungcung-design/food-delivery-platform/backend/db/generated"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/pgutil"
)

type Handler struct {
	service *Service
	queries *db.Queries
}

func NewHandler(service *Service, queries *db.Queries) *Handler {
	return &Handler{service: service, queries: queries}
}

type recommendRequest struct {
	OrderID string `json:"order_id"`
}

func (h *Handler) Recommend(c *gin.Context) {
	var request recommendRequest
	if err := c.ShouldBindJSON(&request); err != nil || request.OrderID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "An order is required."})
		return
	}

	item, err := h.service.Recommend(c.Request.Context(), nil, request.OrderID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Could not suggest a driver."})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"reply": item.Reason,
		"tools": []gin.H{
			{"name": "get_dispatch_context", "ok": true},
			{"name": "find_available_drivers", "ok": true, "detail": item.Reason},
		},
		"recommendation": item,
	})
}

func (h *Handler) List(c *gin.Context) {
	rows, err := h.queries.ListDispatchRecommendations(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Could not load suggestions."})
		return
	}
	items := make([]gin.H, 0, len(rows))
	for _, row := range rows {
		item := gin.H{
			"id":         row.ID.String(),
			"order_id":   row.OrderID.String(),
			"reason":     row.Reason,
			"created_at": pgutil.Timestamp(row.CreatedAt),
		}
		if row.DriverID.Valid {
			item["driver_id"] = row.DriverID.String()
		}
		if row.DistanceKm.Valid {
			item["distance_km"] = row.DistanceKm.Float64
		}
		items = append(items, item)
	}
	c.JSON(http.StatusOK, gin.H{"recommendations": items})
}
