'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type Member = { user_id: string; role: string; joined_at: string; profiles: { email: string; full_name: string | null } };

const ROLE_LABELS: Record<string, string> = {
    owner: 'Owner', admin: 'Admin', operator: 'Operador', viewer: 'Visualizador',
};

export default function TeamPage() {
    const sp = useSearchParams();
    const tenantId = sp.get('tenant');
    const [members, setMembers] = useState<Member[] | null>(null);
    const [err, setErr] = useState<string | null>(null);

    async function load() {
        if (!tenantId) return;
        const r = await fetch(`/api/team/members?tenant_id=${tenantId}`);
        const j = await r.json();
        if (!r.ok) { setErr(j.error); return; }
        setMembers(j.data);
    }

    useEffect(() => { load(); }, [tenantId]);

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

    return (
        <>
            <div className="row-between">
                <h2 style={{ color: '#6B21A8' }}>Equipo</h2>
                <button className="btn btn-ghost" onClick={() => alert('Próximamente: invitar por email')}>
                    + Invitar miembro
                </button>
            </div>
            {err && <div style={{ color: '#DC2626' }}>{err}</div>}
            {members === null && <p className="muted">Cargando…</p>}
            {members?.map(m => (
                <div key={m.user_id} className="card row-between">
                    <div>
                        <strong>{m.profiles?.full_name || m.profiles?.email || m.user_id.slice(0, 8)}</strong>
                        <div className="muted">{m.profiles?.email}</div>
                        <div className="muted">
                            Se unió: {new Date(m.joined_at).toLocaleDateString()}
                        </div>
                    </div>
                    <div className="row">
                        <select
                            value={m.role}
                            onChange={e => changeRole(m.user_id, e.target.value)}
                            style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #E5E7EB' }}
                            disabled={m.role === 'owner'}
                        >
                            {Object.entries(ROLE_LABELS).map(([v, l]) => (
                                <option key={v} value={v}>{l}</option>
                            ))}
                        </select>
                        {m.role !== 'owner' && (
                            <button className="btn btn-danger" style={{ marginLeft: 8, padding: '6px 12px' }}
                                    onClick={() => removeMember(m.user_id)}>
                                Eliminar
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </>
    );
}
