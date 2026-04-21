'use client';
import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

type Member = { user_id: string; role: string; joined_at: string; profiles: { email: string; full_name: string | null } };

const ROLE_LABELS: Record<string, string> = {
    owner: 'Owner', admin: 'Admin', operator: 'Operador', viewer: 'Visualizador',
};

function TeamContent() {
    const sp = useSearchParams();
    const tenantId = sp.get('tenant');
    const [members, setMembers] = useState<Member[] | null>(null);
    const [err, setErr] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!tenantId) return;
        const r = await fetch(`/api/team/members?tenant_id=${tenantId}`);
        const j = await r.json();
        if (!r.ok) { setErr(j.error); return; }
        setMembers(j.data);
    }, [tenantId]);

    useEffect(() => { load(); }, [load]);

    async function changeRole(userId: string, role: string) {
        const r = await fetch('/api/team/role', {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ tenant_id: tenantId, user_id: userId, role }),
        });
        if (r.ok) load();
        else alert('Error al cambiar rol');
    }

    async function removeMember(userId: string) {
        if (!confirm('¿Eliminar este miembro?')) return;
        const r = await fetch('/api/team/members', {
            method: 'DELETE',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ tenant_id: tenantId, user_id: userId }),
        });
        if (r.ok) load();
        else alert('Error al eliminar');
    }

    function initial(m: Member) {
        const s = m.profiles?.full_name || m.profiles?.email || '?';
        return s.slice(0, 1).toUpperCase();
    }

    return (
        <>
            <header className="row-between" style={{ marginBottom: 20 }}>
                <div>
                    <h1 className="text-grad" style={{ fontSize: 32, marginBottom: 4 }}>Equipo</h1>
                    <p className="muted" style={{ margin: 0 }}>
                        Gestiona miembros y roles del tenant.
                    </p>
                </div>
                <button className="btn btn-ghost" onClick={() => alert('Próximamente: invitar por email')}>
                    + Invitar miembro
                </button>
            </header>

            {err && <div className="alert alert-error">{err}</div>}
            {members === null && !err && <p className="muted">Cargando…</p>}

            <div className="col" style={{ gap: 12 }}>
                {members?.map(m => (
                    <div key={m.user_id} className="card row-between" style={{ marginBottom: 0 }}>
                        <div className="row">
                            <div style={{
                                width: 42, height: 42, borderRadius: 21,
                                background: 'linear-gradient(135deg, #A855F7, #7E22CE)',
                                display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700,
                            }}>{initial(m)}</div>
                            <div>
                                <strong style={{ color: 'var(--text)' }}>
                                    {m.profiles?.full_name || m.profiles?.email || m.user_id.slice(0, 8)}
                                </strong>
                                <div className="muted">{m.profiles?.email}</div>
                                <div className="muted" style={{ fontSize: 12 }}>
                                    Se unió {new Date(m.joined_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <select
                                value={m.role}
                                onChange={e => changeRole(m.user_id, e.target.value)}
                                disabled={m.role === 'owner'}
                                style={{ width: 'auto', padding: '8px 12px', fontSize: 13 }}
                            >
                                {Object.entries(ROLE_LABELS).map(([v, l]) => (
                                    <option key={v} value={v}>{l}</option>
                                ))}
                            </select>
                            {m.role !== 'owner' && (
                                <button className="btn btn-ghost btn-sm" onClick={() => removeMember(m.user_id)}>
                                    Eliminar
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

export default function TeamPage() {
    return <Suspense><TeamContent /></Suspense>;
}
