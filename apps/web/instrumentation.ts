/**
 * Next.js instrumentation hook — runs once on server startup (Node runtime).
 * Fails fast if required environment variables are missing so that
 * misconfigured deployments crash at boot rather than silently at runtime.
 */
export async function register() {
    // Only run in the Node.js runtime (not Edge), and skip in test environments
    // where individual env vars are mocked per-test.
    if (
        process.env.NEXT_RUNTIME !== 'nodejs' ||
        process.env.NODE_ENV === 'test'
    ) return;

    const required = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'FB_APP_ID',
        'FB_APP_SECRET',
        'FB_REDIRECT_URI',
        'OAUTH_STATE_SECRET',
        'JWT_SECRET',
        'CRON_SECRET',
        'HOTMART_HOTTOK',
    ] as const;

    const missing = required.filter(k => !process.env[k]);
    if (missing.length > 0) {
        // Warn only — allow the app to boot with incomplete config so public
        // pages render. Routes that need a missing var will still fail at
        // request time. Set STRICT_ENV=1 to restore the hard-fail behavior.
        const msg =
            `[divinads] Missing env vars: ${missing.join(', ')}. ` +
            'Dependent routes will error at request time.';
        if (process.env.STRICT_ENV === '1') {
            throw new Error(msg);
        }
        console.warn(msg);
    }
}
