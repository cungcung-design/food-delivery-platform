-- +goose Up

CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    order_id UUID
        REFERENCES orders(id)
        ON DELETE SET NULL,

    subject VARCHAR(255) NOT NULL,

    message TEXT NOT NULL,

    status VARCHAR(30) NOT NULL
        DEFAULT 'OPEN',

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    CONSTRAINT support_ticket_status_check
        CHECK (status IN ('OPEN', 'CLOSED'))
);

CREATE INDEX idx_support_tickets_user
ON support_tickets (user_id, created_at DESC);

CREATE TABLE dispatch_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL
        REFERENCES orders(id)
        ON DELETE CASCADE,

    driver_id UUID
        REFERENCES drivers(id)
        ON DELETE SET NULL,

    reason TEXT NOT NULL,

    distance_km DOUBLE PRECISION,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW()
);

CREATE INDEX idx_dispatch_recommendations_order
ON dispatch_recommendations (order_id, created_at DESC);


-- +goose Down

DROP TABLE IF EXISTS dispatch_recommendations;
DROP TABLE IF EXISTS support_tickets;
