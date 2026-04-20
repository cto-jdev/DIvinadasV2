-- =====================================================================
-- DivinAds V2 — Row Level Security
-- Migration: 0002_rls_policies.sql
-- Contexto:  MIGRATION_V2.md §11 (Políticas RLS)
-- Principio: Cero confianza. Toda tabla con tenant_id exige membresía.
--            Las tablas con secretos (meta_tokens) se acceden vía RPC.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Helpers (SECURITY DEFINER, invocables desde policies)
-- ---------------------------------------------------------------------
create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = public as $$
    select coalesce(
        (select is_platform_admin from public.profiles where id = auth.uid()),
        false
    );
$$;

create or replace function public.is_tenant_member(p_tenant uuid)
returns boolean language sql stable security definer set search_path = public as $$
    select exists (
        select 1 from public.tenant_members
         where tenant_id = p_tenant
           and user_id   = auth.uid()
    );
$$;

create or replace function public.tenant_role(p_tenant uuid)
returns text language sql stable security definer set search_path = public as $$
    select role from public.tenant_members
     where tenant_id = p_tenant
       and user_id   = auth.uid();
$$;

create or replace function public.is_tenant_admin(p_tenant uuid)
returns boolean language sql stable security definer set search_path = public as $$
    select public.tenant_role(p_tenant) in ('owner','admin');
$$;

