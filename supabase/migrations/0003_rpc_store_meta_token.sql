-- =====================================================================
-- DivinAds V2 — RPC para guardar meta_tokens cifrados.
-- Migration: 0003_rpc_store_meta_token.sql
-- Contexto:  MIGRATION_V2.md §13 (OAuth Meta), §10 (meta_tokens).
-- =====================================================================
-- Motivación:
--   meta_tokens tiene RLS restrictiva (deny all). Ningún cliente puede
--   insertar directamente. El backend llama a esta RPC (SECURITY DEFINER,
--   GRANT exclusivo a service_role) para persistir el token cifrado con
--   pgp_sym_encrypt usando la clave de Vault.
-- =====================================================================

create or replace function public.store_meta_token(
    p_connection_id uuid,
    p_access_token  text,
    p_scopes        text[],
    p_expires_at    timestamptz
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_key     text;
    v_tenant  uuid;
    v_existed boolean;
begin
    -- Clave de cifrado desde Vault
    select decrypted_secret into v_key
      from vault.decrypted_secrets
     where name = 'meta_token_encryption_key'
     limit 1;

    if v_key is null then
        raise exception 'vault key missing: meta_token_encryption_key';
    end if;

    -- Validar que la conexión existe
    select tenant_id into v_tenant
      from public.meta_connections
     where id = p_connection_id;

    if v_tenant is null then
        raise exception 'meta_connection not found: %', p_connection_id;
    end if;

    select exists(select 1 from public.meta_tokens where connection_id = p_connection_id)
      into v_existed;

    insert into public.meta_tokens
        (connection_id, access_token_enc, scopes, expires_at, issued_at, rotation_count)
    values
        (p_connection_id,
         pgp_sym_encrypt(p_access_token, v_key),
         p_scopes,
         p_expires_at,
         now(),
         0)
    on conflict (connection_id) do update
        set access_token_enc = pgp_sym_encrypt(p_access_token, v_key),
            scopes           = p_scopes,
            expires_at       = p_expires_at,
            issued_at        = now(),
            rotation_count   = public.meta_tokens.rotation_count + 1;

    -- Audit
    insert into public.audit_logs(tenant_id, action, resource_type, resource_id, metadata)
    values (v_tenant,
            case when v_existed then 'meta.token.rotate' else 'meta.token.store' end,
            'meta_connection',
            p_connection_id::text,
            jsonb_build_object('scopes', p_scopes, 'has_expiry', p_expires_at is not null));
end;
$$;

revoke all on function public.store_meta_token(uuid, text, text[], timestamptz) from public;
grant execute on function public.store_meta_token(uuid, text, text[], timestamptz) to service_role;

-- =====================================================================
-- Función auxiliar: revoke_meta_connection — marca connection y borra token
-- =====================================================================
create or replace function public.revoke_meta_connection(p_connection_id uuid, p_actor uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_tenant uuid;
begin
    select tenant_id into v_tenant from public.meta_connections where id = p_connection_id;
    if v_tenant is null then
        raise exception 'meta_connection not found';
    end if;

    update public.meta_connections
       set status = 'revoked', revoked_at = now()
     where id = p_connection_id;

    delete from public.meta_tokens where connection_id = p_connection_id;

    insert into public.audit_logs(tenant_id, actor_user_id, action, resource_type, resource_id)
    values (v_tenant, p_actor, 'meta.revoke', 'meta_connection', p_connection_id::text);
end;
$$;

revoke all on function public.revoke_meta_connection(uuid, uuid) from public;
grant execute on function public.revoke_meta_connection(uuid, uuid) to service_role;
