package dispatch

import (
	"context"
	"errors"
	"fmt"
	"log"
	"math"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"

	db "github.com/cungcung-design/food-delivery-platform/backend/db/generated"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/ai"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/pgutil"
)

type Service struct {
	queries *db.Queries
	client  *ai.Client
	logs    *ai.Logger
}

func NewService(queries *db.Queries, client *ai.Client, logs *ai.Logger) *Service {
	return &Service{queries: queries, client: client, logs: logs}
}

// Dispatch records that an order is ready for a driver.
// A delivery that is already assigned is treated as success so a
// repeated ORDER_READY event cannot assign a second driver.
func (s *Service) Dispatch(ctx context.Context, orderID string) error {
	id, err := pgutil.ParseUUID(orderID)
	if err != nil {
		return err
	}

	order, err := s.queries.GetOrderByID(ctx, id)
	if err != nil {
		return err
	}
	if order.Status == "CANCELLED" || order.Status == "REJECTED" {
		return nil
	}

	current, err := s.queries.GetDeliveryByOrderID(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return errors.New("delivery not found")
		}
		return err
	}

	log.Printf("dispatch order=%s delivery=%s status=%s", orderID, current.ID.String(), current.Status)
	return nil
}

type Recommendation struct {
	OrderID      string   `json:"order_id"`
	DriverID     string   `json:"driver_id,omitempty"`
	DriverUserID string   `json:"-"`
	DriverName   string   `json:"driver_name,omitempty"`
	Reason       string   `json:"reason"`
	DistanceKM   *float64 `json:"distance_km,omitempty"`
}

// Recommend chooses the nearest available driver. It never assigns the
// delivery. The driver still has to accept the job.
func (s *Service) Recommend(ctx context.Context, queries *db.Queries, orderID string) (Recommendation, error) {
	if queries == nil {
		queries = s.queries
	}
	id, err := pgutil.ParseUUID(orderID)
	if err != nil {
		return Recommendation{}, err
	}
	item, err := queries.GetOrderByID(ctx, id)
	if err != nil {
		return Recommendation{}, err
	}
	current, err := queries.GetDeliveryByOrderID(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Recommendation{OrderID: orderID, Reason: "This order has no delivery."}, nil
		}
		return Recommendation{}, err
	}
	if item.Status != "READY" || current.Status != "UNASSIGNED" {
		return Recommendation{OrderID: orderID, Reason: "This order is not waiting for a driver."}, nil
	}

	drivers, err := queries.ListAvailableDriversForDispatch(ctx)
	if err != nil {
		return Recommendation{}, err
	}
	requestID := ai.NewRequestID()
	candidates := rankDrivers(drivers, current.PickupLatitude, current.PickupLongitude)
	live := availableNow(ctx, queries, candidates)
	if len(live) == 0 {
		reason := "No available driver is online."
		s.logs.Record(ctx, "", "DISPATCH", requestID, "find_available_drivers", true, 0, "")
		if _, err := queries.CreateDispatchRecommendation(ctx, db.CreateDispatchRecommendationParams{
			OrderID: id,
			Reason:  reason,
		}); err != nil {
			return Recommendation{}, err
		}
		return Recommendation{OrderID: orderID, Reason: reason}, nil
	}

	proposedID := ""
	aiFailed := s.client == nil
	started := time.Now()
	if s.client != nil {
		plan, planErr := s.client.Plan(ctx, ai.PlanRequest{
			Agent:      "dispatch",
			Message:    "recommend a driver",
			OrderID:    orderID,
			Candidates: toAICandidates(live),
		})
		if planErr != nil {
			aiFailed = true
			s.logs.Record(ctx, "", "DISPATCH", requestID, "find_available_drivers", false, time.Since(started), "ai unavailable")
		} else {
			for _, tool := range plan.Tools {
				if !ai.ValidateTool("dispatch", tool) {
					s.logs.Record(ctx, "", "DISPATCH", requestID, tool, false, time.Since(started), "Tool is not allowed for this agent")
				}
			}
			proposedID = plan.DriverID
		}
	}
	choice, fallback, rejected := SelectDriver(live, proposedID, aiFailed)
	if rejected {
		s.logs.Record(ctx, "", "DISPATCH", requestID, "find_available_drivers", false, time.Since(started), "unknown driver rejected")
	}
	if choice.ID == "" {
		reason := "No available driver is online."
		if _, err := queries.CreateDispatchRecommendation(ctx, db.CreateDispatchRecommendationParams{
			OrderID: id,
			Reason:  reason,
		}); err != nil {
			return Recommendation{}, err
		}
		return Recommendation{OrderID: orderID, Reason: reason}, nil
	}
	if !driverStillAvailable(ctx, queries, choice.ID) {
		remaining := make([]Candidate, 0, len(live))
		for _, candidate := range live {
			if candidate.ID != choice.ID && driverStillAvailable(ctx, queries, candidate.ID) {
				remaining = append(remaining, candidate)
			}
		}
		choice, fallback, _ = SelectDriver(remaining, "", true)
	}
	if choice.ID == "" {
		reason := "No available driver is online."
		if _, err := queries.CreateDispatchRecommendation(ctx, db.CreateDispatchRecommendationParams{
			OrderID: id,
			Reason:  reason,
		}); err != nil {
			return Recommendation{}, err
		}
		return Recommendation{OrderID: orderID, Reason: reason}, nil
	}

	reason := choice.Name + " is available. The driver must accept the delivery."
	if choice.DistanceKM != nil {
		reason = fmt.Sprintf("%s is the nearest available driver, %.2f km from the restaurant. The driver must accept the delivery.", choice.Name, *choice.DistanceKM)
	}
	if rejected {
		reason = "The AI suggestion was rejected. " + reason
	} else if fallback {
		reason = "AI dispatch was unavailable. " + reason
	}

	driverID, err := pgutil.ParseUUID(choice.ID)
	if err != nil {
		return Recommendation{}, err
	}
	if _, err := queries.CreateDispatchRecommendation(ctx, db.CreateDispatchRecommendationParams{
		OrderID:    id,
		DriverID:   driverID,
		Reason:     reason,
		DistanceKm: floatOrEmpty(choice.DistanceKM),
	}); err != nil {
		return Recommendation{}, err
	}
	s.logs.Record(ctx, "", "DISPATCH", requestID, "find_available_drivers", true, time.Since(started), "")

	return Recommendation{
		OrderID:      orderID,
		DriverID:     choice.ID,
		DriverUserID: choice.UserID,
		DriverName:   choice.Name,
		Reason:       reason,
		DistanceKM:   choice.DistanceKM,
	}, nil
}

