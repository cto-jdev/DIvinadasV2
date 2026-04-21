-- =====================================================================
-- Migration: 0007_webhook_idempotency.sql
-- Adds a webhook_events table to deduplicate webhook deliveries.
-- Hotmart (and any future provider) inserts the provider event ID here
-- before processing; a unique violation means it was already handled.
-- =====================================================================

create table if not exists public.webhook_events (
    provider    text        not null,
    event_id    text        not null,
    received_at timestamptz not null default now(),
    primary key (provider, event_id)
);

-- No row-level access from client; only service_role writes here.
alter table public.webhook_events enable row level security;
