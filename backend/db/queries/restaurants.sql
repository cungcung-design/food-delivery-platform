-- name: CreateRestaurant :one
INSERT INTO restaurants (
    owner_id,
    name,
    description,
    address_line,
    city,
    latitude,
    longitude,
    image_url,
    status
)
VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8,
    'CLOSED'
)
RETURNING *;


-- name: ListOpenRestaurants :many
SELECT *
FROM restaurants
WHERE status = 'OPEN'
ORDER BY created_at DESC;


-- name: GetRestaurantByID :one
SELECT *
FROM restaurants
WHERE id = $1
LIMIT 1;


-- name: ListRestaurantsByOwner :many
SELECT *
FROM restaurants
WHERE owner_id = $1
ORDER BY created_at DESC;


-- name: UpdateRestaurant :one
UPDATE restaurants
SET
    name = $2,
    description = $3,
    address_line = $4,
    city = $5,
    latitude = $6,
    longitude = $7,
    image_url = $8,
    updated_at = NOW()
WHERE id = $1
RETURNING *;


-- name: UpdateRestaurantStatus :one
UPDATE restaurants
SET
    status = $2,
    updated_at = NOW()
WHERE id = $1
RETURNING *;


-- name: DeleteRestaurant :exec
DELETE FROM restaurants
WHERE id = $1;
