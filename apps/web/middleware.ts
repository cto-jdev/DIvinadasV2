/**
 * Next.js middleware.
 *
 * Auth is now 100% client-side (localStorage + Bearer tokens), so this
 * middleware no longer enforces sessions. It only:
 *  - rejects oversized POST/PUT bodies
 *  - passes everything else through unchanged
 *
 * Protected pages enforce auth in their own layout (client-side), and
 * API routes enforce auth via Authorization: Bearer.
 */
import { NextRequest, NextResponse } from 'next/server';

export const config = {
    matcher: [
        '/panel/:path*',
        '/admin/:path*',
        '/api/:path*',
    ],
};

const MAX_BODY_BYTES = 1 * 1024 * 1024;

export function middleware(req: NextRequest) {
    if (req.method === 'POST' || req.method === 'PUT') {
        const cl = req.headers.get('content-length');
        if (cl && parseInt(cl, 10) > MAX_BODY_BYTES) {
            return NextResponse.json({ error: 'payload_too_large' }, { status: 413 });
        }
    }
    return NextResponse.next();
}
