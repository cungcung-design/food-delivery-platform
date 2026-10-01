-- name: CreateMenuItem :one
INSERT INTO menu_items (
    restaurant_id,
    category_id,
    name,
    description,
    price,
    image_url,
    is_available
)
VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    TRUE
)
RETURNING *;


-- name: ListMenuItemsByRestaurant :many
SELECT *
FROM menu_items
WHERE restaurant_id = $1
ORDER BY created_at DESC;


-- name: ListAvailableMenuItems :many
SELECT *
FROM menu_items
WHERE restaurant_id = $1
AND is_available = TRUE
ORDER BY created_at DESC;


-- name: GetMenuItemByID :one
SELECT *
FROM menu_items
WHERE id = $1
LIMIT 1;


-- name: UpdateMenuItem :one
UPDATE menu_items
SET
    category_id = $2,
    name = $3,
    description = $4,
    price = $5,
    image_url = $6,
    updated_at = NOW()
WHERE id = $1
RETURNING *;


-- name: UpdateMenuItemAvailability :one
UPDATE menu_items
SET
    is_available = $2,
    updated_at = NOW()
WHERE id = $1
RETURNING *;


-- name: DeleteMenuItem :exec
DELETE FROM menu_items
WHERE id = $1;
