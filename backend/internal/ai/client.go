package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

type PlanRequest struct {
	Agent            string      `json:"agent"`
	Message          string      `json:"message,omitempty"`
	OrderID          string      `json:"order_id,omitempty"`
	Candidates       []Candidate `json:"candidates,omitempty"`
	ProposedDriverID string      `json:"proposed_driver_id,omitempty"`
}

type Candidate struct {
	DriverID   string   `json:"driver_id"`
	Name       string   `json:"name,omitempty"`
	Status     string   `json:"status"`
	DistanceKM *float64 `json:"distance_km,omitempty"`
}

type PlanResponse struct {
	Tools     []string `json:"tools"`
	DriverID  string   `json:"driver_id"`
	Output    string   `json:"output"`
	Fallback  bool     `json:"fallback"`
	RequestID string   `json:"request_id"`
}

type Client struct {
	baseURL  string
	client   *http.Client
	dispatch *http.Client
}

func NewClient(baseURL string) *Client {
	if baseURL == "" {
		baseURL = os.Getenv("AI_SERVICE_URL")
	}
	if baseURL == "" {
		baseURL = "http://127.0.0.1:8090"
	}
	return &Client{
		baseURL: baseURL,
		client: &http.Client{
			Timeout: 20 * time.Second,
		},
		dispatch: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

func (c *Client) Plan(ctx context.Context, request PlanRequest) (PlanResponse, error) {
	if c == nil {
		return PlanResponse{}, fmt.Errorf("ai client is not configured")
	}
	body, err := json.Marshal(request)
	if err != nil {
		return PlanResponse{}, err
	}
	httpClient := c.client
	if request.Agent == "dispatch" {
		httpClient = c.dispatch
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+"/v1/plan", bytes.NewReader(body))
	if err != nil {
		return PlanResponse{}, err
	}
	req.Header.Set("Content-Type", "application/json")
	response, err := httpClient.Do(req)
	if err != nil {
		return PlanResponse{}, err
	}
	defer response.Body.Close()
	payload, err := io.ReadAll(io.LimitReader(response.Body, 1<<20))
	if err != nil {
		return PlanResponse{}, err
	}
	if response.StatusCode != http.StatusOK {
		return PlanResponse{}, fmt.Errorf("ai service returned %d", response.StatusCode)
	}
	var plan PlanResponse
	if err := json.Unmarshal(payload, &plan); err != nil {
		return PlanResponse{}, err
	}
	return plan, nil
}

func (c *Client) Healthy(ctx context.Context) bool {
	if c == nil {
		return false
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL+"/health", nil)
	if err != nil {
		return false
	}
	response, err := c.dispatch.Do(req)
	if err != nil {
		return false
	}
	defer response.Body.Close()
	return response.StatusCode == http.StatusOK
}
