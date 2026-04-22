/**
 * Explainable scoring engine.
 * Spec: dashboard_meta_claude_spec.md §9.
 *
 * Each scorer returns a `Score` with a 0..100 value AND the factor
 * breakdown that produced it, so the UI can render "why" on hover.
 */
import type {
    AdAccountSnapshot, CampaignSnapshot, PageSnapshot, BmSnapshot,
    BmUsersSnapshot, AdSetSnapshot,
    Score, ScoreFactor,
} from './types';
import { capUtilizationPct, toCents, classifyPacing, expectedSpendToDate } from './budget';

function weighted(factors: ScoreFactor[]): number {
    const total = factors.reduce((acc, f) => acc + f.weight * f.value, 0);
    return Math.round(Math.max(0, Math.min(100, total)));
}

// ---------- Billing / Budget per ad account ----------

export function billingHealthScore(acct: AdAccountSnapshot): Score {
    // 100 = no signs of billing stress; 0 = cuenta congelada.
    const statusOk = acct.account_status === 1 ? 100 : acct.account_status === 9 ? 40 : 0;
    const capUtil = capUtilizationPct(acct.amount_spent, acct.spend_cap);
    const capPressure = capUtil === null ? 100 : Math.max(0, 100 - capUtil); // used 80% → 20

    const balance = toCents(acct.balance);
    const spent = toCents(acct.amount_spent);
    // balance coverage: ratio balance / avg daily spend rough (1% of total spend as proxy)
    const dailyProxy = Math.max(1, spent / 30);
    const coverageDays = balance / dailyProxy;
    const balanceScore = Math.min(100, (coverageDays / 14) * 100); // 14 días buffer

    const factors: ScoreFactor[] = [
        { key: 'account_status',  label: 'Estado cuenta',         weight: 0.45, value: statusOk },
        { key: 'cap_pressure',    label: 'Presión spend cap',     weight: 0.35, value: capPressure },
        { key: 'balance_buffer',  label: 'Cobertura de balance',  weight: 0.20, value: balanceScore },
    ];
    return {
        key: 'billing_health_score',
        label: 'Billing health',
        score: weighted(factors),
        factors,
        explanation: 'Combina estado de la cuenta, porcentaje consumido del spend cap y cobertura del balance actual.',
    };
}

// ---------- Campaign efficiency / waste ----------

export function campaignEfficiencyScore(c: CampaignSnapshot, currencyCpcCents = 200): Score {
    const spend = toCents(c.spend);
    const clicks = Number(c.clicks ?? 0);
    const impressions = Number(c.impressions ?? 0);
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const cpc = clicks > 0 ? spend / clicks : 0;

    const ctrScore = ctr >= 2 ? 100 : ctr >= 1 ? 80 : ctr >= 0.5 ? 50 : 20;
    const cpcScore = cpc === 0 ? 0 : cpc <= currencyCpcCents ? 100 : cpc <= currencyCpcCents * 2 ? 60 : 25;
    const deliveryScore = impressions > 1000 ? 100 : impressions > 100 ? 60 : 20;

    const factors: ScoreFactor[] = [
        { key: 'ctr',      label: 'CTR',                weight: 0.4, value: ctrScore },
        { key: 'cpc',      label: 'CPC relativo',       weight: 0.4, value: cpcScore },
        { key: 'delivery', label: 'Volumen de entrega', weight: 0.2, value: deliveryScore },
    ];
    return {
        key: 'campaign_efficiency_score',
        label: 'Eficiencia',
        score: weighted(factors),
        factors,
        explanation: 'CTR, CPC relativo a la referencia y volumen de impresiones.',
    };
}

/** Pacing-derived score. 100 = on_track, 0 = crítico. */
export function campaignPacingScore(c: CampaignSnapshot, nowIso?: string): { score: number; state: string | null } {
    const planned = toCents(c.daily_budget || c.lifetime_budget);
    if (planned <= 0) return { score: 50, state: null };
    const expected = expectedSpendToDate(planned, c.start_time, c.stop_time, nowIso);
    const actual = toCents(c.spend);
    const state = classifyPacing(actual, expected);
    const map: Record<string, number> = {
        on_track: 100, underpaced: 55, accelerated: 35, critically_accelerated: 10,
    };
    return { score: map[state], state };
}

// ---------- Page health ----------

export function pageHealthScore(p: PageSnapshot): Score {
    const published = p.is_published === false ? 0 : 100;
    const ig = p.instagram_business_account ? 100 : 40;
    const verified = p.verification_status && p.verification_status !== 'not_verified' ? 100 : 60;
    const followers = (p.followers_count ?? 0) >= 1000 ? 100 : (p.followers_count ?? 0) >= 100 ? 70 : 40;

    const factors: ScoreFactor[] = [
        { key: 'published', label: 'Publicada',        weight: 0.25, value: published },
        { key: 'ig_linked', label: 'Instagram vinculado', weight: 0.25, value: ig },
        { key: 'verified',  label: 'Verificación',      weight: 0.20, value: verified },
        { key: 'audience',  label: 'Audiencia base',    weight: 0.30, value: followers },
    ];
    return {
        key: 'page_health_score',
        label: 'Page health',
        score: weighted(factors),
        factors,
        explanation: 'Publicación, vínculo con IG, verificación y tamaño de audiencia base.',
    };
}

