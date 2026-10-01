-- name: CreateDelivery :one
INSERT INTO deliveries (
    order_id,
    status,
    pickup_latitude,
    pickup_longitude,
    dropoff_latitude,
    dropoff_longitude
)
VALUES (
    $1,
    'UNASSIGNED',
    $2,
    $3,
    $4,
    $5
)
RETURNING *;


-- name: GetDeliveryByOrderID :one
SELECT *
FROM deliveries
WHERE order_id = $1
LIMIT 1;


-- name: GetDeliveryByID :one
SELECT *
FROM deliveries
WHERE id = $1
LIMIT 1;


-- name: GetActiveDeliveryByDriver :one
SELECT *
FROM deliveries
WHERE driver_id = $1
  AND status IN ('ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY')
LIMIT 1;


-- name: ListDispatchableDeliveries :many
SELECT *
FROM deliveries d
WHERE d.status = 'UNASSIGNED'
  AND EXISTS (
      SELECT 1
      FROM orders o
      WHERE o.id = d.order_id
        AND o.status = 'READY'
  )
ORDER BY d.created_at ASC;


-- name: AssignDelivery :one
UPDATE deliveries
SET
    driver_id = $2,
    status = 'ASSIGNED',
    assigned_at = NOW(),
    updated_at = NOW()
WHERE id = $1
  AND status = 'UNASSIGNED'
RETURNING *;


-- name: UpdateDeliveryProgress :one
UPDATE deliveries
SET
    status = $2,
    picked_up_at = CASE
        WHEN $2::varchar = 'PICKED_UP' THEN NOW()
        ELSE picked_up_at
    END,
    delivered_at = CASE
        WHEN $2::varchar = 'DELIVERED' THEN NOW()
        ELSE delivered_at
    END,
    updated_at = NOW()
WHERE id = $1
  AND driver_id = $3
RETURNING *;


-- name: CancelDeliveryByOrder :exec
UPDATE deliveries
SET
    status = 'CANCELLED',
    updated_at = NOW()
WHERE order_id = $1
  AND status <> 'DELIVERED';
