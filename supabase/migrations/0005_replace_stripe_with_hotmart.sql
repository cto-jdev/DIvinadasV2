-- =============================================================================
-- 0005 — Reemplazar columnas Stripe por columnas Hotmart en tabla licenses
-- =============================================================================
-- Hotmart es la plataforma de pagos adoptada en lugar de Stripe.
-- Campos:
--   hotmart_buyer_code       → identificador único del comprador en Hotmart
--   hotmart_subscription_code → identificador de la suscripción activa
-- =============================================================================

alter table public.licenses
    rename column stripe_customer_id       to hotmart_buyer_code;

alter table public.licenses
    rename column stripe_subscription_id   to hotmart_subscription_code;

-- Índice para búsqueda por subscription code (webhook lookup)
create index if not exists idx_licenses_hotmart_sub
    on public.licenses(hotmart_subscription_code)
    where hotmart_subscription_code is not null;

-- Índice para búsqueda por buyer code (historial de compras)
create index if not exists idx_licenses_hotmart_buyer
    on public.licenses(hotmart_buyer_code)
    where hotmart_buyer_code is not null;
