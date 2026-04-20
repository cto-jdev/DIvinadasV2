/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: { allowedOrigins: ['localhost:3000'] },
    },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '*.fbcdn.net' },
            { protocol: 'https', hostname: 'graph.facebook.com' },
            { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
        ],
    },
    // Security headers — complementan los del middleware
    async headers() {
        return [{
            source: '/(.*)',
            headers: [
                { key: 'X-Content-Type-Options',       value: 'nosniff' },
                { key: 'X-Frame-Options',               value: 'DENY' },
                { key: 'Referrer-Policy',               value: 'strict-origin-when-cross-origin' },
                { key: 'Permissions-Policy',            value: 'camera=(), microphone=(), geolocation=()' },
            ],
        }];
    },
};

module.exports = nextConfig;
