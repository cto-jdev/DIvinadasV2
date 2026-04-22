/**
 * Dashboard UI primitives — 2026 design system.
 * Reusable, accessibility-aware, density-adaptive.
 */
'use client';
import React from 'react';
import type { Score, Severity } from '@/lib/domain/types';

// ---------- Score ----------

export function ScoreBadge({ value, tooltip }: { value: number; tooltip?: string }) {
    const klass = value >= 75 ? 'score-ok' : value >= 50 ? 'score-warn' : 'score-bad';
    return <span className={`score-badge ${klass}`} title={tooltip}>{Math.round(value)}</span>;
}

export function ScoreCard({ score, accent, expanded }: {
    score: Score; accent?: boolean; expanded?: boolean;
}) {
    const color = score.score >= 75 ? 'var(--success)' : score.score >= 50 ? 'var(--warning)' : 'var(--danger)';
    return (
        <div className="card" title={score.explanation} style={{
            flex: expanded ? '1 1 100%' : '1 1 220px', minWidth: 200, marginBottom: 0,
            padding: 16,
            borderLeft: accent ? `3px solid ${color}` : undefined,
        }}>
            <div className="stat-label">{score.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color, marginTop: 2, lineHeight: 1 }}>
                {score.score}
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, marginLeft: 4 }}>/100</span>
            </div>
            <div style={{ marginTop: 10 }}>
                {score.factors.map(f => (
                    <div key={f.key} style={{ fontSize: 11, marginTop: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)' }}>
                            <span>{f.label}</span>
                            <span style={{ color: 'var(--text)', fontWeight: 600 }}>{Math.round(f.value)}</span>
                        </div>
                        <div className="progress" style={{ marginTop: 2, height: 4 }}>
                            <div
                                className={`progress-fill ${f.value >= 75 ? 'progress-ok' : f.value >= 50 ? 'progress-warn' : 'progress-bad'}`}
                                style={{ width: `${Math.min(100, f.value)}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ---------- Stat tile ----------

export function Stat({ label, value, hint, tone, icon }: {
    label: string;
    value: React.ReactNode;
    hint?: string;
    tone?: 'ok' | 'warn' | 'danger';
    icon?: string;
}) {
    const klass = tone === 'danger' ? 'stat-danger' : tone === 'warn' ? 'stat-warn' : tone === 'ok' ? 'stat-ok' : '';
    return (
        <div className={`stat ${klass}`}>
            <div className="stat-label">{icon && <span style={{ marginRight: 4 }}>{icon}</span>}{label}</div>
            <div className="stat-value">{value}</div>
            {hint && <div className="stat-hint">{hint}</div>}
        </div>
    );
}

// ---------- Severity chip ----------

export function SeverityChip({ s }: { s: Severity }) {
    const map: Record<Severity, { klass: string; label: string }> = {
        critical: { klass: 'chip-crit', label: 'Crit' },
        high:     { klass: 'chip-high', label: 'High' },
        medium:   { klass: 'chip-med',  label: 'Med'  },
        low:      { klass: 'chip-low',  label: 'Low'  },
    };
    const { klass, label } = map[s];
    return <span className={`chip ${klass}`}>{label}</span>;
}

// ---------- Segmented ----------

export function Segmented<T extends string>({ value, onChange, options }: {
    value: T;
    onChange: (v: T) => void;
    options: { id: T; label: React.ReactNode }[];
}) {
    return (
        <div className="segmented" role="tablist">
            {options.map(o => (
                <button
                    key={o.id}
                    role="tab"
                    aria-selected={value === o.id}
                    className={`segmented-btn ${value === o.id ? 'active' : ''}`}
                    onClick={() => onChange(o.id)}
                >{o.label}</button>
            ))}
        </div>
    );
}

// ---------- Skeleton ----------

export function SkeletonRow({ count = 3 }: { count?: number }) {
    return (
        <div className="col" style={{ gap: 8 }}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="skeleton skeleton-block" style={{ height: 64 }} />
            ))}
        </div>
    );
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
    return (
        <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="skeleton" style={{ flex: '1 1 140px', height: 68, borderRadius: 10 }} />
            ))}
        </div>
    );
}

// ---------- Empty state ----------

export function EmptyState({ icon = '∅', title, description, cta }: {
    icon?: string; title: string; description?: string; cta?: React.ReactNode;
}) {
    return (
        <div className="empty">
            <span className="empty-icon">{icon}</span>
            <h3 style={{ margin: '4px 0 6px', fontSize: 16 }}>{title}</h3>
            {description && <p className="muted" style={{ margin: '0 0 12px', fontSize: 13 }}>{description}</p>}
            {cta}
        </div>
    );
}

// ---------- Freshness badge ----------

export function FreshnessBadge({ lastSync, status = 'ok' }: {
    lastSync: string | null;
    status?: 'ok' | 'stale' | 'failed';
}) {
    if (!lastSync) return null;
    const label = status === 'ok' ? 'live' : status === 'stale' ? 'desactualizado' : 'falló';
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 11, color: 'var(--text-dim)' }}>
            <span className={`fresh-dot ${status === 'ok' ? '' : status}`} />
            {label} · {new Date(lastSync).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
        </span>
    );
}

// ---------- Sortable table ----------

export type Column<T> = {
    key: string;
    label: React.ReactNode;
    sortable?: boolean;
    align?: 'left' | 'right' | 'center';
    width?: number | string;
    sortFn?: (a: T, b: T) => number;
    render: (row: T) => React.ReactNode;
};

export function SortableTable<T>({ columns, rows, emptyLabel, initialSort, rowKey }: {
    columns: Column<T>[];
    rows: T[];
    emptyLabel?: string;
    initialSort?: { key: string; dir: 'asc' | 'desc' };
    rowKey: (row: T, i: number) => string;
}) {
    const [sortKey, setSortKey] = React.useState(initialSort?.key ?? '');
    const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>(initialSort?.dir ?? 'desc');

    const sorted = React.useMemo(() => {
        const col = columns.find(c => c.key === sortKey);
        if (!col?.sortFn) return rows;
        const out = [...rows].sort(col.sortFn);
        return sortDir === 'asc' ? out : out.reverse();
    }, [columns, rows, sortKey, sortDir]);

    const handleSort = (col: Column<T>) => {
        if (!col.sortable) return;
        if (sortKey === col.key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(col.key); setSortDir('desc'); }
    };

    if (rows.length === 0) {
        return <p className="muted" style={{ margin: 0, fontSize: 13 }}>{emptyLabel ?? 'Sin datos.'}</p>;
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table className="dtable">
                <thead>
                    <tr>
                        {columns.map(c => (
                            <th
                                key={c.key}
                                className={c.sortable ? 'sortable' : ''}
                                style={{ textAlign: c.align ?? 'left', width: c.width }}
                                onClick={() => handleSort(c)}
                            >
                                {c.label}
                                {c.sortable && sortKey === c.key && (
                                    <span className="sort-arrow">{sortDir === 'asc' ? '▲' : '▼'}</span>
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((r, i) => (
                        <tr key={rowKey(r, i)}>
                            {columns.map(c => (
                                <td key={c.key} style={{ textAlign: c.align ?? 'left' }}>{c.render(r)}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ---------- Section header ----------

export function SectionHeader({ icon, title, hint, action }: {
    icon?: string; title: string; hint?: string; action?: React.ReactNode;
}) {
    return (
        <div className="row-between" style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
                <h2 style={{ margin: 0, fontSize: 16, letterSpacing: '-0.01em' }}>{title}</h2>
                {hint && <span className="muted" style={{ fontSize: 11 }}>{hint}</span>}
            </div>
            {action}
        </div>
    );
}

// ---------- Inline charts ----------

export function Sparkline({ values, width = 120, height = 32, stroke = 'var(--primary, #A855F7)' }: {
    values: number[]; width?: number; height?: number; stroke?: string;
}) {
    if (!values.length) return <span className="muted" style={{ fontSize: 11 }}>—</span>;
    const min = Math.min(...values), max = Math.max(...values);
    const range = max - min || 1;
    const step = values.length > 1 ? width / (values.length - 1) : width;
    const pts = values.map((v, i) => `${i * step},${height - ((v - min) / range) * height}`).join(' ');
    const area = `0,${height} ${pts} ${width},${height}`;
    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
            <polygon points={area} fill={stroke} opacity={0.12} />
            <polyline points={pts} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export function MiniBar({ values, width = 120, height = 32, color = 'var(--primary, #A855F7)' }: {
    values: number[]; width?: number; height?: number; color?: string;
}) {
    if (!values.length) return <span className="muted" style={{ fontSize: 11 }}>—</span>;
    const max = Math.max(...values) || 1;
    const bw = width / values.length;
    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
            {values.map((v, i) => {
                const h = (v / max) * height;
                return <rect key={i} x={i * bw + 1} y={height - h} width={Math.max(1, bw - 2)} height={h} fill={color} rx={1} />;
            })}
        </svg>
    );
}

export function DonutGauge({ value, size = 64, stroke = 8, label }: {
    value: number; size?: number; stroke?: number; label?: string;
}) {
    const pct = Math.max(0, Math.min(100, value));
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const dash = (pct / 100) * c;
    const color = pct >= 75 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)';
    return (
        <div style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
            <svg width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={stroke} />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                    strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`} />
            </svg>
            <div style={{
                position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
                fontSize: size / 4, fontWeight: 700, color,
            }}>{Math.round(pct)}</div>
            {label && <div className="muted" style={{ fontSize: 10, textAlign: 'center', marginTop: 2 }}>{label}</div>}
        </div>
    );
}

// ---------- Pacing pill ----------

export function PacingPill({ state }: { state: string | null }) {
    if (!state) return <span className="muted">—</span>;
    const map: Record<string, { klass: string; label: string }> = {
        on_track:               { klass: 'pill-success', label: 'on track' },
        underpaced:             { klass: 'pill-muted',   label: 'lento' },
        accelerated:            { klass: 'pill-warn',    label: 'acelerado' },
        critically_accelerated: { klass: 'pill-danger',  label: 'crítico' },
    };
    const s = map[state] ?? { klass: 'pill-muted', label: state };
    return <span className={`pill ${s.klass}`} style={{ fontSize: 10 }}>{s.label}</span>;
}
