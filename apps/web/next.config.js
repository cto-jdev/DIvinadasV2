/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '*.fbcdn.net' },
            { protocol: 'https', hostname: 'graph.facebook.com' },
            { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
        ],
    },
    async headers() {
        const isProd = process.env.NODE_ENV === 'production';
        const supabaseHost = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace('https://', '');
        const csp = [
            "default-src 'self'",
            // Next.js App Router inyecta bootstrap/hydration inline scripts
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            `connect-src 'self' https://${supabaseHost} https://graph.facebook.com https://www.facebook.com`,
            "img-src 'self' data: https://*.fbcdn.net https://graph.facebook.com https://lh3.googleusercontent.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' data: https://fonts.gstatic.com",
            "frame-ancestors 'none'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ].join('; ');

        return [{
            source: '/(.*)',
            headers: [
                { key: 'X-Content-Type-Options', value: 'nosniff' },
                { key: 'X-Frame-Options',        value: 'DENY' },
                { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
                { key: 'Permissions-Policy',      value: 'camera=(), microphone=(), geolocation=()' },
                { key: 'Content-Security-Policy', value: csp },
                ...(isProd ? [{
                    key: 'Strict-Transport-Security',
                    value: 'max-age=31536000; includeSubDomains; preload',
                }] : []),
            ],
        }];
    },
};

module.exports = nextConfig;
