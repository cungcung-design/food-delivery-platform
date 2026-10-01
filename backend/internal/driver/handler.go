package driver

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

type profileRequest struct {
	VehicleType   *string `json:"vehicle_type"`
	VehicleNumber *string `json:"vehicle_number"`
}

func (h *Handler) SaveProfile(c *gin.Context) {
	var request profileRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request."})
		return
	}

	item, err := h.service.SaveProfile(c.Request.Context(), c.MustGet("userID").(string), ProfileInput{
		VehicleType:   request.VehicleType,
		VehicleNumber: request.VehicleNumber,
	})
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"driver": toDriver(item)})
}

func (h *Handler) Me(c *gin.Context) {
	item, err := h.service.Me(c.Request.Context(), c.MustGet("userID").(string))
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"driver": toDriver(item)})
}

type statusRequest struct {
	Status string `json:"status"`
}

func (h *Handler) SetStatus(c *gin.Context) {
	var request statusRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request."})
		return
	}

	item, err := h.service.SetStatus(c.Request.Context(), c.MustGet("userID").(string), request.Status)
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"driver": toDriver(item)})
}

type locationRequest struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

func (h *Handler) SetLocation(c *gin.Context) {
	var request locationRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request."})
		return
	}

	item, err := h.service.SetLocation(
		c.Request.Context(),
		c.MustGet("userID").(string),
		request.Latitude,
		request.Longitude,
	)
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"driver": toDriver(item)})
}

func writeError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, ErrNotFound):
		c.JSON(http.StatusNotFound, gin.H{"message": "Driver profile not found."})
	default:
		c.JSON(http.StatusBadRequest, gin.H{"message": "Could not update the driver."})
	}
}
