# Riesgos, Hallazgos y Deuda Técnica — DivinAds V2

> Generado post-auditoría de migración V1→V2. Estado: V2 implementada.

---

## Matriz de hallazgos resueltos en V2

| Hallazgo | Severidad | Impacto técnico | Impacto negocio | Resolución V2 |
|---|---|---|---|---|
| Secretos Meta en extensión (V1) | CRÍTICO | Extracción trivial del código JS | Claves comprometidas, abuso de API | Eliminado: todo secreto vive en Vercel |
| Sin RLS en tablas Supabase | CRÍTICO | Cualquier usuario ve datos de otros | Fuga de datos clientes | RLS activo + helper functions SECURITY DEFINER |
| Tokens Meta en texto plano | ALTO | Lectura directa desde DB | Robo de cuentas publicitarias | pgcrypto AES-256 vía Vault |
| Sin aislamiento multi-tenant | ALTO | Acceso cruzado entre clientes | Fuga de cuentas Meta y campañas | tenant_id en todas las tablas, RLS enforce |
| Sin auditoría de acciones | ALTO | Sin trazabilidad | Sin soporte, sin compliance | audit_logs append-only + RLS restrictivo |
| Pairing sin rate-limit | ALTO | Brute-force de código 6 dígitos | Secuestro de cuentas | 5 intentos/IP/min + consumo atómico |
| Sin revocación de sesiones | MEDIO | Sesiones comprometidas viven 90d | Incapacidad de reaccionar a incidentes | revoked_jtis + heartbeat 30min |
| Meta tokens sin refresh automático | MEDIO | Tokens expiran, sin aviso | Pérdida de acceso sin recuperación | Cron refresh cada 24h, aviso 10d antes |
| Sin CSP en headers | MEDIO | XSS posible en panel web | Ataques en sesiones admin | CSP completo en next.config.js |
| audit_logs mutables | MEDIO | Evidencia de auditoría eliminable | No compliance | Políticas RLS deny UPDATE/DELETE |
| Sin health check | BAJO | Sin visibilidad de uptime | Downtime no detectado | /api/health + UptimeRobot |

---

## Hallazgos abiertos (pendientes)

| Hallazgo | Severidad | Estado | Acción requerida |
|---|---|---|---|
| Sin E2E tests (Playwright) | MEDIO | Abierto | Implementar suite básica auth + OAuth + pairing |
| Iconos extensión sin revisión de marca | BAJO | Abierto | Diseñador: reemplazar "D" genérica con logo oficial |
| Sin monitoreo de errores (Sentry) | BAJO | Abierto | Agregar SENTRY_DSN + wrappers de error |
| Sin rate-limit en endpoints de panel | BAJO | Abierto | Agregar rateLimit() en /api/meta/start |
| Privacy Policy / Terms: correo ficticio | BAJO | Abierto | Reemplazar privacidad@divinads.com con correo real |
| Hotmart plan mapping por nombre | BAJO | Diseño | Fragil si cambia el nombre del producto en Hotmart |

---

## Matriz de deuda técnica

| Deuda | Qué implica | Urgencia | Acción |
|---|---|---|---|
| `packages/auth`, `packages/core`, `packages/security` — package.json vacíos | Carpetas reservadas sin contenido | Baja | Poblar o eliminar en siguiente iteración |
| CSS inline en páginas panel | Dificulta theming y mantenibilidad | Baja | Extraer a globals.css o CSS Modules |
| Sin paginación en listados Graph API | Limita a 25 resultados por defecto | Media | Implementar cursor-based pagination |
| `tenant_id` en query params (no en JWT del panel) | Usuario puede cambiar tenant_id en URL | Media | Validar tenant membership en cada endpoint |
| Meta token refresh sin notificación push | Fallo silencioso si refresh falla | Baja | Añadir notificación por email en error |
| Sin tabla `plans` para definir features | Plan-to-modules hardcodeado en código | Baja | Mover a tabla DB con admin UI |

---

## Mapa de secretos

| Secreto | Dónde vive | Sensible | Rotación |
|---|---|---|---|
| SUPABASE_SERVICE_ROLE_KEY | Vercel env (Sensitive) | Sí | Manual, tras incidente |
| FB_APP_SECRET | Vercel env (Sensitive) | Sí | Manual, desde Facebook Dev Console |
| JWT_SECRET | Vercel env (Sensitive) | Sí | Manual; invalida todas las sesiones extensión |
| OAUTH_STATE_SECRET | Vercel env (Sensitive) | Sí | Manual; invalida flows OAuth en curso |
| CRON_SECRET | Vercel env (Sensitive) | Sí | Manual |
| HOTMART_HOTTOK | Vercel env (Sensitive) | Sí | Desde dashboard Hotmart |
| meta_token_encryption_key | Supabase Vault | Sí | Ver runbook re-encryption |
| UPSTASH_REDIS_REST_TOKEN | Vercel env (Sensitive) | Sí | Desde Upstash dashboard |
| NEXT_PUBLIC_SUPABASE_URL | Vercel env (público) | No | No requiere rotación |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Vercel env (público) | No | Solo si se sospecha mal uso |

---

## Decisiones de diseño y trade-offs

| Decisión | Alternativa descartada | Razón |
|---|---|---|
| JWT opaco para extensión (no Supabase session) | Supabase session en extensión | Evita exponer service_role; el JWT es revocable sin tocar Supabase |
| pgcrypto vía Vault (no KMS externo) | AWS KMS / GCP KMS | Supabase Vault es suficiente para V2; KMS añade latencia y costo |
| Hotmart (no Stripe) | Stripe | Hotmart es la plataforma de pagos principal en LATAM para el mercado objetivo |
| Pairing por código 6 dígitos (no link mágico) | Link mágico en popup | Chrome MV3 restringe navegación externa desde popup; código es más UX-friendly |
| Vitest (no Jest) | Jest | Mejor integración con ESM y TypeScript sin config extra |
| Next.js App Router (no Pages Router) | Pages Router | Server Components + Route Handlers son el modelo futuro de Vercel |

---

## Riesgos operativos activos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Cambio breaking API Meta (versiones) | Media | Alto | Cron verifica expiración; FB_API_VERSION configurable |
| Fallo de Upstash Redis | Baja | Medio | rateLimit degrada gracefully (no-op en dev) |
| Expiración JWT_SECRET = invalida extensiones | Baja | Alto | Proceso de rotación en OPERATIONS.md |
| Límites de concurrencia Vercel Free | Media | Medio | Upgrade a Pro cuando tráfico supere 100 req/s |
| Hotmart cambia formato webhook | Media | Alto | Webhook con logging; evento desconocido se ignora sin error |
