-- +goose Up

CREATE TABLE outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    event_type VARCHAR(100) NOT NULL,

    aggregate_type VARCHAR(100) NOT NULL,

    aggregate_id UUID NOT NULL,

    payload JSONB NOT NULL,

    status VARCHAR(30) NOT NULL
        DEFAULT 'PENDING',

    attempts INTEGER NOT NULL
        DEFAULT 0,

    available_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    processed_at TIMESTAMPTZ,

    last_error TEXT,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    CONSTRAINT outbox_status_check
        CHECK (
            status IN (
                'PENDING',
                'PROCESSING',
                'PROCESSED',
                'FAILED'
            )
        )
);

CREATE INDEX idx_outbox_pending
ON outbox_events (
    status,
    available_at,
    created_at
);

CREATE TABLE processed_events (
    consumer_name VARCHAR(100) NOT NULL,

    event_id UUID NOT NULL,

    processed_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    PRIMARY KEY (
        consumer_name,
        event_id
    )
);


-- +goose Down

DROP TABLE IF EXISTS processed_events;
DROP TABLE IF EXISTS outbox_events;
