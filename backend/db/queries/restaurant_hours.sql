-- name: ListRestaurantHours :many
SELECT *
FROM restaurant_hours
WHERE restaurant_id = $1
ORDER BY day_of_week;


-- name: DeleteRestaurantHours :exec
DELETE FROM restaurant_hours
WHERE restaurant_id = $1;


-- name: CreateRestaurantHours :one
INSERT INTO restaurant_hours (
    restaurant_id,
    day_of_week,
    open_time,
    close_time
)
VALUES (
    $1,
    $2,
    $3,
    $4
)
RETURNING *;
