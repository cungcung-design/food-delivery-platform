package dispatch

type Candidate struct {
	ID         string
	UserID     string
	Name       string
	DistanceKM *float64
	Status     string
}

func SelectDriver(candidates []Candidate, proposedID string, aiFailed bool) (Candidate, bool, bool) {
	available := make([]Candidate, 0, len(candidates))
	for _, candidate := range candidates {
		if candidate.Status == "AVAILABLE" {
			available = append(available, candidate)
		}
	}
	if len(available) == 0 {
		return Candidate{}, aiFailed, false
	}
	if aiFailed {
		return available[0], true, false
	}
	if proposedID != "" {
		for _, candidate := range available {
			if candidate.ID == proposedID {
				return candidate, false, false
			}
		}
		return available[0], true, true
	}
	return available[0], false, false
}
