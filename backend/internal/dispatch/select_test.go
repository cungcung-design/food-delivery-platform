package dispatch

import "testing"

func TestSelectDriverRejectsUnknownDriver(t *testing.T) {
	candidates := []Candidate{{ID: "driver-a", Status: "AVAILABLE"}, {ID: "driver-b", Status: "AVAILABLE"}}
	choice, fallback, rejected := SelectDriver(candidates, "missing-driver", false)
	if !fallback || !rejected {
		t.Fatalf("fallback=%v rejected=%v", fallback, rejected)
	}
	if choice.ID != "driver-a" {
		t.Fatalf("choice %s", choice.ID)
	}
}

func TestSelectDriverSkipsBusyCandidate(t *testing.T) {
	candidates := []Candidate{{ID: "driver-busy", Status: "BUSY"}, {ID: "driver-available", Status: "AVAILABLE"}}
	choice, _, rejected := SelectDriver(candidates, "driver-busy", false)
	if !rejected || choice.ID != "driver-available" {
		t.Fatalf("choice=%s rejected=%v", choice.ID, rejected)
	}
}

func TestSelectDriverFallsBackWhenAIFails(t *testing.T) {
	candidates := []Candidate{{ID: "driver-a", Status: "AVAILABLE"}}
	choice, fallback, rejected := SelectDriver(candidates, "", true)
	if !fallback || rejected || choice.ID != "driver-a" {
		t.Fatalf("choice=%s fallback=%v rejected=%v", choice.ID, fallback, rejected)
	}
}

func TestSelectDriverNoneAvailable(t *testing.T) {
	choice, fallback, _ := SelectDriver(nil, "driver-a", false)
	if fallback || choice.ID != "" {
		t.Fatalf("choice=%s fallback=%v", choice.ID, fallback)
	}
}