grant execute on function public.is_platform_admin() to authenticated, anon;
grant execute on function public.is_tenant_member(uuid) to authenticated;
grant execute on function public.tenant_role(uuid) to authenticated;
grant execute on function public.is_tenant_admin(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- Enable RLS en todas las tablas del esquema public (excepto tablas
-- globales explícitas)
-- ---------------------------------------------------------------------
alter table public.profiles             enable row level security;
alter table public.tenants              enable row level security;
alter table public.tenant_members       enable row level security;
alter table public.licenses             enable row level security;
alter table public.feature_flags        enable row level security;
alter table public.tenant_feature_flags enable row level security;
alter table public.oauth_transactions   enable row level security;
alter table public.meta_connections     enable row level security;
alter table public.meta_tokens          enable row level security;
alter table public.device_pairings      enable row level security;
alter table public.extension_installs   enable row level security;
alter table public.audit_logs           enable row level security;

-- =====================================================================
-- profiles
--  * Cada usuario ve/actualiza su propio profile.
--  * Platform admins pueden ver todos.
-- =====================================================================
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
    for select to authenticated
    using (id = auth.uid() or public.is_platform_admin());

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
    for update to authenticated
    using (id = auth.uid())
    with check (id = auth.uid());

-- =====================================================================
-- tenants
--  * Miembros del tenant lo ven.
--  * Solo el owner (o admin) puede actualizarlo.
--  * Crear tenant: cualquier usuario autenticado (se auto-asigna owner
--    vía trigger/endpoint, no desde SQL).
-- =====================================================================
drop policy if exists tenants_member_select on public.tenants;
create policy tenants_member_select on public.tenants
    for select to authenticated
    using (public.is_tenant_member(id) or public.is_platform_admin());

drop policy if exists tenants_admin_update on public.tenants;
create policy tenants_admin_update on public.tenants
    for update to authenticated
    using (public.is_tenant_admin(id))
    with check (public.is_tenant_admin(id));

drop policy if exists tenants_insert_any on public.tenants;
create policy tenants_insert_any on public.tenants
    for insert to authenticated
    with check (owner_id = auth.uid());

-- =====================================================================
-- tenant_members
--  * Miembros ven la lista de su tenant.
--  * Solo owner/admin insertan/borran; el owner no puede auto-removerse
--    (enforce en backend).
-- =====================================================================
drop policy if exists tm_member_select on public.tenant_members;
create policy tm_member_select on public.tenant_members
    for select to authenticated
    using (public.is_tenant_member(tenant_id) or public.is_platform_admin());

drop policy if exists tm_admin_write on public.tenant_members;
create policy tm_admin_write on public.tenant_members
    for all to authenticated
    using (public.is_tenant_admin(tenant_id))
    with check (public.is_tenant_admin(tenant_id));

-- =====================================================================
-- licenses
--  * Lectura: miembros. Escritura: solo service_role (Stripe webhooks).
-- =====================================================================
drop policy if exists lic_member_select on public.licenses;
create policy lic_member_select on public.licenses
    for select to authenticated
    using (public.is_tenant_member(tenant_id) or public.is_platform_admin());

-- (sin policy de INSERT/UPDATE/DELETE → bloqueado para clientes; service_role bypassa RLS)

-- =====================================================================
-- feature_flags (global) — lectura pública, escritura solo admin
-- =====================================================================
drop policy if exists ff_read_all on public.feature_flags;
create policy ff_read_all on public.feature_flags
    for select to authenticated using (true);

drop policy if exists ff_admin_write on public.feature_flags;
create policy ff_admin_write on public.feature_flags
    for all to authenticated
    using (public.is_platform_admin())
    with check (public.is_platform_admin());

-- tenant_feature_flags — miembros leen, admins del tenant escriben
drop policy if exists tff_read on public.tenant_feature_flags;
create policy tff_read on public.tenant_feature_flags
    for select to authenticated
    using (public.is_tenant_member(tenant_id));

drop policy if exists tff_write on public.tenant_feature_flags;
create policy tff_write on public.tenant_feature_flags
    for all to authenticated
    using (public.is_tenant_admin(tenant_id))
    with check (public.is_tenant_admin(tenant_id));

-- =====================================================================
-- oauth_transactions
--  * Solo el owner de la tx (user_id) la ve mientras está viva.
--  * Service_role maneja la escritura desde los endpoints.
-- =====================================================================
drop policy if exists oauth_tx_owner_select on public.oauth_transactions;
create policy oauth_tx_owner_select on public.oauth_transactions
    for select to authenticated
    using (user_id = auth.uid());

-- =====================================================================
-- meta_connections
--  * Miembros del tenant ven sus conexiones.
--  * Admins pueden revocar (update/delete); operators pueden conectar.
-- =====================================================================
drop policy if exists mc_member_select on public.meta_connections;
create policy mc_member_select on public.meta_connections
    for select to authenticated
    using (public.is_tenant_member(tenant_id));

drop policy if exists mc_admin_update on public.meta_connections;
create policy mc_admin_update on public.meta_connections
    for update to authenticated
    using (public.is_tenant_admin(tenant_id))
    with check (public.is_tenant_admin(tenant_id));

drop policy if exists mc_admin_delete on public.meta_connections;
create policy mc_admin_delete on public.meta_connections
    for delete to authenticated
    using (public.is_tenant_admin(tenant_id));

-- =====================================================================
-- meta_tokens — NINGÚN acceso para authenticated/anon.
--   Solo service_role (que bypassa RLS) o la RPC get_meta_token().
--   Política restrictiva defensiva: deniega TODO a usuarios finales.
-- =====================================================================
drop policy if exists mt_deny_all on public.meta_tokens;
create policy mt_deny_all on public.meta_tokens
    as restrictive
    for all to authenticated, anon
    using (false)
    with check (false);

-- =====================================================================
-- device_pairings
--  * El usuario que generó el código lo ve (select).
--  * El consumo (update consumed_at) lo hace service_role vía endpoint.
-- =====================================================================
drop policy if exists dp_owner_select on public.device_pairings;
create policy dp_owner_select on public.device_pairings
    for select to authenticated
    using (user_id = auth.uid());

drop policy if exists dp_owner_insert on public.device_pairings;
create policy dp_owner_insert on public.device_pairings
    for insert to authenticated
    with check (user_id = auth.uid() and public.is_tenant_member(tenant_id));

-- =====================================================================
-- extension_installs
--  * Miembros ven los installs de su tenant.
--  * El propio usuario puede revocar su install; admins pueden revocar
--    cualquiera del tenant.
-- =====================================================================
drop policy if exists ei_member_select on public.extension_installs;
create policy ei_member_select on public.extension_installs
    for select to authenticated
    using (public.is_tenant_member(tenant_id));

drop policy if exists ei_owner_or_admin_update on public.extension_installs;
create policy ei_owner_or_admin_update on public.extension_installs
    for update to authenticated
    using (user_id = auth.uid() or public.is_tenant_admin(tenant_id))
    with check (user_id = auth.uid() or public.is_tenant_admin(tenant_id));

drop policy if exists ei_owner_or_admin_delete on public.extension_installs;
create policy ei_owner_or_admin_delete on public.extension_installs
    for delete to authenticated
    using (user_id = auth.uid() or public.is_tenant_admin(tenant_id));

-- =====================================================================
-- audit_logs
--  * Miembros del tenant pueden LEER su log.
--  * La INSERT la hace service_role.
-- =====================================================================
drop policy if exists al_member_select on public.audit_logs;
create policy al_member_select on public.audit_logs
    for select to authenticated
    using (
        tenant_id is not null
        and (public.is_tenant_member(tenant_id) or public.is_platform_admin())
    );

-- =====================================================================
-- Fin 0002_rls_policies.sql
-- =====================================================================
