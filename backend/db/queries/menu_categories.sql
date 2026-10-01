-- name: CreateMenuCategory :one
INSERT INTO menu_categories (
    restaurant_id,
    name
)
VALUES ($1, $2)
RETURNING *;


-- name: ListMenuCategories :many
SELECT *
FROM menu_categories
WHERE restaurant_id = $1
ORDER BY created_at ASC;


-- name: GetMenuCategoryByID :one
SELECT *
FROM menu_categories
WHERE id = $1
LIMIT 1;


-- name: UpdateMenuCategory :one
UPDATE menu_categories
SET name = $2
WHERE id = $1
RETURNING *;


-- name: DeleteMenuCategory :exec
DELETE FROM menu_categories
WHERE id = $1;
