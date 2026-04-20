-- =====================================================================
-- DivinAds V2 — Schema inicial (multi-tenant SaaS)
-- Migration: 0001_init.sql
-- Target:    Supabase Postgres 15 + pgcrypto + pgjwt
-- Contexto:  MIGRATION_V2.md §10 (Modelo de datos)
-- =====================================================================
-- Notas:
--  * Todas las tablas llevan tenant_id salvo las globales (profiles,
--    feature_flags, audit_logs_global, licenses_plans).
--  * Los timestamps son timestamptz (UTC).
--  * Los secretos de Meta (tokens OAuth) se cifran con pgp_sym_encrypt
--    usando una clave que vive en Supabase Vault (ref: vault.decrypted_secrets).
--  * RLS se habilita en 0002_rls_policies.sql — aquí solo DDL.
-- =====================================================================

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";
create extension if not exists "citext";

-- ---------------------------------------------------------------------
-- 1. profiles — extiende auth.users (1:1)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
    id              uuid primary key references auth.users(id) on delete cascade,
    email           citext not null unique,
    full_name       text,
    avatar_url      text,
    locale          text default 'es',
    is_platform_admin boolean not null default false,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. tenants — cada cliente/agencia es un tenant
-- ---------------------------------------------------------------------
create table if not exists public.tenants (
    id              uuid primary key default gen_random_uuid(),
    slug            citext not null unique,
    display_name    text not null,
    owner_id        uuid not null references public.profiles(id),
    status          text not null default 'active'
                    check (status in ('active','suspended','deleted')),
    settings        jsonb not null default '{}'::jsonb,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. tenant_members — membresías + roles (owner/admin/operator/viewer)
-- ---------------------------------------------------------------------
create table if not exists public.tenant_members (
    tenant_id       uuid not null references public.tenants(id) on delete cascade,
    user_id         uuid not null references public.profiles(id) on delete cascade,
    role            text not null default 'viewer'
                    check (role in ('owner','admin','operator','viewer')),
    invited_by      uuid references public.profiles(id),
    joined_at       timestamptz not null default now(),
    primary key (tenant_id, user_id)
);
create index if not exists idx_tenant_members_user on public.tenant_members(user_id);

-- ---------------------------------------------------------------------
-- 4. licenses — plan comercial por tenant (Trial/Starter/Pro/Enterprise)
-- ---------------------------------------------------------------------
create table if not exists public.licenses (
    id              uuid primary key default gen_random_uuid(),
    tenant_id       uuid not null unique references public.tenants(id) on delete cascade,
    plan            text not null default 'trial'
                    check (plan in ('trial','starter','pro','enterprise')),
    status          text not null default 'active'
                    check (status in ('active','past_due','canceled','expired')),
    seats           integer not null default 1 check (seats >= 1),
    trial_ends_at   timestamptz,
    current_period_ends_at timestamptz,
    stripe_customer_id text,
    stripe_subscription_id text,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 5. feature_flags — flags globales + overrides por tenant
-- ---------------------------------------------------------------------
create table if not exists public.feature_flags (
    key             text primary key,
    description     text,
    default_enabled boolean not null default false,
    created_at      timestamptz not null default now()
);

create table if not exists public.tenant_feature_flags (
    tenant_id       uuid not null references public.tenants(id) on delete cascade,
    key             text not null references public.feature_flags(key) on delete cascade,
    enabled         boolean not null,
    primary key (tenant_id, key)
);

-- ---------------------------------------------------------------------
-- 6. oauth_transactions — state firmado + PKCE del inicio OAuth
-- ---------------------------------------------------------------------
create table if not exists public.oauth_transactions (
    id              uuid primary key default gen_random_uuid(),
    tenant_id       uuid not null references public.tenants(id) on delete cascade,
    user_id         uuid not null references public.profiles(id),
    state           text not null unique,            -- nonce firmado HMAC
    code_verifier   text,                            -- PKCE (opcional)
    redirect_uri    text not null,
    scopes          text[] not null,
    created_at      timestamptz not null default now(),
    expires_at      timestamptz not null,            -- +10 min
    consumed_at     timestamptz                      -- null hasta canje
);
create index if not exists idx_oauth_tx_tenant on public.oauth_transactions(tenant_id);
create index if not exists idx_oauth_tx_expires on public.oauth_transactions(expires_at);

-- ---------------------------------------------------------------------
-- 7. meta_connections — 1 fila por cuenta Meta conectada al tenant
-- ---------------------------------------------------------------------
create table if not exists public.meta_connections (
    id              uuid primary key default gen_random_uuid(),
    tenant_id       uuid not null references public.tenants(id) on delete cascade,
    meta_user_id    text not null,                   -- FB user id
    display_name    text,
    email           citext,
    picture_url     text,
    status          text not null default 'active'
                    check (status in ('active','revoked','expired','error')),
    connected_by    uuid not null references public.profiles(id),
    connected_at    timestamptz not null default now(),
    last_refreshed_at timestamptz,
    revoked_at      timestamptz,
    unique (tenant_id, meta_user_id)
);
create index if not exists idx_meta_conn_tenant on public.meta_connections(tenant_id);

-- ---------------------------------------------------------------------
-- 8. meta_tokens — tokens cifrados (access + refresh opcional)
--      * access_token_enc se cifra con pgp_sym_encrypt(token, vault_key)
--      * NUNCA se selecciona directamente desde el cliente (RLS lo veta).
--        El backend lo lee vía RPC SECURITY DEFINER get_meta_token(conn_id).
-- ---------------------------------------------------------------------
create table if not exists public.meta_tokens (
    connection_id   uuid primary key references public.meta_connections(id) on delete cascade,
    access_token_enc bytea not null,
    token_type      text not null default 'bearer',
    scopes          text[] not null,
    expires_at      timestamptz,                     -- ~60 días
    issued_at       timestamptz not null default now(),
    rotation_count  integer not null default 0
);

-- ---------------------------------------------------------------------
-- 9. device_pairings — códigos 6 dígitos para emparejar la extensión
--      * Un código se genera al clicar "Conectar extensión" en el panel.
--      * TTL = 5 min; single-use; scoped a user_id + tenant_id.
-- ---------------------------------------------------------------------
create table if not exists public.device_pairings (
    id              uuid primary key default gen_random_uuid(),
    tenant_id       uuid not null references public.tenants(id) on delete cascade,
    user_id         uuid not null references public.profiles(id),
    code_hash       text not null unique,            -- sha256 del código
    created_at      timestamptz not null default now(),
    expires_at      timestamptz not null,            -- +5 min
    consumed_at     timestamptz,
    consumed_by_install uuid                          -- FK se añade abajo
);
create index if not exists idx_pairings_expires on public.device_pairings(expires_at);

-- ---------------------------------------------------------------------
-- 10. extension_installs — sesión persistente del Chrome MV3
-- ---------------------------------------------------------------------
create table if not exists public.extension_installs (
    id              uuid primary key default gen_random_uuid(),
    tenant_id       uuid not null references public.tenants(id) on delete cascade,
    user_id         uuid not null references public.profiles(id),
    label           text,                            -- "Laptop de Andrés"
    user_agent      text,
    session_token_hash text not null unique,         -- sha256 del JWT/opaque
    created_at      timestamptz not null default now(),
    last_seen_at    timestamptz,
    revoked_at      timestamptz
);
create index if not exists idx_installs_tenant on public.extension_installs(tenant_id);

-- Cerrar FK circular pairing → install
alter table public.device_pairings
    add constraint device_pairings_install_fk
    foreign key (consumed_by_install)
    references public.extension_installs(id)
    on delete set null;

-- ---------------------------------------------------------------------
-- 11. audit_logs — trazabilidad de acciones sensibles
-- ---------------------------------------------------------------------
create table if not exists public.audit_logs (
    id              uuid primary key default gen_random_uuid(),
    tenant_id       uuid references public.tenants(id) on delete set null,
    actor_user_id   uuid references public.profiles(id),
    actor_install_id uuid references public.extension_installs(id),
    action          text not null,                   -- e.g. meta.connect, bm.list
    resource_type   text,                            -- meta_connection, bm, ad_account
    resource_id     text,
    metadata        jsonb not null default '{}'::jsonb,
    ip              inet,
    user_agent      text,
    created_at      timestamptz not null default now()
);
create index if not exists idx_audit_tenant on public.audit_logs(tenant_id, created_at desc);
create index if not exists idx_audit_action on public.audit_logs(action);

-- =====================================================================
-- Trigger: mantener updated_at en mutaciones
-- =====================================================================
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at := now();
    return new;
end;$$;

do $$
declare t text;
begin
    for t in select unnest(array[
        'profiles','tenants','licenses'
    ]) loop
        execute format('drop trigger if exists trg_%I_updated_at on public.%I', t, t);
        execute format('create trigger trg_%I_updated_at before update on public.%I
                        for each row execute function public.tg_set_updated_at()', t, t);
    end loop;
end$$;

-- =====================================================================
-- Trigger: al crear un auth.user → crear profile
-- =====================================================================
create or replace function public.tg_handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
    insert into public.profiles (id, email, full_name, avatar_url)
    values (
        new.id,
        coalesce(new.email, new.raw_user_meta_data->>'email'),
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
    )
    on conflict (id) do nothing;
    return new;
end;$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
    after insert on auth.users
    for each row execute function public.tg_handle_new_user();

-- =====================================================================
-- RPC: get_meta_token(conn_id uuid) — descifra token solo para el backend.
-- SECURITY DEFINER + GRANT a service_role exclusivamente.
-- =====================================================================
create or replace function public.get_meta_token(p_connection_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
    v_tenant uuid;
    v_token text;
    v_key text;
begin
    -- Recuperar clave desde Supabase Vault (configurada fuera de esta migración)
    select decrypted_secret into v_key
      from vault.decrypted_secrets
     where name = 'meta_token_encryption_key'
     limit 1;

    if v_key is null then
        raise exception 'vault key missing: meta_token_encryption_key';
    end if;

    select c.tenant_id,
           pgp_sym_decrypt(t.access_token_enc, v_key)
      into v_tenant, v_token
      from public.meta_tokens t
      join public.meta_connections c on c.id = t.connection_id
     where t.connection_id = p_connection_id;

    if v_token is null then
        raise exception 'token not found';
    end if;

    -- Audit
    insert into public.audit_logs(tenant_id, action, resource_type, resource_id, metadata)
    values (v_tenant, 'meta.token.read', 'meta_connection', p_connection_id::text,
            jsonb_build_object('via','rpc'));

    return v_token;
end;$$;

revoke all on function public.get_meta_token(uuid) from public;
grant execute on function public.get_meta_token(uuid) to service_role;

-- =====================================================================
-- Seeds mínimos (flags por defecto)
-- =====================================================================
insert into public.feature_flags (key, description, default_enabled) values
    ('bm.module',         'Módulo Business Managers',        true),
    ('ads.module',        'Módulo Cuentas publicitarias',    true),
    ('pages.module',      'Módulo Páginas',                  true),
    ('pixel.module',      'Módulo Pixels',                   true),
    ('advantage.module',  'Módulo Advantage+',               false),
    ('attribution.module','Módulo Attribution',              false)
on conflict (key) do nothing;

-- =====================================================================
-- Fin 0001_init.sql
-- =====================================================================
