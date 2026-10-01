-- name: CreateOutboxEvent :one
INSERT INTO outbox_events (
    event_type,
    aggregate_type,
    aggregate_id,
    payload
)
VALUES (
    $1,
    $2,
    $3,
    $4
)
RETURNING *;


-- name: GetPendingOutboxEvents :many
SELECT *
FROM outbox_events
WHERE status = 'PENDING'
AND available_at <= NOW()
ORDER BY created_at ASC
LIMIT $1;


-- name: MarkOutboxProcessing :execrows
UPDATE outbox_events
SET
    status = 'PROCESSING',
    attempts = attempts + 1,
    updated_at = NOW()
WHERE id = $1
AND status = 'PENDING';


-- name: MarkOutboxProcessed :exec
UPDATE outbox_events
SET
    status = 'PROCESSED',
    processed_at = NOW(),
    last_error = NULL,
    updated_at = NOW()
WHERE id = $1;


-- name: RetryOutboxEvent :exec
UPDATE outbox_events
SET
    status = 'PENDING',
    available_at = $2,
    last_error = $3,
    updated_at = NOW()
WHERE id = $1;


-- name: MarkOutboxFailed :exec
UPDATE outbox_events
SET
    status = 'FAILED',
    last_error = $2,
    updated_at = NOW()
WHERE id = $1;


-- name: RecoverStaleOutboxEvents :exec
UPDATE outbox_events
SET
    status = 'PENDING',
    available_at = NOW(),
    updated_at = NOW()
WHERE status = 'PROCESSING'
AND updated_at < NOW() - INTERVAL '5 minutes';


-- name: IsEventProcessed :one
SELECT EXISTS (
    SELECT 1
    FROM processed_events
    WHERE consumer_name = $1
    AND event_id = $2
);


-- name: MarkEventProcessed :exec
INSERT INTO processed_events (
    consumer_name,
    event_id
)
VALUES (
    $1,
    $2
)
ON CONFLICT DO NOTHING;
