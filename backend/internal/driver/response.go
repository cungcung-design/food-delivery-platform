package driver

import (
	db "github.com/cungcung-design/food-delivery-platform/backend/db/generated"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/pgutil"
)

type driverJSON struct {
	ID            string   `json:"id"`
	UserID        string   `json:"user_id"`
	VehicleType   *string  `json:"vehicle_type"`
	VehicleNumber *string  `json:"vehicle_number"`
	Status        string   `json:"status"`
	Latitude      *float64 `json:"latitude"`
	Longitude     *float64 `json:"longitude"`
}

func toDriver(item db.Driver) driverJSON {
	return driverJSON{
		ID:            item.ID.String(),
		UserID:        item.UserID.String(),
		VehicleType:   pgutil.TextOut(item.VehicleType),
		VehicleNumber: pgutil.TextOut(item.VehicleNumber),
		Status:        item.Status,
		Latitude:      pgutil.FloatOut(item.CurrentLatitude),
		Longitude:     pgutil.FloatOut(item.CurrentLongitude),
	}
}
