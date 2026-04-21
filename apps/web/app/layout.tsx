import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'DivinAds — Meta Business Manager suite',
    description: 'Gestión multi-tenant de Meta Business Managers para agencias.',
    themeColor: '#0a0a0f',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>{children}</body>
        </html>
    );
}
