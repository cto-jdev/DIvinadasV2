'use client';
/**
 * Campañas — CRUD completo sobre campañas y posts por cuenta/página.
 * Tabs: Campañas (lista + create/edit/pause/delete) | Posts (por page).
 */
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';
import type { AdAccountSnapshot, CampaignSnapshot, PageSnapshot } from '@/lib/domain/types';
import { toCents } from '@/lib/domain/budget';
import { useRegisterCopilotScope } from '@/components/copilot/context';
import {
    EmptyState, SectionHeader, SkeletonRow, Modal, Toast, Stat, FreshnessBadge,
} from '@/components/dashboard/primitives';

type Conn = { id: string; display_name: string | null };
type Tab = 'campaigns' | 'posts';
type ToastState = { msg: string; tone: 'ok' | 'warn' | 'danger' } | null;

const OBJECTIVES = [
    { v: 'OUTCOME_AWARENESS',     l: 'Reconocimiento' },
    { v: 'OUTCOME_TRAFFIC',       l: 'Tráfico' },
    { v: 'OUTCOME_ENGAGEMENT',    l: 'Interacción' },
    { v: 'OUTCOME_LEADS',         l: 'Leads' },
    { v: 'OUTCOME_APP_PROMOTION', l: 'App' },
    { v: 'OUTCOME_SALES',         l: 'Ventas' },
];

const fmtMoney = (cents: number, currency: string) => {
    try {
        return new Intl.NumberFormat('es', { style: 'currency', currency, maximumFractionDigits: 2 }).format(cents / 100);
    } catch { return `${(cents / 100).toFixed(2)} ${currency}`; }
};

