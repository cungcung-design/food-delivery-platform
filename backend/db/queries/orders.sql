-- name: CreateOrder :one
INSERT INTO orders (
    user_id,
    restaurant_id,
    delivery_address_id,
    status,
    payment_status,
    subtotal,
    delivery_fee,
    discount,
    total
)
VALUES (
    $1,
    $2,
    $3,
    'PENDING',
    'PENDING',
    $4,
    $5,
    $6,
    $7
)
RETURNING *;


-- name: CreateOrderItem :one
INSERT INTO order_items (
    order_id,
    menu_item_id,
    name_snapshot,
    price_snapshot,
    quantity,
    subtotal
)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;


-- name: GetOrderByID :one
SELECT *
FROM orders
WHERE id = $1
LIMIT 1;


-- name: ListOrdersByUser :many
SELECT *
FROM orders
WHERE user_id = $1
ORDER BY created_at DESC;


-- name: ListOrdersByOwner :many
SELECT o.*
FROM orders o
JOIN restaurants r ON r.id = o.restaurant_id
WHERE r.owner_id = $1
ORDER BY o.created_at DESC;


-- name: UpdateOrderStatus :one
UPDATE orders
SET
    status = $2,
    updated_at = NOW()
WHERE id = $1
RETURNING *;


-- name: ListOrderItems :many
SELECT *
FROM order_items
WHERE order_id = $1
ORDER BY id;