func rankDrivers(drivers []db.ListAvailableDriversForDispatchRow, pickupLat pgtype.Float8, pickupLng pgtype.Float8) []Candidate {
	pickupOK := pickupLat.Valid && pickupLng.Valid
	ranked := make([]Candidate, 0, len(drivers))
	unlocated := make([]Candidate, 0)
	for _, driver := range drivers {
		candidate := Candidate{
			ID:     driver.ID.String(),
			UserID: driver.UserID.String(),
			Name:   driver.Name,
			Status: "AVAILABLE",
		}
		if pickupOK && driver.CurrentLatitude.Valid && driver.CurrentLongitude.Valid {
			distance := haversineKM(pickupLat.Float64, pickupLng.Float64, driver.CurrentLatitude.Float64, driver.CurrentLongitude.Float64)
			candidate.DistanceKM = &distance
			ranked = append(ranked, candidate)
			continue
		}
		unlocated = append(unlocated, candidate)
	}
	for i := 0; i < len(ranked); i++ {
		for j := i + 1; j < len(ranked); j++ {
			if ranked[j].DistanceKM != nil && ranked[i].DistanceKM != nil && *ranked[j].DistanceKM < *ranked[i].DistanceKM {
				ranked[i], ranked[j] = ranked[j], ranked[i]
			}
		}
	}
	return append(ranked, unlocated...)
}

func toAICandidates(candidates []Candidate) []ai.Candidate {
	out := make([]ai.Candidate, 0, len(candidates))
	for _, candidate := range candidates {
		out = append(out, ai.Candidate{
			DriverID:   candidate.ID,
			Name:       candidate.Name,
			Status:     candidate.Status,
			DistanceKM: candidate.DistanceKM,
		})
	}
	return out
}

func availableNow(ctx context.Context, queries *db.Queries, candidates []Candidate) []Candidate {
	live := make([]Candidate, 0, len(candidates))
	for _, candidate := range candidates {
		if driverStillAvailable(ctx, queries, candidate.ID) {
			live = append(live, candidate)
		}
	}
	return live
}

func driverStillAvailable(ctx context.Context, queries *db.Queries, driverID string) bool {
	id, err := pgutil.ParseUUID(driverID)
	if err != nil {
		return false
	}
	driver, err := queries.GetDriverByID(ctx, id)
	return err == nil && driver.Status == "AVAILABLE"
}

func floatOrEmpty(value *float64) pgtype.Float8 {
	if value == nil {
		return pgtype.Float8{}
	}
	return pgtype.Float8{Float64: *value, Valid: true}
}

func haversineKM(lat1 float64, lng1 float64, lat2 float64, lng2 float64) float64 {
	const earth = 6371.0
	dLat := (lat2 - lat1) * math.Pi / 180
	dLng := (lng2 - lng1) * math.Pi / 180
	lat1Rad := lat1 * math.Pi / 180
	lat2Rad := lat2 * math.Pi / 180
	a := math.Sin(dLat/2)*math.Sin(dLat/2) + math.Cos(lat1Rad)*math.Cos(lat2Rad)*math.Sin(dLng/2)*math.Sin(dLng/2)
	return 2 * earth * math.Asin(math.Sqrt(a))
}