function CampaignsContent() {
    const sp = useSearchParams();
    const tenantId = sp.get('tenant');
    const connParam = sp.get('conn');

    const [conns, setConns] = useState<Conn[] | null>(null);
    const [connId, setConnId] = useState(connParam ?? '');
    const [accounts, setAccounts] = useState<AdAccountSnapshot[] | null>(null);
    const [acctId, setAcctId] = useState('');
    const [campaigns, setCampaigns] = useState<CampaignSnapshot[] | null>(null);
    const [pages, setPages] = useState<PageSnapshot[] | null>(null);
    const [pageId, setPageId] = useState('');
    const [posts, setPosts] = useState<any[] | null>(null);
    const [tab, setTab] = useState<Tab>('campaigns');
    const [err, setErr] = useState<string | null>(null);
    const [toast, setToast] = useState<ToastState>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [editing, setEditing] = useState<CampaignSnapshot | null>(null);
    const [postOpen, setPostOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [lastSync, setLastSync] = useState<string | null>(null);

    useRegisterCopilotScope({
        module: 'other',
        tenantId: tenantId ?? undefined,
        connectionId: connId || undefined,
        summary: {
            accounts_count: accounts?.length,
            campaigns_count: campaigns?.length,
            pages_count: pages?.length,
        },
        top_decisions: [], scores: [],
        raw: { accounts: accounts ?? undefined, campaigns: campaigns ?? undefined, pages: pages ?? undefined },
    }, [tenantId, connId, accounts, campaigns, pages]);

    // --- Loaders -----------------------------------------------------------
    const loadConns = useCallback(async () => {
        if (!tenantId) return;
        const r = await apiFetch(`/api/meta/connections?tenant_id=${tenantId}`);
        const j = await r.json().catch(() => ({}));
        if (!r.ok) return;
        setConns(j.data);
        if (!connId && j.data?.length) setConnId(j.data[0].id);
    }, [tenantId, connId]);
    useEffect(() => { loadConns(); }, [loadConns]);

    const loadAccounts = useCallback(async () => {
        if (!tenantId || !connId) return;
        const r = await apiFetch(`/api/web/graph/adaccounts/list?tenant_id=${tenantId}&connection_id=${connId}`);
        const j = await r.json().catch(() => ({}));
        if (!r.ok) { setErr(j.message ?? `HTTP ${r.status}`); return; }
        const now = new Date().toISOString();
        const list: AdAccountSnapshot[] = (j.data ?? []).map((a: any) => ({
            id: a.id, name: a.name, currency: a.currency,
            account_status: a.account_status, amount_spent: a.amount_spent,
            spend_cap: a.spend_cap, balance: a.balance,
            disable_reason: a.disable_reason, timezone_name: a.timezone_name,
            business_id: a.business?.id ?? null,
            source_type: 'api', source_endpoint: '/me/adaccounts', last_sync_at: now,
        }));
        setAccounts(list);
        if (!acctId && list.length) setAcctId(list.find(a => a.account_status === 1)?.id ?? list[0].id);
    }, [tenantId, connId, acctId]);
    useEffect(() => { loadAccounts(); }, [loadAccounts]);

    const loadPages = useCallback(async () => {
        if (!tenantId || !connId) return;
        const r = await apiFetch(`/api/web/graph/pages/list?tenant_id=${tenantId}&connection_id=${connId}`);
        const j = await r.json().catch(() => ({}));
        if (!r.ok) return;
        const now = new Date().toISOString();
        const list: PageSnapshot[] = (j.data ?? []).map((p: any) => ({
            id: p.id, name: p.name, category: p.category,
            fan_count: p.fan_count, followers_count: p.followers_count,
            verification_status: p.verification_status,
            link: p.link, is_published: p.is_published,
            instagram_business_account: p.instagram_business_account ?? null,
            picture_url: p.picture?.data?.url,
            source_type: 'api', source_endpoint: '/me/accounts', last_sync_at: now,
        }));
        setPages(list);
        if (!pageId && list.length) setPageId(list[0].id);
    }, [tenantId, connId, pageId]);
    useEffect(() => { loadPages(); }, [loadPages]);

    const loadCampaigns = useCallback(async () => {
        if (!tenantId || !connId || !acctId) return;
        setCampaigns(null);
        const qs = `tenant_id=${tenantId}&connection_id=${connId}&ad_account_id=${acctId}`;
        const r = await apiFetch(`/api/web/graph/campaigns/list?${qs}`);
        const j = await r.json().catch(() => ({}));
        if (!r.ok) { setErr(j.message ?? `HTTP ${r.status}`); return; }
        const now = new Date().toISOString();
        setCampaigns((j.data ?? []).map((c: any) => ({
            id: c.id, ad_account_id: acctId, name: c.name,
            objective: c.objective, status: c.status, effective_status: c.effective_status,
            daily_budget: c.daily_budget, lifetime_budget: c.lifetime_budget,
            budget_remaining: c.budget_remaining, bid_strategy: c.bid_strategy,
            buying_type: c.buying_type, start_time: c.start_time, stop_time: c.stop_time,
            spend: c.spend, impressions: c.impressions, clicks: c.clicks,
            source_type: 'api', source_endpoint: '/{acct}/campaigns+insights', last_sync_at: now,
        })));
        setLastSync(now);
    }, [tenantId, connId, acctId]);
    useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

    const loadPosts = useCallback(async () => {
        if (!tenantId || !connId || !pageId || tab !== 'posts') return;
        setPosts(null);
        const qs = `tenant_id=${tenantId}&connection_id=${connId}&page_id=${pageId}&limit=30`;
        const r = await apiFetch(`/api/web/graph/pages/posts?${qs}`);
        const j = await r.json().catch(() => ({}));
        if (!r.ok) { setErr(j.message ?? `HTTP ${r.status}`); setPosts([]); return; }
        setPosts(j.data ?? []);
    }, [tenantId, connId, pageId, tab]);
    useEffect(() => { loadPosts(); }, [loadPosts]);

    // --- Mutations ---------------------------------------------------------
    async function createCampaign(payload: any) {
        if (!tenantId || !connId || !acctId) return;
        setBusy(true);
        try {
            const r = await apiFetch('/api/web/graph/campaigns/create', {
                method: 'POST',
                body: JSON.stringify({
                    tenant_id: tenantId, connection_id: connId, ad_account_id: acctId, ...payload,
                }),
            });
            const j = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(j.message ?? j.error ?? `HTTP ${r.status}`);
            setToast({ msg: `Campaña creada (${j.id})`, tone: 'ok' });
            setCreateOpen(false);
            await loadCampaigns();
        } catch (e: any) {
            setToast({ msg: `Error: ${e.message ?? e}`, tone: 'danger' });
        } finally { setBusy(false); }
    }

    async function updateCampaign(id: string, patch: any) {
        if (!tenantId || !connId) return;
        setBusy(true);
        try {
            const r = await apiFetch('/api/web/graph/campaigns/update', {
                method: 'POST',
                body: JSON.stringify({ tenant_id: tenantId, connection_id: connId, campaign_id: id, patch }),
            });
            const j = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(j.message ?? j.error ?? `HTTP ${r.status}`);
            setToast({ msg: 'Campaña actualizada', tone: 'ok' });
            setEditing(null);
            await loadCampaigns();
        } catch (e: any) {
            setToast({ msg: `Error: ${e.message ?? e}`, tone: 'danger' });
        } finally { setBusy(false); }
    }

    async function toggleStatus(c: CampaignSnapshot) {
        const next = c.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
        await updateCampaign(c.id, { status: next });
    }

    async function deleteCampaign(c: CampaignSnapshot) {
        if (!tenantId || !connId) return;
        if (!confirm(`¿Eliminar la campaña "${c.name}"? (status=DELETED, reversible)`)) return;
        setBusy(true);
        try {
            const r = await apiFetch('/api/web/graph/campaigns/delete', {
                method: 'POST',
                body: JSON.stringify({ tenant_id: tenantId, connection_id: connId, campaign_id: c.id }),
            });
            const j = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(j.message ?? j.error ?? `HTTP ${r.status}`);
            setToast({ msg: 'Campaña marcada como eliminada', tone: 'ok' });
            await loadCampaigns();
        } catch (e: any) {
            setToast({ msg: `Error: ${e.message ?? e}`, tone: 'danger' });
        } finally { setBusy(false); }
    }

    async function createPost(msg: string, link?: string) {
        if (!tenantId || !connId || !pageId) return;
        setBusy(true);
        try {
            const r = await apiFetch('/api/web/graph/pages/posts', {
                method: 'POST',
                body: JSON.stringify({
                    tenant_id: tenantId, connection_id: connId, page_id: pageId,
                    message: msg, link,
                }),
            });
            const j = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(j.message ?? j.error ?? `HTTP ${r.status}`);
            setToast({ msg: `Post publicado (${j.id})`, tone: 'ok' });
            setPostOpen(false);
            await loadPosts();
        } catch (e: any) {
            setToast({ msg: `Error: ${e.message ?? e}`, tone: 'danger' });
        } finally { setBusy(false); }
    }

    async function deletePost(id: string) {
        if (!tenantId || !connId || !pageId) return;
        if (!confirm('¿Eliminar este post definitivamente?')) return;
        setBusy(true);
        try {
            const r = await apiFetch('/api/web/graph/pages/posts', {
                method: 'DELETE',
                body: JSON.stringify({ tenant_id: tenantId, connection_id: connId, page_id: pageId, post_id: id }),
            });
            const j = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(j.message ?? j.error ?? `HTTP ${r.status}`);
            setToast({ msg: 'Post eliminado', tone: 'ok' });
            await loadPosts();
        } catch (e: any) {
            setToast({ msg: `Error: ${e.message ?? e}`, tone: 'danger' });
        } finally { setBusy(false); }
    }

    const selectedAcct = accounts?.find(a => a.id === acctId);
    const currency = selectedAcct?.currency ?? 'USD';
    const totals = useMemo(() => {
        if (!campaigns) return null;
        return {
            total: campaigns.length,
            active: campaigns.filter(c => c.status === 'ACTIVE').length,
            paused: campaigns.filter(c => c.status === 'PAUSED').length,
            spend: campaigns.reduce((a, c) => a + toCents(c.spend), 0),
        };
    }, [campaigns]);

    if (!tenantId) return <div className="card"><h2>Falta tenant</h2><p className="muted">Abre desde <Link href="/panel">inicio</Link>.</p></div>;

    return (
        <>
            <header className="row-between" style={{ marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                <div>
                    <h1 className="text-grad" style={{ fontSize: 26, marginBottom: 4 }}>◆ Campañas</h1>
                    <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                        CRUD completo de campañas y publicación de posts por página.
                    </p>
                </div>
                <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                    <FreshnessBadge lastSync={lastSync} status="ok" />
                    <button className="btn btn-ghost btn-sm" onClick={() => { loadCampaigns(); loadPosts(); }}>↻</button>
                </div>
            </header>

            {err && <div className="alert alert-error" style={{ marginBottom: 12 }}>Error: {err}</div>}

            <div className="card" style={{ marginBottom: 12 }}>
                <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
                    {conns && conns.length > 1 && (
                        <div className="field" style={{ marginBottom: 0, flex: '1 1 180px' }}>
                            <label className="label">Conexión</label>
                            <select value={connId} onChange={e => setConnId(e.target.value)}>
                                {conns.map(c => <option key={c.id} value={c.id}>{c.display_name ?? c.id.slice(0, 8)}</option>)}
                            </select>
                        </div>
                    )}
                    {tab === 'campaigns' && (
                        <div className="field" style={{ marginBottom: 0, flex: '2 1 300px' }}>
                            <label className="label">AdAccount</label>
                            <select value={acctId} onChange={e => setAcctId(e.target.value)} disabled={!accounts}>
                                {accounts?.map(a => (
                                    <option key={a.id} value={a.id}>{a.name} · {a.currency} · status {a.account_status}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {tab === 'posts' && (
                        <div className="field" style={{ marginBottom: 0, flex: '2 1 300px' }}>
                            <label className="label">Página</label>
                            <select value={pageId} onChange={e => setPageId(e.target.value)} disabled={!pages}>
                                {pages?.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <div className="row" style={{ gap: 4, marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                <TabBtn active={tab === 'campaigns'} onClick={() => setTab('campaigns')}>Campañas {campaigns && `(${campaigns.length})`}</TabBtn>
                <TabBtn active={tab === 'posts'}     onClick={() => setTab('posts')}>Posts {posts && `(${posts.length})`}</TabBtn>
            </div>

            {tab === 'campaigns' && (
                <>
                    {totals && (
                        <div className="row" style={{ gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                            <Stat label="Total" value={totals.total} />
                            <Stat label="Activas" value={totals.active} tone={totals.active > 0 ? 'ok' : undefined} />
                            <Stat label="Pausadas" value={totals.paused} />
                            <Stat label="Spend 7d" value={fmtMoney(totals.spend, currency)} />
                        </div>
                    )}

                    <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: 14 }}>
                            <SectionHeader
                                icon="◆"
                                title="Campañas"
                                hint={selectedAcct?.name}
                                action={
                                    <button className="btn btn-primary btn-sm" onClick={() => setCreateOpen(true)} disabled={!acctId}>
                                        + Nueva campaña
                                    </button>
                                }
                            />
                        </div>
                        {campaigns === null ? <div style={{ padding: 14 }}><SkeletonRow count={4} /></div>
                        : campaigns.length === 0 ? (
                            <EmptyState icon="∅" title="Sin campañas"
                                description="Crea la primera con el botón “+ Nueva campaña”." />
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="dtable" style={{ width: '100%' }}>
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Status</th>
                                            <th>Objetivo</th>
                                            <th style={{ textAlign: 'right' }}>Budget</th>
                                            <th style={{ textAlign: 'right' }}>Spend 7d</th>
                                            <th>Bid</th>
                                            <th style={{ textAlign: 'right' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {campaigns.map(c => (
                                            <tr key={c.id}>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                                                    <div className="muted" style={{ fontSize: 10 }}><code>{c.id}</code></div>
                                                </td>
                                                <td>
                                                    <StatusPill status={c.status} effective={c.effective_status} />
                                                </td>
                                                <td style={{ fontSize: 12 }}>{c.objective ?? '—'}</td>
                                                <td style={{ textAlign: 'right', fontSize: 12 }}>
                                                    {c.daily_budget ? `${fmtMoney(toCents(c.daily_budget), currency)}/día`
                                                    : c.lifetime_budget ? `${fmtMoney(toCents(c.lifetime_budget), currency)} total`
                                                    : '—'}
                                                </td>
                                                <td style={{ textAlign: 'right', fontSize: 12 }}>{fmtMoney(toCents(c.spend), currency)}</td>
                                                <td style={{ fontSize: 11, color: 'var(--muted)' }}>{c.bid_strategy ?? '—'}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div className="row" style={{ gap: 4, justifyContent: 'flex-end' }}>
                                                        <button className="btn btn-ghost btn-sm" onClick={() => toggleStatus(c)} disabled={busy}
                                                            title={c.status === 'ACTIVE' ? 'Pausar' : 'Activar'}>
                                                            {c.status === 'ACTIVE' ? '⏸' : '▶'}
                                                        </button>
                                                        <button className="btn btn-ghost btn-sm" onClick={() => setEditing(c)} disabled={busy} title="Editar">
                                                            ✎
                                                        </button>
                                                        <button className="btn btn-ghost btn-sm" onClick={() => deleteCampaign(c)} disabled={busy} title="Eliminar">
                                                            🗑
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </>
            )}

            {tab === 'posts' && (
                <section className="card">
                    <SectionHeader
                        icon="◨"
                        title="Posts de la página"
                        hint={pages?.find(p => p.id === pageId)?.name}
                        action={
                            <button className="btn btn-primary btn-sm" onClick={() => setPostOpen(true)} disabled={!pageId}>
                                + Publicar post
                            </button>
                        }
                    />
                    {posts === null ? <SkeletonRow count={3} />
                    : posts.length === 0 ? <EmptyState icon="∅" title="Sin posts recientes" description="Publica el primero con el botón superior." />
                    : (
                        <div className="col" style={{ gap: 10 }}>
                            {posts.map((p: any) => (
                                <div key={p.id} style={{
                                    padding: 12, borderRadius: 10,
                                    background: 'rgba(255,255,255,.03)', border: '1px solid var(--border)',
                                }}>
                                    <div className="row-between" style={{ alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
                                        <div style={{ flex: '1 1 300px' }}>
                                            <div className="muted" style={{ fontSize: 11 }}>
                                                {p.created_time ? new Date(p.created_time).toLocaleString('es') : '—'}
                                                {p.is_published === false && <span style={{ marginLeft: 8, color: 'var(--warning)' }}>· borrador</span>}
                                            </div>
                                            <div style={{ fontSize: 13, marginTop: 4, whiteSpace: 'pre-wrap' }}>
                                                {p.message ?? p.story ?? <span className="muted">(sin texto)</span>}
                                            </div>
                                            <div className="row" style={{ gap: 10, marginTop: 6, fontSize: 11, color: 'var(--muted)' }}>
                                                <span>👍 {p.reactions?.summary?.total_count ?? 0}</span>
                                                <span>💬 {p.comments?.summary?.total_count ?? 0}</span>
                                                <span>🔁 {p.shares?.count ?? 0}</span>
                                            </div>
                                        </div>
                                        {p.full_picture && <img src={p.full_picture} alt="" width={72} height={72} style={{ borderRadius: 8, objectFit: 'cover' }} />}
                                        <div className="row" style={{ gap: 6 }}>
                                            {p.permalink_url && <a href={p.permalink_url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">Abrir ↗</a>}
                                            <button className="btn btn-ghost btn-sm" onClick={() => deletePost(p.id)} disabled={busy} title="Eliminar">🗑</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            <CreateCampaignModal
                open={createOpen} onClose={() => setCreateOpen(false)}
                onSubmit={createCampaign} busy={busy} currency={currency} />
            <EditCampaignModal
                campaign={editing} onClose={() => setEditing(null)}
                onSubmit={patch => editing && updateCampaign(editing.id, patch)} busy={busy} currency={currency} />
            <CreatePostModal
                open={postOpen} onClose={() => setPostOpen(false)}
                onSubmit={createPost} busy={busy} />

            {toast && <Toast msg={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
        </>
    );
}

// --- Subcomponents --------------------------------------------------------
function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button onClick={onClick} style={{
            background: 'transparent', border: 'none',
            padding: '10px 14px', fontSize: 13, cursor: 'pointer',
            color: active ? 'var(--text)' : 'var(--muted)',
            borderBottom: active ? '2px solid var(--primary, #A855F7)' : '2px solid transparent',
            fontWeight: active ? 600 : 400,
        }}>{children}</button>
    );
}

function StatusPill({ status, effective }: { status: string; effective?: string }) {
    const s = (effective ?? status).toUpperCase();
    const klass = s === 'ACTIVE' ? 'pill-success'
        : s === 'PAUSED' ? 'pill-muted'
        : s === 'DELETED' || s === 'ARCHIVED' ? 'pill-danger'
        : 'pill-warn';
    return <span className={`pill ${klass}`} style={{ fontSize: 10 }}>{s}</span>;
}

function CreateCampaignModal({ open, onClose, onSubmit, busy, currency }: {
    open: boolean; onClose: () => void; onSubmit: (p: any) => void; busy: boolean; currency: string;
}) {
    const [name, setName] = useState('');
    const [objective, setObjective] = useState('OUTCOME_TRAFFIC');
    const [budgetType, setBudgetType] = useState<'daily' | 'lifetime'>('daily');
    const [budget, setBudget] = useState('10');
    const [status, setStatus] = useState<'ACTIVE' | 'PAUSED'>('PAUSED');

    useEffect(() => {
        if (open) { setName(''); setObjective('OUTCOME_TRAFFIC'); setBudget('10'); setStatus('PAUSED'); setBudgetType('daily'); }
    }, [open]);

    function submit() {
        const cents = Math.round(parseFloat(budget) * 100);
        if (!name || !cents || cents <= 0) return;
        onSubmit({
            name, objective, status,
            [budgetType === 'daily' ? 'daily_budget_cents' : 'lifetime_budget_cents']: cents,
        });
    }

    return (
        <Modal open={open} onClose={onClose} title="Nueva campaña" width={520}
            footer={
                <>
                    <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={busy}>Cancelar</button>
                    <button className="btn btn-primary btn-sm" onClick={submit} disabled={busy || !name}>
                        {busy ? 'Creando…' : 'Crear campaña'}
                    </button>
                </>
            }>
            <div className="field">
                <label className="label">Nombre</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Prospecting Q2" autoFocus />
            </div>
            <div className="field">
                <label className="label">Objetivo</label>
                <select value={objective} onChange={e => setObjective(e.target.value)}>
                    {OBJECTIVES.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
            </div>
            <div className="row" style={{ gap: 10 }}>
                <div className="field" style={{ flex: 1 }}>
                    <label className="label">Tipo de presupuesto</label>
                    <select value={budgetType} onChange={e => setBudgetType(e.target.value as any)}>
                        <option value="daily">Diario</option>
                        <option value="lifetime">Total</option>
                    </select>
                </div>
                <div className="field" style={{ flex: 1 }}>
                    <label className="label">Monto ({currency})</label>
                    <input type="number" min="1" step="0.01" value={budget} onChange={e => setBudget(e.target.value)} />
                </div>
            </div>
            <div className="field">
                <label className="label">Estado inicial</label>
                <select value={status} onChange={e => setStatus(e.target.value as any)}>
                    <option value="PAUSED">PAUSED (recomendado)</option>
                    <option value="ACTIVE">ACTIVE</option>
                </select>
            </div>
            <p className="muted" style={{ fontSize: 11, margin: 0 }}>
                💡 La campaña se crea en Meta. Recuerda añadir ad sets y ads antes de activarla si eliges PAUSED.
            </p>
        </Modal>
    );
}

function EditCampaignModal({ campaign, onClose, onSubmit, busy, currency }: {
    campaign: CampaignSnapshot | null; onClose: () => void;
    onSubmit: (patch: any) => void; busy: boolean; currency: string;
}) {
    const [name, setName] = useState('');
    const [status, setStatus] = useState<'ACTIVE' | 'PAUSED' | 'ARCHIVED'>('PAUSED');
    const [daily, setDaily] = useState('');
    const [lifetime, setLifetime] = useState('');

    useEffect(() => {
        if (campaign) {
            setName(campaign.name);
            setStatus((campaign.status as any) ?? 'PAUSED');
            setDaily(campaign.daily_budget ? (toCents(campaign.daily_budget) / 100).toString() : '');
            setLifetime(campaign.lifetime_budget ? (toCents(campaign.lifetime_budget) / 100).toString() : '');
        }
    }, [campaign]);

    if (!campaign) return null;

    function submit() {
        const patch: any = {};
        if (name && name !== campaign!.name) patch.name = name;
        if (status !== campaign!.status) patch.status = status;
        const dailyCents = daily ? Math.round(parseFloat(daily) * 100) : null;
        const lifeCents = lifetime ? Math.round(parseFloat(lifetime) * 100) : null;
        const origDaily = campaign!.daily_budget ? toCents(campaign!.daily_budget) : null;
        const origLife = campaign!.lifetime_budget ? toCents(campaign!.lifetime_budget) : null;
        if (dailyCents !== origDaily && dailyCents) patch.daily_budget_cents = dailyCents;
        if (lifeCents !== origLife && lifeCents) patch.lifetime_budget_cents = lifeCents;
        if (Object.keys(patch).length === 0) { onClose(); return; }
        onSubmit(patch);
    }

    return (
        <Modal open={!!campaign} onClose={onClose} title={`Editar: ${campaign.name}`} width={520}
            footer={
                <>
                    <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={busy}>Cancelar</button>
                    <button className="btn btn-primary btn-sm" onClick={submit} disabled={busy}>
                        {busy ? 'Guardando…' : 'Guardar cambios'}
                    </button>
                </>
            }>
            <div className="field">
                <label className="label">Nombre</label>
                <input value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="field">
                <label className="label">Estado</label>
                <select value={status} onChange={e => setStatus(e.target.value as any)}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PAUSED">PAUSED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                </select>
            </div>
            <div className="row" style={{ gap: 10 }}>
                <div className="field" style={{ flex: 1 }}>
                    <label className="label">Budget diario ({currency})</label>
                    <input type="number" min="0" step="0.01" value={daily} onChange={e => setDaily(e.target.value)}
                        placeholder={campaign.daily_budget ? '' : 'no configurado'} />
                </div>
                <div className="field" style={{ flex: 1 }}>
                    <label className="label">Budget total ({currency})</label>
                    <input type="number" min="0" step="0.01" value={lifetime} onChange={e => setLifetime(e.target.value)}
                        placeholder={campaign.lifetime_budget ? '' : 'no configurado'} />
                </div>
            </div>
            <p className="muted" style={{ fontSize: 11, margin: 0 }}>
                ⚠ Solo cambia un tipo de budget (diario o total). Meta rechaza ambos simultáneamente.
            </p>
        </Modal>
    );
}

function CreatePostModal({ open, onClose, onSubmit, busy }: {
    open: boolean; onClose: () => void; onSubmit: (msg: string, link?: string) => void; busy: boolean;
}) {
    const [msg, setMsg] = useState('');
    const [link, setLink] = useState('');
    useEffect(() => { if (open) { setMsg(''); setLink(''); } }, [open]);
    return (
        <Modal open={open} onClose={onClose} title="Publicar post" width={520}
            footer={
                <>
                    <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={busy}>Cancelar</button>
                    <button className="btn btn-primary btn-sm" onClick={() => msg && onSubmit(msg, link || undefined)} disabled={busy || !msg}>
                        {busy ? 'Publicando…' : 'Publicar'}
                    </button>
                </>
            }>
            <div className="field">
                <label className="label">Mensaje</label>
                <textarea rows={5} value={msg} onChange={e => setMsg(e.target.value)}
                    placeholder="Escribe el contenido del post…" />
            </div>
            <div className="field">
                <label className="label">Link (opcional)</label>
                <input type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="https://…" />
            </div>
        </Modal>
    );
}

export default function CampaignsPage() {
    return <Suspense><CampaignsContent /></Suspense>;
}
