package notification

import (
	"encoding/json"
	"time"

	db "github.com/cungcung-design/food-delivery-platform/backend/db/generated"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/pgutil"
)

type notificationJSON struct {
	ID        string          `json:"id"`
	Type      string          `json:"type"`
	Title     string          `json:"title"`
	Message   string          `json:"message"`
	Data      json.RawMessage `json:"data"`
	IsRead    bool            `json:"is_read"`
	CreatedAt string          `json:"created_at"`
	ReadAt    *string         `json:"read_at"`
}

func toNotification(item db.Notification) notificationJSON {
	data := json.RawMessage(item.Data)
	if len(data) == 0 || !json.Valid(data) {
		data = json.RawMessage(`{}`)
	}

	var readAt *string
	if item.ReadAt.Valid {
		text := item.ReadAt.Time.UTC().Format(time.RFC3339)
		readAt = &text
	}

	return notificationJSON{
		ID:        item.ID.String(),
		Type:      item.Type,
		Title:     item.Title,
		Message:   item.Message,
		Data:      data,
		IsRead:    item.IsRead,
		CreatedAt: pgutil.Timestamp(item.CreatedAt),
		ReadAt:    readAt,
	}
}

func toNotifications(items []db.Notification) []notificationJSON {
	out := make([]notificationJSON, 0, len(items))
	for _, item := range items {
		out = append(out, toNotification(item))
	}
	return out
}
