/**
 * Clientes Supabase para el backend Next.js.
 *
 *  - getSupabaseService(): usa SERVICE_ROLE_KEY. Bypassa RLS.
 *    Úsalo en handlers que necesiten escribir tablas restringidas
 *    (audit_logs, meta_tokens, oauth_transactions).
 *    NUNCA expongas este cliente al navegador.
 *
 *  - getSupabaseServer(cookies): usa el anon key + cookie del usuario.
 *    Respeta RLS — úsalo en queries en nombre del usuario.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _service: SupabaseClient | null = null;

export function getSupabaseService(): SupabaseClient {
    if (_service) return _service;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase service env missing');
    _service = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
    return _service;
}
