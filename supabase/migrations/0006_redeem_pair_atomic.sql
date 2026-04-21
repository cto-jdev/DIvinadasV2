-- =====================================================================
-- Migration: 0006_redeem_pair_atomic.sql
-- Adds a SECURITY DEFINER RPC that atomically redeems a pairing code
-- and creates the extension_install in a single serialized transaction,
-- eliminating the race condition where two concurrent requests could
-- both create an install before the consume check runs.
-- =====================================================================

create or replace function public.redeem_pair_code(
    p_code_hash           text,
    p_session_token_hash  text,
    p_label               text    default null,
    p_user_agent          text    default null
)
returns table(install_id uuid, out_tenant_id uuid, out_user_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_pair  device_pairings;
    v_iid   uuid;
begin
    -- Lock the matching row. SKIP LOCKED means a concurrent request finds
    -- nothing and will hit the not_found/already_used branch below.
    select * into v_pair
    from device_pairings
    where code_hash  = p_code_hash
      and consumed_at is null
      and expires_at  > now()
    for update skip locked;

    if not found then
        -- Distinguish the three failure modes with a non-locking read.
        if exists (
            select 1 from device_pairings
            where code_hash = p_code_hash and consumed_at is not null
        ) then
            raise exception 'already_used' using errcode = 'P0001';
        elsif exists (
            select 1 from device_pairings
            where code_hash = p_code_hash and expires_at <= now()
        ) then
            raise exception 'expired' using errcode = 'P0002';
        else
            raise exception 'not_found' using errcode = 'P0003';
        end if;
    end if;

    -- Create the extension install with the pre-computed token hash.
    insert into extension_installs(
        tenant_id,
        user_id,
        label,
        user_agent,
        session_token_hash,
        last_seen_at
    ) values (
        v_pair.tenant_id,
        v_pair.user_id,
        p_label,
        p_user_agent,
        p_session_token_hash,
        now()
    )
    returning id into v_iid;

    -- Consume the pairing code and back-link to the new install.
    update device_pairings
    set consumed_at         = now(),
        consumed_by_install = v_iid
    where id = v_pair.id;

    return query select v_iid, v_pair.tenant_id, v_pair.user_id;
end;
$$;

-- Only the service role (backend) may call this function.
revoke execute on function public.redeem_pair_code(text, text, text, text) from public, anon, authenticated;
grant  execute on function public.redeem_pair_code(text, text, text, text) to service_role;
