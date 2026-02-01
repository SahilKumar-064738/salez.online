-- ============================================================
-- AutoReply / Reachly — Full Database Schema
-- Run once against your PostgreSQL instance:
--   psql -U postgres -d reachly -f migrations.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id           SERIAL PRIMARY KEY,
    email        TEXT NOT NULL UNIQUE,
    password     TEXT NOT NULL,
    name         TEXT NOT NULL,
    company_name TEXT,
    created_at   TIMESTAMP DEFAULT NOW()
);

-- Session tokens (HttpOnly cookie auth)
CREATE TABLE IF NOT EXISTS sessions (
    token   TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS leads (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER REFERENCES users(id),
    name                TEXT NOT NULL,
    phone               TEXT NOT NULL,
    status              TEXT NOT NULL DEFAULT 'new',   -- new | interested | negotiation | paid | lost
    last_contacted_at   TIMESTAMP,
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
    id              SERIAL PRIMARY KEY,
    lead_id         INTEGER NOT NULL REFERENCES leads(id),
    status          TEXT NOT NULL DEFAULT 'waiting',  -- new | waiting | follow-up-due | replied | closed
    last_message_at TIMESTAMP DEFAULT NOW(),
    is_auto_paused  BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS messages (
    id              SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id),
    content         TEXT NOT NULL,
    direction       TEXT NOT NULL,   -- incoming | outgoing
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS templates (
    id       SERIAL PRIMARY KEY,
    user_id  INTEGER REFERENCES users(id),
    name     TEXT NOT NULL,
    content  TEXT NOT NULL,          -- supports {{name}} variables
    category TEXT NOT NULL           -- follow-up | reminder | payment
);

CREATE TABLE IF NOT EXISTS follow_up_rules (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES users(id),
    delay_hours INTEGER NOT NULL,
    template_id INTEGER NOT NULL REFERENCES templates(id),
    "order"     INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS reminders (
    id           SERIAL PRIMARY KEY,
    lead_id      INTEGER NOT NULL REFERENCES leads(id),
    message      TEXT NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    sent         BOOLEAN DEFAULT FALSE,
    type         TEXT NOT NULL DEFAULT 'follow-up',   -- follow-up | appointment | payment
    created_at   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Seed: one default business row (used by webhook handler)
-- ============================================================
CREATE TABLE IF NOT EXISTS businesses (
    id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'Default Business'
);

INSERT INTO businesses (name) VALUES ('Default Business')
ON CONFLICT DO NOTHING;
