-- name: CreateDriver :one
INSERT INTO drivers (
    user_id,
    vehicle_type,
    vehicle_number,
    status
)
VALUES ($1, $2, $3, 'OFFLINE')
RETURNING *;


-- name: GetDriverByUserID :one
SELECT *
FROM drivers
WHERE user_id = $1
LIMIT 1;


-- name: GetDriverByID :one
SELECT *
FROM drivers
WHERE id = $1
LIMIT 1;


-- name: UpdateDriverStatus :one
UPDATE drivers
SET
    status = $2,
    updated_at = NOW()
WHERE id = $1
RETURNING *;


-- name: UpdateDriverLocation :one
UPDATE drivers
SET
    current_latitude = $2,
    current_longitude = $3,
    updated_at = NOW()
WHERE id = $1
RETURNING *;


-- name: InsertDriverLocation :one
INSERT INTO driver_locations (
    driver_id,
    latitude,
    longitude
)
VALUES ($1, $2, $3)
RETURNING *;


-- name: ListRecentDriverLocations :many
SELECT *
FROM driver_locations
WHERE driver_id = $1
ORDER BY recorded_at DESC
LIMIT $2;
