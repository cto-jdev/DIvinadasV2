/**
 * GET /api/auth/callback
 * Compat shim: auth is now fully client-side (localStorage + PKCE).
 * This route exists because Supabase's stored Site URL / OAuth redirect
 * URL may still point here. We just forward the whole query to the
 * client page `/auth/callback` which does the real exchange.
 *
 * Also: if this callback receives a Meta/Facebook state (base64.hmac),
 * forward to `/api/meta/callback` instead (FB_REDIRECT_URI misrouted).
 */
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
    const state = req.nextUrl.searchParams.get('state');

    // Meta OAuth response (our state has base64url.hmac form)
    if (state && state.includes('.')) {
        const forward = new URL('/api/meta/callback', req.url);
        req.nextUrl.searchParams.forEach((v, k) => forward.searchParams.set(k, v));
        return NextResponse.redirect(forward);
    }

    // Supabase auth (email link, Google, etc) — hand off to client
    const forward = new URL('/auth/callback', req.url);
    req.nextUrl.searchParams.forEach((v, k) => forward.searchParams.set(k, v));
    return NextResponse.redirect(forward);
}
