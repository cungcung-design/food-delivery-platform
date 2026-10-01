-- +goose Up

CREATE TABLE ai_request_logs (
    id UUID PRIMARY KEY
        DEFAULT gen_random_uuid(),

    user_id UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    agent_type VARCHAR(30) NOT NULL,

    request_id VARCHAR(100),

    tool_name VARCHAR(100),

    tool_success BOOLEAN,

    latency_ms BIGINT,

    error_message TEXT,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    CONSTRAINT ai_agent_type_check
        CHECK (
            agent_type IN (
                'SUPPORT',
                'DISPATCH',
                'OPERATIONS'
            )
        )
);

CREATE INDEX idx_ai_request_logs_agent
ON ai_request_logs(agent_type);

CREATE INDEX idx_ai_request_logs_created
ON ai_request_logs(created_at DESC);

CREATE INDEX idx_ai_request_logs_user
ON ai_request_logs(user_id);


-- +goose Down

DROP TABLE IF EXISTS ai_request_logs;
