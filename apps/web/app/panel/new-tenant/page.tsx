'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

const ERROR_MESSAGES: Record<string, string> = {
    invalid_slug:         'El slug solo puede contener minúsculas, números y guiones (3–48 caracteres).',
    invalid_display_name: 'El nombre debe tener al menos 2 caracteres.',
    not_authenticated:    'Sesión expirada. Vuelve a entrar.',
    duplicate_key:        'Ese slug ya está en uso. Elige otro.',
};

function slugify(s: string) {
    return s
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 48);
}

export default function NewTenantPage() {
    const router = useRouter();
    const [displayName, setDisplayName] = useState('');
    const [slug, setSlug] = useState('');
    const [slugTouched, setSlugTouched] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    function onDisplayNameChange(v: string) {
        setDisplayName(v);
        if (!slugTouched) setSlug(slugify(v));
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null); setLoading(true);
        const supa = getSupabaseBrowser();
        const { data, error } = await supa.rpc('create_tenant', {
            p_slug: slug,
            p_display_name: displayName,
        });
        setLoading(false);

        if (error) {
            const key = (error.message.match(/invalid_slug|invalid_display_name|not_authenticated/) || [])[0];
            if (key) { setErr(ERROR_MESSAGES[key]); return; }
            if (error.message.includes('duplicate key')) { setErr(ERROR_MESSAGES.duplicate_key); return; }
            setErr(error.message);
            return;
        }
        router.replace(`/panel/connections?tenant=${data}`);
    }

    return (
        <div className="shell-narrow fade-in" style={{ padding: '24px 0' }}>
            <Link href="/panel" className="muted" style={{ fontSize: 13 }}>← Volver</Link>

            <div className="card card-glow" style={{ marginTop: 16 }}>
                <div className="pill" style={{ marginBottom: 12 }}>◆ Nuevo workspace</div>
                <h2 style={{ marginTop: 0 }} className="text-grad">Crear tenant</h2>
                <p className="muted" style={{ marginTop: 0 }}>
                    Un tenant es un espacio aislado con sus propias conexiones de Meta, equipo y licencias.
                    Serás el <strong style={{ color: 'var(--text)' }}>owner</strong>.
                </p>

                <form onSubmit={submit} className="col" style={{ gap: 14, marginTop: 18 }}>
                    <div className="field" style={{ marginBottom: 0 }}>
                        <label className="label">Nombre del workspace</label>
                        <input type="text" required minLength={2} maxLength={80}
                               value={displayName}
                               onChange={e => onDisplayNameChange(e.target.value)}
                               placeholder="Agencia Acme" autoFocus />
                    </div>
                    <div className="field" style={{ marginBottom: 0 }}>
                        <label className="label">Slug <span className="muted" style={{ fontWeight: 400 }}>(URL-friendly, único)</span></label>
                        <div className="row" style={{ gap: 0, alignItems: 'stretch' }}>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center',
                                padding: '0 12px', fontSize: 13, color: 'var(--muted)',
                                background: 'rgba(255,255,255,.02)',
                                border: '1px solid var(--border-hi)',
                                borderRight: 'none',
                                borderRadius: '10px 0 0 10px',
                            }}>divinads.app/</span>
                            <input type="text" required pattern="[a-z0-9][a-z0-9-]{2,48}"
                                   value={slug}
                                   onChange={e => { setSlug(e.target.value.toLowerCase()); setSlugTouched(true); }}
                                   placeholder="agencia-acme"
                                   style={{ borderRadius: '0 10px 10px 0' }} />
                        </div>
                        <p className="muted" style={{ margin: '6px 0 0', fontSize: 12 }}>
                            Minúsculas, números y guiones. 3–48 caracteres.
                        </p>
                    </div>

                    {err && <div className="alert alert-error">{err}</div>}

                    <div className="row" style={{ gap: 10, marginTop: 6 }}>
                        <button className="btn btn-primary" disabled={loading || !slug || !displayName}>
                            {loading ? 'Creando…' : 'Crear tenant'}
                        </button>
                        <Link href="/panel" className="btn btn-ghost">Cancelar</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
