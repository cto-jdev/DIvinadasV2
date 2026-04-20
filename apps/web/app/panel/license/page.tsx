import { cookies } from 'next/headers';
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
const STATUS_COLORS: Record<string, string> = {
    active: '#10B981',
    past_due: '#F59E0B',
    canceled: '#6B7280',
    expired: '#DC2626',
};

async function getLicense(tenantId: string) {
    const supa = getSupabaseService();
    const { data } = await supa.from('licenses')
        .select('plan, status, seats, trial_ends_at, current_period_ends_at')
        .eq('tenant_id', tenantId).maybeSingle();
    return data;
}

export default async function LicensePage({ searchParams }: { searchParams: { tenant?: string } }) {
    const tenantId = searchParams.tenant;
    const lic = tenantId ? await getLicense(tenantId) : null;

    return (
        <>
            <h2 style={{ color: '#6B21A8' }}>Licencia</h2>
            {!tenantId && <p className="muted">Selecciona un tenant desde el inicio.</p>}
            {tenantId && !lic && (
                <div className="card">
                    <p>No se encontró licencia. Contacta con soporte.</p>
                </div>
            )}
            {lic && (
                <>
                    <div className="card">
                        <div className="row-between">
                            <div>
                                <div style={{ fontSize: 24, fontWeight: 700, color: '#6B21A8' }}>
                                    {PLAN_LABELS[lic.plan] ?? lic.plan}
                                </div>
                                <div className="muted">
                                    Estado: <span style={{ color: STATUS_COLORS[lic.status] ?? '#111', fontWeight: 600 }}>
                                        {STATUS_LABELS[lic.status] ?? lic.status}
                                    </span>
                                </div>
                                <div className="muted">Asientos: {lic.seats}</div>
                            </div>
                            <a href="mailto:soporte@divinads.com" className="btn btn-ghost"
                               style={{ textDecoration: 'none' }}>
                                Actualizar plan →
                            </a>
                        </div>
                    </div>

                    <div className="card">
                        <h3 style={{ marginTop: 0 }}>Vencimiento</h3>
                        {lic.plan === 'trial' && lic.trial_ends_at && (
                            <p>Trial vence: <strong>{new Date(lic.trial_ends_at).toLocaleDateString('es', { dateStyle: 'long' })}</strong></p>
                        )}
                        {lic.plan !== 'trial' && lic.current_period_ends_at && (
                            <p>Próxima renovación: <strong>{new Date(lic.current_period_ends_at).toLocaleDateString('es', { dateStyle: 'long' })}</strong></p>
                        )}
                        {lic.plan === 'enterprise' && <p>Enterprise — sin vencimiento automático.</p>}
                    </div>

                    <div className="card">
                        <h3 style={{ marginTop: 0 }}>Módulos incluidos</h3>
                        {(
                            lic.plan === 'enterprise'
                                ? ['BM', 'Cuentas', 'Páginas', 'Pixels', 'Advantage+', 'Attribution']
                                : lic.plan === 'pro'
                                    ? ['BM', 'Cuentas', 'Páginas', 'Pixels', 'Advantage+', 'Attribution']
                                    : lic.plan === 'starter'
                                        ? ['BM', 'Cuentas', 'Páginas', 'Pixels']
                                        : ['BM', 'Cuentas']
                        ).map(m => (
                            <span key={m} style={{
                                display: 'inline-block', margin: '4px 8px 4px 0',
                                padding: '4px 12px', borderRadius: 20,
                                background: '#EDE9FE', color: '#6B21A8',
                                fontSize: 13, fontWeight: 600,
                            }}>{m}</span>
                        ))}
                    </div>
                </>
            )}
        </>
    );
}
