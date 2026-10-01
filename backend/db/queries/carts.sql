-- name: GetCartByUser :one
SELECT *
FROM carts
WHERE user_id = $1
LIMIT 1;


-- name: LockCartByUser :one
SELECT *
FROM carts
WHERE user_id = $1
LIMIT 1
FOR UPDATE;


-- name: CreateCart :one
INSERT INTO carts (
    user_id,
    restaurant_id
)
VALUES ($1, $2)
RETURNING *;


-- name: DeleteCartByUser :exec
DELETE FROM carts
WHERE user_id = $1;


-- name: UpsertCartItem :one
INSERT INTO cart_items (
    cart_id,
    menu_item_id,
    quantity
)
VALUES ($1, $2, $3)
ON CONFLICT (cart_id, menu_item_id)
DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
RETURNING *;


-- name: UpdateCartItemQuantity :one
UPDATE cart_items
SET quantity = $3
WHERE id = $1
  AND cart_id = $2
RETURNING *;


-- name: DeleteCartItem :exec
DELETE FROM cart_items
WHERE id = $1
  AND cart_id = $2;


-- name: ListCartDetails :many
SELECT
    ci.id,
    ci.menu_item_id,
    ci.quantity,
    mi.name,
    mi.price,
    mi.is_available,
    (mi.price * ci.quantity)::numeric(10, 2) AS line_total
FROM cart_items ci
JOIN menu_items mi ON mi.id = ci.menu_item_id
WHERE ci.cart_id = $1
ORDER BY ci.id;


-- name: CartPricing :one
SELECT
    COALESCE(SUM(mi.price * ci.quantity), 0)::numeric(10, 2) AS subtotal,
    5.00::numeric(10, 2) AS delivery_fee,
    0.00::numeric(10, 2) AS discount,
    (COALESCE(SUM(mi.price * ci.quantity), 0) + 5.00)::numeric(10, 2) AS total
FROM cart_items ci
JOIN menu_items mi ON mi.id = ci.menu_item_id
WHERE ci.cart_id = $1;
