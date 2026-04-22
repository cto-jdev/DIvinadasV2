'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';

const PLAN_LABELS: Record<string, string> = {
    trial: 'Trial (14 días)',
    starter: 'Starter',
    pro: 'Pro',
    enterprise: 'Enterprise',
};
const STATUS_LABELS: Record<string, string> = {
    active: 'Activa',
    past_due: 'Pago pendiente',
    canceled: 'Cancelada',
    expired: 'Expirada',
};
function statusPill(s: string) {
    const cls = s === 'active' ? 'pill-success' : s === 'expired' || s === 'canceled' ? 'pill-danger' : 'pill-muted';
    return <span className={`pill ${cls}`}>● {STATUS_LABELS[s] ?? s}</span>;
}

type License = {
    plan: string;
    status: string;
    seats: number;
    ends_at: string | null;
    days_remaining: number | null;
    modules: string[];
};

const MODULE_LABELS: Record<string, string> = {
    'bm.module': 'BM',
    'ads.module': 'Cuentas',
    'pages.module': 'Páginas',
    'pixel.module': 'Pixels',
    'advantage.module': 'Advantage+',
    'attribution.module': 'Attribution',
};

function LicenseContent() {
    const sp = useSearchParams();
    const tenantId = sp.get('tenant');
    const [lic, setLic] = useState<License | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) { setLoading(false); return; }
        (async () => {
            const r = await apiFetch(`/api/licenses/me?tenant_id=${tenantId}`);
            const j = await r.json().catch(() => ({}));
            setLoading(false);
            if (!r.ok) { setErr(j.error ?? `HTTP ${r.status}`); return; }
            setLic(j);
        })();
    }, [tenantId]);

    return (
        <>
            <header style={{ marginBottom: 20 }}>
                <h1 className="text-grad" style={{ fontSize: 32, marginBottom: 4 }}>Licencia</h1>
                <p className="muted" style={{ margin: 0 }}>Plan activo, vencimiento y módulos.</p>
            </header>

            {!tenantId && <div className="card"><p className="muted">Selecciona un tenant desde el inicio.</p></div>}
            {tenantId && loading && <p className="muted">Cargando…</p>}
            {err && <div className="alert alert-error">Error: {err}</div>}
            {tenantId && !loading && !lic && !err && (
                <div className="card"><p>No se encontró licencia. Contacta con soporte.</p></div>
            )}

            {lic && (
                <>
                    <div className="card card-glow">
                        <div className="row-between">
                            <div>
                                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)' }}>
                                    {PLAN_LABELS[lic.plan] ?? lic.plan}
                                </div>
                                <div className="row" style={{ gap: 8, marginTop: 6 }}>
                                    {statusPill(lic.status)}
                                    <span className="pill pill-muted">{lic.seats} asientos</span>
                                </div>
                            </div>
                            <a href="mailto:soporte@divinads.com" className="btn btn-primary">Actualizar plan →</a>
                        </div>
                    </div>

                    <div className="card">
                        <h3 style={{ marginTop: 0 }}>Vencimiento</h3>
                        {lic.plan === 'trial' && lic.ends_at && (
                            <p>Trial vence: <strong style={{ color: 'var(--text)' }}>{new Date(lic.ends_at).toLocaleDateString('es', { dateStyle: 'long' })}</strong></p>
                        )}
                        {lic.plan !== 'trial' && lic.ends_at && (
                            <p>Próxima renovación: <strong style={{ color: 'var(--text)' }}>{new Date(lic.ends_at).toLocaleDateString('es', { dateStyle: 'long' })}</strong></p>
                        )}
                        {lic.plan === 'enterprise' && <p>Enterprise — sin vencimiento automático.</p>}
                    </div>

                    <div className="card">
                        <h3 style={{ marginTop: 0 }}>Módulos incluidos</h3>
                        <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
                            {lic.modules.map(m => <span key={m} className="pill">{MODULE_LABELS[m] ?? m}</span>)}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

export default function LicensePage() {
    return <Suspense><LicenseContent /></Suspense>;
}
