-- name: CreateNotification :one
INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data
)
VALUES (
    $1,
    $2,
    $3,
    $4,
    $5
)
RETURNING *;


-- name: ListNotificationsByUser :many
SELECT *
FROM notifications
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;


-- name: CountUnreadNotifications :one
SELECT COUNT(*)
FROM notifications
WHERE user_id = $1
AND is_read = FALSE;


-- name: MarkNotificationRead :one
UPDATE notifications
SET
    is_read = TRUE,
    read_at = COALESCE(
        read_at,
        NOW()
    )
WHERE id = $1
AND user_id = $2
RETURNING *;


-- name: MarkAllNotificationsRead :exec
UPDATE notifications
SET
    is_read = TRUE,
    read_at = COALESCE(
        read_at,
        NOW()
    )
WHERE user_id = $1
AND is_read = FALSE;
