# apps/web — DivinAds Panel Web

Next.js 14 App Router en Vercel. Panel de administración y backend serverless.

## Arrancar en desarrollo

```bash
# Desde la raíz del monorrepo:
cp .env.example.v2 apps/web/.env.local
# Completar valores en .env.local

pnpm dev
# o solo este app:
cd apps/web && pnpm dev
```

## Estructura

```
apps/web/
├── app/
│   ├── api/           # Endpoints serverless
│   │   ├── auth/      # Callback Supabase OAuth
│   │   ├── cron/      # refresh-tokens, purge-expired
│   │   ├── extension/ # pair/create, pair/redeem, heartbeat
│   │   ├── graph/     # Proxy Graph API Meta
│   │   ├── licenses/  # Estado de licencia
│   │   ├── meta/      # OAuth Meta start/callback/connections
│   │   ├── team/      # Gestión de miembros
│   │   ├── tenant/    # Tenants del usuario
│   │   ├── webhooks/  # Hotmart webhook
│   │   └── health/    # Health check
│   ├── panel/         # Panel web (rutas protegidas)
│   ├── login/
│   ├── signup/
│   ├── privacy/
│   └── terms/
├── lib/
│   ├── auth.ts         # getUserFromRequest, getInstallFromJwt
│   ├── ext-auth.ts     # authenticateExtension (1 query RPC)
│   ├── graph.ts        # graphGet + appsecret_proof
│   ├── license.ts      # requireActiveLicense, tenantHasFlag
│   ├── ratelimit.ts    # Upstash sliding window
│   ├── supabase.ts     # Cliente service_role (server)
│   └── supabase-browser.ts # Cliente anon (browser)
├── middleware.ts        # Refresco sesión + protección rutas
└── __tests__/          # Vitest
```

## Variables de entorno requeridas

Ver `.env.example.v2` en la raíz del monorrepo.

## Tests

```bash
pnpm test          # vitest run
pnpm test:watch    # vitest watch
```

## Deploy

```bash
npx vercel deploy          # staging
npx vercel deploy --prod   # producción
```

Ver `docs/migration/DEPLOY_CHECKLIST.md` para el proceso completo.
