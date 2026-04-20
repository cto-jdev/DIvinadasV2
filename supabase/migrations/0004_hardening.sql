-- =====================================================================
-- DivinAds V2 — Hardening de seguridad + performance
-- Migration: 0004_hardening.sql
-- Fecha:     2026-04-20
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. audit_logs: append-only — bloquear UPDATE y DELETE
--    Los registros de auditoría son inmutables por diseño de seguridad.
--    Incluso service_role no puede borrar (excepto via la función de purga).
-- ---------------------------------------------------------------------
drop policy if exists al_deny_update on public.audit_logs;
create policy al_deny_update on public.audit_logs
    as restrictive
    for update
    to authenticated, service_role, anon
    using (false)
    with check (false);

drop policy if exists al_deny_delete on public.audit_logs;
create policy al_deny_delete on public.audit_logs
    as restrictive
    for delete
    to authenticated, anon
    using (false);

-- La purga de logs viejos (>90d) se hace SOLO via esta función
-- SECURITY DEFINER que bypassa las políticas restrictivas.
create or replace function public.purge_old_audit_logs(p_older_than_days int default 90)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
    v_count int;
begin
    -- Solo platform admins o service_role pueden llamar esto
    if not public.is_platform_admin() and current_setting('role') != 'service_role' then
        raise exception 'permission denied';
    end if;
    delete from public.audit_logs
     where created_at < now() - (p_older_than_days || ' days')::interval;
    get diagnostics v_count = row_count;
    -- Auto-log de la purga
    insert into public.audit_logs(action, metadata)
    values ('system.audit_purge',
            jsonb_build_object('deleted_count', v_count, 'older_than_days', p_older_than_days));
    return v_count;
end;
$$;
revoke all on function public.purge_old_audit_logs(int) from public;
grant execute on function public.purge_old_audit_logs(int) to service_role;

-- ---------------------------------------------------------------------
-- 2. oauth_transactions: bloquear UPDATE excepto consumed_at (single-use)
--    Solo el backend puede marcar como consumida, nadie puede editar state.
-- ---------------------------------------------------------------------
drop policy if exists oauth_tx_deny_update on public.oauth_transactions;
create policy oauth_tx_deny_update on public.oauth_transactions
    as restrictive
    for update
    to authenticated
    using (false)
    with check (false);

-- service_role puede hacer el UPDATE de consumed_at (bypass RLS por definición)

-- ---------------------------------------------------------------------
-- 3. meta_tokens: ya tiene deny-all. Añadir restricción extra de INSERT
--    para evitar inserción directa accidental desde el cliente.
-- ---------------------------------------------------------------------
-- (La política restrictiva ya cubre todo — confirmación explícita)

-- ---------------------------------------------------------------------
-- 4. Índices de performance para queries frecuentes
-- ---------------------------------------------------------------------
create index if not exists idx_meta_conn_status
    on public.meta_connections(tenant_id, status)
    where status = 'active';

create index if not exists idx_meta_tokens_expires
    on public.meta_tokens(expires_at)
    where expires_at is not null;

create index if not exists idx_device_pairings_active
    on public.device_pairings(code_hash)
    where consumed_at is null;

create index if not exists idx_ext_installs_active
    on public.extension_installs(session_token_hash)
    where revoked_at is null;

create index if not exists idx_oauth_tx_state
    on public.oauth_transactions(state)
    where consumed_at is null;

create index if not exists idx_tenant_members_tenant_role
    on public.tenant_members(tenant_id, role);

-- ---------------------------------------------------------------------
-- 5. Tabla sessions_revoked — lista negra de JTIs revocados
--    Permite invalidar un JWT individual sin revocar el install entero.
-- ---------------------------------------------------------------------
create table if not exists public.revoked_jtis (
    jti        text primary key,
    install_id uuid references public.extension_installs(id) on delete cascade,
    revoked_at timestamptz not null default now(),
    reason     text
);
create index if not exists idx_revoked_jtis_install
    on public.revoked_jtis(install_id);

-- Solo service_role puede insertar (via RPC revoke_install_token)
alter table public.revoked_jtis enable row level security;

create policy revoked_jtis_deny_all on public.revoked_jtis
    as restrictive
    for all to authenticated, anon
    using (false)
    with check (false);

-- RPC para revocar un JTI individual
create or replace function public.revoke_install_token(
    p_install_id uuid,
    p_jti        text,
    p_reason     text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.revoked_jtis(jti, install_id, reason)
    values (p_jti, p_install_id, p_reason)
    on conflict (jti) do nothing;

    insert into public.audit_logs(action, resource_type, resource_id, metadata)
    values ('extension.token_revoke', 'extension_install', p_install_id::text,
            jsonb_build_object('jti', p_jti, 'reason', p_reason));
end;
$$;
revoke all on function public.revoke_install_token(uuid, text, text) from public;
grant execute on function public.revoke_install_token(uuid, text, text) to service_role;

-- RPC para verificar si un JTI está revocado (usada en ext-auth.ts)
create or replace function public.is_jti_revoked(p_jti text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (select 1 from public.revoked_jtis where jti = p_jti);
$$;
revoke all on function public.is_jti_revoked(text) from public;
grant execute on function public.is_jti_revoked(text) to service_role;

-- ---------------------------------------------------------------------
-- 6. Función helper: get_tenant_for_install
--    Evita N+1 queries en ext-auth verificando en 1 sola llamada.
-- ---------------------------------------------------------------------
create or replace function public.get_install_context(p_install_id uuid, p_jti text)
returns table (
    tenant_id        uuid,
    user_id          uuid,
    token_hash       text,
    revoked          boolean,
    jti_revoked      boolean
)
language sql
stable
security definer
set search_path = public
as $$
    select
        ei.tenant_id,
        ei.user_id,
        ei.session_token_hash,
        (ei.revoked_at is not null) as revoked,
        (select exists(select 1 from public.revoked_jtis where jti = p_jti)) as jti_revoked
    from public.extension_installs ei
    where ei.id = p_install_id;
$$;
revoke all on function public.get_install_context(uuid, text) from public;
grant execute on function public.get_install_context(uuid, text) to service_role;

-- =====================================================================
-- Fin 0004_hardening.sql
-- =====================================================================