// ---------- Access risk (BM) ----------

export function accessRiskScore(
    bms: BmSnapshot[],
    usersByBm?: Record<string, BmUsersSnapshot>,
): Score {
    // Lower score = more risk. Higher score = healthier.
    const owned = bms.filter(b => b.role === 'owner').length;
    const total = bms.length;
    const diversity = total === 0 ? 0 : Math.min(100, (owned / total) * 100);
    const verified = bms.filter(b => b.verification_status && b.verification_status !== 'not_verified').length;
    const verifiedScore = total === 0 ? 0 : (verified / total) * 100;

    // User governance: penaliza BMs con 1 solo admin humano (bus factor 1),
    // premia diversidad razonable (2-5 humanos + ≥1 system user).
    let usersKnown = 0, busFactorSum = 0, systemCoverage = 0, pendingOrphans = 0;
    if (usersByBm) {
        for (const bm of bms) {
            const u = usersByBm[bm.id];
            if (!u || u.scope_missing) continue;
            usersKnown++;
            const humans = u.humans.length;
            busFactorSum += humans === 0 ? 0 : humans === 1 ? 20 : humans >= 2 && humans <= 5 ? 100 : 70;
            systemCoverage += u.system.length > 0 ? 100 : 40;
            pendingOrphans += u.pending.length;
        }
    }
    const busFactorScore = usersKnown === 0 ? 50 : busFactorSum / usersKnown;
    const systemScore = usersKnown === 0 ? 50 : systemCoverage / usersKnown;

    const factors: ScoreFactor[] = usersKnown > 0 ? [
        { key: 'owned_share',    label: 'Control directo',    weight: 0.25, value: diversity },
        { key: 'verified_share', label: 'BMs verificados',    weight: 0.20, value: verifiedScore },
        { key: 'bus_factor',     label: 'Bus factor (humanos)', weight: 0.30, value: busFactorScore },
        { key: 'system_users',   label: 'System users',       weight: 0.25, value: systemScore },
    ] : [
        { key: 'owned_share',    label: 'Control directo',    weight: 0.5, value: diversity },
        { key: 'verified_share', label: 'BMs verificados',    weight: 0.5, value: verifiedScore },
    ];
    return {
        key: 'access_risk_score',
        label: 'Access risk (inverso)',
        score: weighted(factors),
        factors,
        explanation: usersKnown > 0
            ? `Control directo, verificación, redundancia de humanos y cobertura de system users (${usersKnown}/${bms.length} BMs con datos de usuarios).`
            : 'Proxy basado en control directo y verificación. Para un score completo se requiere scope business_management.',
    };
}

// ---------- Ad Set scoring (uses same primitives as campaign-level) ----------

export function adsetPacingScore(a: AdSetSnapshot, nowIso?: string): { score: number; state: string | null } {
    const planned = Number(a.daily_budget ?? a.lifetime_budget ?? 0);
    if (planned <= 0) return { score: 50, state: null };
    const actual = Number(a.spend ?? 0);
    // Reuse expected/actual logic via campaign formula — simplified here.
    const now = nowIso ? new Date(nowIso).getTime() : Date.now();
    const start = a.start_time ? new Date(a.start_time).getTime() : now;
    const stop = a.end_time ? new Date(a.end_time).getTime() : undefined;
    let expected = planned;
    if (stop && stop > start) {
        const elapsed = Math.min(now, stop) - start;
        expected = planned * Math.max(0, elapsed / (stop - start));
    }
    if (expected <= 0) return { score: 50, state: null };
    const ratio = actual / expected;
    const state =
        ratio < 0.6 ? 'underpaced' :
        ratio <= 1.15 ? 'on_track' :
        ratio <= 1.5 ? 'accelerated' : 'critically_accelerated';
    const map: Record<string, number> = {
        on_track: 100, underpaced: 55, accelerated: 35, critically_accelerated: 10,
    };
    return { score: map[state], state };
}

// ---------- Global Health ----------

export function globalHealthScore(parts: {
    billing: Score[];
    pages: Score[];
    access: Score;
}): Score {
    const avg = (ss: Score[]) => ss.length === 0 ? 50 : ss.reduce((a, s) => a + s.score, 0) / ss.length;
    const billing = avg(parts.billing);
    const pages = avg(parts.pages);

    const factors: ScoreFactor[] = [
        { key: 'billing', label: 'Billing & budget', weight: 0.5, value: billing },
        { key: 'access',  label: 'Access & gobernanza', weight: 0.3, value: parts.access.score },
        { key: 'pages',   label: 'Pages salud',      weight: 0.2, value: pages },
    ];
    return {
        key: 'global_health_score',
        label: 'Global health',
        score: weighted(factors),
        factors,
        explanation: 'Mezcla ponderada: billing/budget 50 %, accesos 30 %, pages 20 %.',
    };
}
