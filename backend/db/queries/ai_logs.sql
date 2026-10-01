-- name: CreateAIRequestLog :exec
INSERT INTO ai_request_logs (
    user_id,
    agent_type,
    request_id,
    tool_name,
    tool_success,
    latency_ms,
    error_message
)
VALUES ($1, $2, $3, $4, $5, $6, $7);
