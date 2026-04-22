'use client';
/**
 * Browser-side Supabase client. Uses localStorage persistence (no cookies),
 * so the access_token is always readable from JS and can be attached as
 * `Authorization: Bearer ...` on every API call. This decouples us from
 * cookie quirks (httpOnly, SameSite, chunking, Next route-handler write
 * restrictions) and matches standard SPA auth used by Meta/Stripe/etc.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient {
    if (client) return client;
    client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
                storageKey: 'divinads-auth',
                flowType: 'pkce',
            },
        },
    );
    return client;
}
