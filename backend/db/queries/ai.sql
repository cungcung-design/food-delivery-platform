-- name: CreateSupportTicket :one
INSERT INTO support_tickets (
    user_id,
    order_id,
    subject,
    message
)
VALUES ($1, $2, $3, $4)
RETURNING *;


-- name: ListSupportTicketsByUser :many
SELECT *
FROM support_tickets
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 20;


-- name: ListAvailableDriversForDispatch :many
SELECT
    d.id,
    d.user_id,
    u.name,
    d.current_latitude,
    d.current_longitude
FROM drivers d
JOIN users u ON u.id = d.user_id
WHERE d.status = 'AVAILABLE';


-- name: CreateDispatchRecommendation :one
INSERT INTO dispatch_recommendations (
    order_id,
    driver_id,
    reason,
    distance_km
)
VALUES ($1, $2, $3, $4)
RETURNING *;


-- name: ListDispatchRecommendations :many
SELECT *
FROM dispatch_recommendations
ORDER BY created_at DESC
LIMIT 20;


-- name: ListOpenOrders :many
SELECT
    o.id,
    o.status,
    o.created_at,
    o.updated_at,
    o.restaurant_id,
    r.name AS restaurant_name,
    d.status AS delivery_status
FROM orders o
JOIN restaurants r ON r.id = o.restaurant_id
LEFT JOIN deliveries d ON d.order_id = o.id
WHERE o.status NOT IN ('DELIVERED', 'CANCELLED', 'REJECTED')
ORDER BY o.updated_at ASC;
