import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseService } from '@/lib/supabase';

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

async function getLicense(tenantId: string, userId: string) {
    const svc = getSupabaseService();
    const { data: mem } = await svc.from('tenant_members')
        .select('role').eq('tenant_id', tenantId).eq('user_id', userId).maybeSingle();
    if (!mem) return null;
    const { data } = await svc.from('licenses')
        .select('plan, status, seats, trial_ends_at, current_period_ends_at')
        .eq('tenant_id', tenantId).maybeSingle();
    return data;
}

export default async function LicensePage({ searchParams }: { searchParams: { tenant?: string } }) {
    const tenantId = searchParams.tenant;
    const cookieStore = cookies();
    const supaAuth = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll().map(c => ({ name: c.name, value: c.value })),
                setAll: (cs: { name: string; value: string; options?: Record<string, unknown> }[]) => {
                    cs.forEach(({ name, value, options }) => {
                        try { cookieStore.set({ name, value, ...options }); } catch { /* RSC */ }
                    });
                },
            },
        },
    );
    const { data: { user } } = await supaAuth.auth.getUser();
    if (!user) redirect('/login?next=/panel/license');
    const lic = tenantId ? await getLicense(tenantId, user.id) : null;

    const modules = !lic ? [] : (
        lic.plan === 'enterprise' || lic.plan === 'pro'
            ? ['BM', 'Cuentas', 'Páginas', 'Pixels', 'Advantage+', 'Attribution']
            : lic.plan === 'starter'
                ? ['BM', 'Cuentas', 'Páginas', 'Pixels']
                : ['BM', 'Cuentas']
    );

    return (
        <>
            <header style={{ marginBottom: 20 }}>
                <h1 className="text-grad" style={{ fontSize: 32, marginBottom: 4 }}>Licencia</h1>
                <p className="muted" style={{ margin: 0 }}>Plan activo, vencimiento y módulos.</p>
            </header>

            {!tenantId && <div className="card"><p className="muted">Selecciona un tenant desde el inicio.</p></div>}
            {tenantId && !lic && (
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
                            <a href="mailto:soporte@divinads.com" className="btn btn-primary">
                                Actualizar plan →
                            </a>
                        </div>
                    </div>

                    <div className="card">
                        <h3 style={{ marginTop: 0 }}>Vencimiento</h3>
                        {lic.plan === 'trial' && lic.trial_ends_at && (
                            <p>Trial vence: <strong style={{ color: 'var(--text)' }}>{new Date(lic.trial_ends_at).toLocaleDateString('es', { dateStyle: 'long' })}</strong></p>
                        )}
                        {lic.plan !== 'trial' && lic.current_period_ends_at && (
                            <p>Próxima renovación: <strong style={{ color: 'var(--text)' }}>{new Date(lic.current_period_ends_at).toLocaleDateString('es', { dateStyle: 'long' })}</strong></p>
                        )}
                        {lic.plan === 'enterprise' && <p>Enterprise — sin vencimiento automático.</p>}
                    </div>

                    <div className="card">
                        <h3 style={{ marginTop: 0 }}>Módulos incluidos</h3>
                        <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
                            {modules.map(m => <span key={m} className="pill">{m}</span>)}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
