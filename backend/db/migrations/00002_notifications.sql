-- +goose Up

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    type VARCHAR(100) NOT NULL,

    title VARCHAR(255) NOT NULL,

    message TEXT NOT NULL,

    data JSONB NOT NULL
        DEFAULT '{}'::jsonb,

    is_read BOOLEAN NOT NULL
        DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    read_at TIMESTAMPTZ
);

CREATE INDEX idx_notifications_user_created
ON notifications (
    user_id,
    created_at DESC
);

CREATE INDEX idx_notifications_user_unread
ON notifications (
    user_id,
    is_read
);


-- +goose Down

DROP TABLE IF EXISTS notifications;
