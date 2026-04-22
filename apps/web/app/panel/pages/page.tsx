'use client';
/**
 * Pages Module — health y readiness para ads.
 * Spec: dashboard_meta_claude_spec.md §7.5.
 *
 * Score explicable + readiness-for-ads (publicada + IG + verificación).
 * Feedback Score Verde/Amarilla/Roja NO está expuesto en Graph público:
 * lo marcamos `unsupported`. Usamos proxies: followers, IG, verified.
 */
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';
import type { PageSnapshot, Score } from '@/lib/domain/types';
import { pageHealthScore } from '@/lib/domain/scoring';
import { useRegisterCopilotScope } from '@/components/copilot/context';

type Conn = { id: string; display_name: string | null };

function PagesContent() {
    const sp = useSearchParams();
    const tenantId = sp.get('tenant');
    const connParam = sp.get('conn');

    const [conns, setConns] = useState<Conn[] | null>(null);
    const [connId, setConnId] = useState(connParam ?? '');
    const [pages, setPages] = useState<PageSnapshot[] | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'ready' | 'issues'>('all');

    const loadConns = useCallback(async () => {
        if (!tenantId) return;
        const r = await apiFetch(`/api/meta/connections?tenant_id=${tenantId}`);
        const j = await r.json().catch(() => ({}));
        if (!r.ok) { setErr(j.error ?? `HTTP ${r.status}`); return; }
        setConns(j.data);
        if (!connId && j.data?.length) setConnId(j.data[0].id);
    }, [tenantId, connId]);
    useEffect(() => { loadConns(); }, [loadConns]);

    const load = useCallback(async () => {
        if (!tenantId || !connId) return;
        setPages(null); setErr(null);
        const r = await apiFetch(`/api/web/graph/pages/list?tenant_id=${tenantId}&connection_id=${connId}`);
        const j = await r.json().catch(() => ({}));
        if (!r.ok) { setErr(j.message ?? `HTTP ${r.status}`); return; }
        const now = new Date().toISOString();
        setPages((j.data ?? []).map((p: any) => ({
            id: p.id, name: p.name, category: p.category,
            fan_count: p.fan_count, followers_count: p.followers_count,
            verification_status: p.verification_status,
            link: p.link, is_published: p.is_published,
            instagram_business_account: p.instagram_business_account ?? null,
            picture_url: p.picture?.data?.url,
            source_type: 'api', source_endpoint: '/me/accounts', last_sync_at: now,
        })));
    }, [tenantId, connId]);
    useEffect(() => { load(); }, [load]);

    const rows = useMemo(() => {
        if (!pages) return null;
        return pages.map(p => {
            const score = pageHealthScore(p);
            const readyForAds =
                p.is_published !== false &&
                !!p.instagram_business_account &&
                (p.followers_count ?? 0) >= 100;
            const issues: string[] = [];
            if (p.is_published === false) issues.push('No publicada');
            if (!p.instagram_business_account) issues.push('IG no vinculado');
            if ((p.followers_count ?? 0) < 100) issues.push('Audiencia < 100');
            if (!p.verification_status || p.verification_status === 'not_verified') issues.push('Sin verificación');
            return { p, score, readyForAds, issues };
        });
    }, [pages]);

    const filtered = useMemo(() => {
        if (!rows) return null;
        if (filter === 'ready') return rows.filter(r => r.readyForAds);
        if (filter === 'issues') return rows.filter(r => r.issues.length > 0);
        return rows;
    }, [rows, filter]);

    const summary = useMemo(() => {
        if (!rows) return null;
        const total = rows.length;
        const ready = rows.filter(r => r.readyForAds).length;
        const withIg = rows.filter(r => r.p.instagram_business_account).length;
        const verified = rows.filter(r => r.p.verification_status && r.p.verification_status !== 'not_verified').length;
        const unpublished = rows.filter(r => r.p.is_published === false).length;
        const avg = total > 0 ? Math.round(rows.reduce((a, r) => a + r.score.score, 0) / total) : 0;
        return { total, ready, withIg, verified, unpublished, avg };
    }, [rows]);

    useRegisterCopilotScope({
        module: 'pages',
        tenantId: tenantId ?? undefined,
        connectionId: connId || undefined,
        summary: {
            pages_count: summary?.total,
            pages_ready: summary?.ready,
        },
        top_decisions: [],
        scores: [],
        raw: { pages: pages ?? undefined },
    }, [tenantId, connId, pages, summary]);

    if (!tenantId) return <div className="card"><h2>Falta tenant</h2><p className="muted">Abre desde <Link href="/panel">inicio</Link>.</p></div>;

    return (
        <>
            <header className="row-between" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                    <h1 className="text-grad" style={{ fontSize: 26, marginBottom: 4 }}>📄 Pages — Health & Readiness</h1>
                    <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                        Salud de fanpages y su disposición para campañas publicitarias.
                    </p>
                </div>
                <Link href={`/panel/dashboard?tenant=${tenantId}`} className="btn btn-ghost btn-sm">← Dashboard</Link>
            </header>

            {err && <div className="alert alert-error" style={{ marginBottom: 12 }}>Error: {err}</div>}

            {conns && conns.length > 1 && (
                <div className="card" style={{ marginBottom: 12 }}>
                    <div className="field" style={{ marginBottom: 0, maxWidth: 320 }}>
                        <label className="label">Conexión Meta</label>
                        <select value={connId} onChange={e => setConnId(e.target.value)}>
                            {conns.map(c => <option key={c.id} value={c.id}>{c.display_name ?? c.id.slice(0, 8)}</option>)}
                        </select>
                    </div>
                </div>
            )}

            {pages === null && !err && <p className="muted">Cargando páginas…</p>}

            {summary && rows && (
                <>
                    {/* KPIs */}
                    <div className="row" style={{ gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                        <AvgCard score={summary.avg} />
                        <MiniStat label="Total pages" value={summary.total} />
                        <MiniStat label="Ready for ads" value={summary.ready}
                                  tone={summary.ready === summary.total ? 'ok' : 'warn'} />
                        <MiniStat label="Con Instagram" value={summary.withIg} />
                        <MiniStat label="Verificadas" value={summary.verified} />
                        <MiniStat label="No publicadas" value={summary.unpublished}
                                  tone={summary.unpublished > 0 ? 'warn' : 'ok'} />
                    </div>

                    {/* Filter */}
                    <div className="row" style={{ gap: 6, marginBottom: 10 }}>
                        <FilterBtn active={filter === 'all'}    onClick={() => setFilter('all')}>Todas ({summary.total})</FilterBtn>
                        <FilterBtn active={filter === 'ready'}  onClick={() => setFilter('ready')}>Ready ({summary.ready})</FilterBtn>
                        <FilterBtn active={filter === 'issues'} onClick={() => setFilter('issues')}>Con issues ({rows.filter(r => r.issues.length > 0).length})</FilterBtn>
                    </div>

                    <div className="col" style={{ gap: 10 }}>
                        {filtered?.map(({ p, score, readyForAds, issues }) => (
                            <div key={p.id} className="card" style={{ marginBottom: 0 }}>
                                <div className="row" style={{ gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                    {p.picture_url
                                        ? <img src={p.picture_url} width={56} height={56}
                                               style={{ borderRadius: 10, border: '1px solid var(--border-hi)' }} alt="" />
                                        : <div style={{ width: 56, height: 56, borderRadius: 10, background: 'linear-gradient(135deg,#A855F7,#7E22CE)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 20 }}>
                                            {p.name.slice(0, 1).toUpperCase()}</div>}
                                    <div style={{ flex: '1 1 240px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                            <strong style={{ fontSize: 15 }}>{p.name}</strong>
                                            <ScorePill value={score.score} tooltip={score.explanation} />
                                            {readyForAds
                                                ? <span className="pill pill-success" style={{ fontSize: 10 }}>✓ Ready for ads</span>
                                                : <span className="pill pill-warn" style={{ fontSize: 10 }}>⚠ No ready</span>}
                                        </div>
                                        <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
                                            {p.category ?? '—'} · ID {p.id}
                                        </div>
                                        <div className="row" style={{ gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                                            {typeof p.followers_count === 'number' && (
                                                <span className="pill pill-muted" style={{ fontSize: 10 }}>
                                                    {new Intl.NumberFormat('es').format(p.followers_count)} seguidores
                                                </span>
                                            )}
                                            {p.is_published === false && <span className="pill pill-warn" style={{ fontSize: 10 }}>oculta</span>}
                                            {p.verification_status && p.verification_status !== 'not_verified' && (
                                                <span className="pill pill-success" style={{ fontSize: 10 }}>✓ {p.verification_status}</span>
                                            )}
                                            {p.instagram_business_account && (
                                                <span className="pill pill-success" style={{ fontSize: 10 }}>IG @{p.instagram_business_account.username}</span>
                                            )}
                                        </div>
                                        {issues.length > 0 && (
                                            <div style={{ marginTop: 8, fontSize: 12 }}>
                                                <span className="muted">Issues: </span>
                                                {issues.map((iss, i) => (
                                                    <span key={i} style={{
                                                        display: 'inline-block', marginRight: 6,
                                                        padding: '1px 6px', borderRadius: 4, fontSize: 11,
                                                        background: 'rgba(245,158,11,.15)', color: '#f59e0b',
                                                    }}>{iss}</span>
                                                ))}
                                            </div>
                                        )}
                                        {/* Factor breakdown */}
                                        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--muted)' }}>
                                            {score.factors.map(f => (
                                                <span key={f.key} style={{ marginRight: 10 }}>
                                                    {f.label} <strong style={{ color: 'var(--text)' }}>{Math.round(f.value)}</strong>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">Abrir ↗</a>}
                                </div>
                            </div>
                        ))}
                        {filtered?.length === 0 && (
                            <div className="card"><p className="muted" style={{ margin: 0 }}>Sin páginas en este filtro.</p></div>
                        )}
                    </div>

                    <div className="card" style={{ marginTop: 12, borderLeft: '3px solid #64748b' }}>
                        <h3 style={{ marginTop: 0, fontSize: 14 }}>Feedback Score — pendiente</h3>
                        <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                            El score Verde/Amarilla/Roja y detección de links rotos NO están expuestos en Graph
                            público. Requieren <code>pages_read_user_content</code> + scraping de Page Quality
                            Tools. Fuente marcada <strong>unsupported</strong>. Se usa proxy: publicación + IG + verificación + audiencia.
                        </p>
                    </div>
                </>
            )}
        </>
    );
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button onClick={onClick} className={active ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}>{children}</button>
    );
}

function AvgCard({ score }: { score: number }) {
    const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
    return (
        <div className="card" style={{ flex: '1 1 200px', minWidth: 180, marginBottom: 0, borderLeft: `3px solid ${color}` }}>
            <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase' }}>Page Health promedio</div>
            <div style={{ fontSize: 32, fontWeight: 800, color, marginTop: 4 }}>{score}</div>
        </div>
    );
}

function ScorePill({ value, tooltip }: { value: number; tooltip?: string }) {
    const bg = value >= 75 ? '#22c55e' : value >= 50 ? '#f59e0b' : '#ef4444';
    return (
        <span title={tooltip} style={{
            display: 'inline-block', minWidth: 32,
            background: bg, color: 'white', fontSize: 11, fontWeight: 700,
            padding: '2px 8px', borderRadius: 4,
        }}>{value}</span>
    );
}

function MiniStat({ label, value, tone, hint }: {
    label: string; value: string | number; tone?: 'ok' | 'warn' | 'danger'; hint?: string;
}) {
    const color = tone === 'danger' ? '#ef4444' : tone === 'warn' ? '#f59e0b' : undefined;
    return (
        <div style={{
            flex: '1 1 140px', minWidth: 130,
            padding: '10px 12px', borderRadius: 8,
            background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
        }}>
            <div className="muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: .5 }}>{label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: color ?? 'var(--text)', marginTop: 2 }}>{value}</div>
            {hint && <div className="muted" style={{ fontSize: 10 }}>{hint}</div>}
        </div>
    );
}

export default function PagesPage() {
    return <Suspense><PagesContent /></Suspense>;
}
