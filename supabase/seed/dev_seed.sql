-- =====================================================================
-- DivinAds V2 — Datos de desarrollo (no ejecutar en producción).
-- Requisito previo: crear 1 usuario en Supabase Auth (Studio → Authentication
-- → Users → Add User) y reemplazar el UUID abajo.
-- =====================================================================

-- Reemplazar con el id real del auth.users creado manualmente
\set dev_user '00000000-0000-0000-0000-000000000001'

-- Registrar la clave de cifrado en Vault (solo si no existe)
-- Ejecutar esto UNA vez con un valor aleatorio (ej: openssl rand -base64 32)
-- select vault.create_secret('<REEMPLAZAR-CLAVE-BASE64-32-BYTES>', 'meta_token_encryption_key');

-- Tenant de prueba
insert into public.tenants (id, slug, display_name, owner_id)
values ('11111111-1111-1111-1111-111111111111', 'demo', 'Demo Agency', :'dev_user')
on conflict (id) do nothing;

-- Membership
insert into public.tenant_members (tenant_id, user_id, role)
values ('11111111-1111-1111-1111-111111111111', :'dev_user', 'owner')
on conflict do nothing;

-- Licencia trial
insert into public.licenses (tenant_id, plan, status, seats, trial_ends_at)
values (
    '11111111-1111-1111-1111-111111111111',
    'trial',
    'active',
    3,
    now() + interval '14 days'
)
on conflict (tenant_id) do nothing;
