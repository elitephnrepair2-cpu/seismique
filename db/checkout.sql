-- Run once against a dedicated sandbox PostgreSQL database; never a production ticket database.
BEGIN;
CREATE TABLE IF NOT EXISTS checkout_drafts (
 id uuid PRIMARY KEY,
 token_hash text NOT NULL,
 fingerprint text,
 revision integer NOT NULL DEFAULT 0,
 current_session text UNIQUE,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS checkout_attempts (
 session_id text PRIMARY KEY,
 checkout_id uuid NOT NULL REFERENCES checkout_drafts(id),
 revision integer NOT NULL,
 snapshot jsonb NOT NULL,
 payment_state text NOT NULL DEFAULT 'pending',
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(checkout_id, revision)
);
CREATE TABLE IF NOT EXISTS checkout_orders (
 id uuid PRIMARY KEY,
 checkout_id uuid NOT NULL UNIQUE REFERENCES checkout_drafts(id),
 session_id text NOT NULL UNIQUE REFERENCES checkout_attempts(session_id),
 payment_intent text UNIQUE,
 status text NOT NULL CHECK(status IN ('paid','refunded','disputed')),
 email text NOT NULL,
 name text NOT NULL,
 visit_date date NOT NULL,
 currency text NOT NULL,
 subtotal integer NOT NULL,
 discount integer NOT NULL,
 tax integer NOT NULL,
 total integer NOT NULL,
 paid_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS checkout_tickets (
 id uuid PRIMARY KEY,
 order_id uuid NOT NULL REFERENCES checkout_orders(id),
 ordinal integer NOT NULL,
 sku text NOT NULL,
 status text NOT NULL DEFAULT 'valid' CHECK(status IN ('valid','redeemed','void')),
 token text NOT NULL UNIQUE,
 redeemed_at timestamptz,
 UNIQUE(order_id,ordinal)
);
CREATE INDEX IF NOT EXISTS checkout_tickets_order ON checkout_tickets(order_id);
CREATE TABLE IF NOT EXISTS checkout_events (
 event_id text PRIMARY KEY,
 event_type text NOT NULL,
 processed_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS checkout_email_outbox (
 order_id uuid PRIMARY KEY REFERENCES checkout_orders(id),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sent','failed')),
 attempts integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now(),
 sent_at timestamptz
);
CREATE TABLE IF NOT EXISTS checkout_rate_limits (
 bucket text PRIMARY KEY,
 count integer NOT NULL,
 expires_at timestamptz NOT NULL
);
COMMIT;
