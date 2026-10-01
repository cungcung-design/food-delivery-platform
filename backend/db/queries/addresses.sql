-- name: CreateAddress :one
INSERT INTO addresses (
    user_id,
    label,
    address_line,
    city,
    postal_code,
    latitude,
    longitude
)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;


-- name: ListAddressesByUser :many
SELECT *
FROM addresses
WHERE user_id = $1
ORDER BY created_at DESC;


-- name: GetAddressByID :one
SELECT *
FROM addresses
WHERE id = $1
LIMIT 1;
