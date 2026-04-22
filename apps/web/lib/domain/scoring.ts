/**
 * Explainable scoring engine.
 * Spec: dashboard_meta_claude_spec.md §9.
 *
 * Each scorer returns a `Score` with a 0..100 value AND the factor
 * breakdown that produced it, so the UI can render "why" on hover.
 */
import type {
    AdAccountSnapshot, CampaignSnapshot, PageSnapshot, BmSnapshot,
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

export function accessRiskScore(bms: BmSnapshot[]): Score {
    // Lower score = more risk. Simple heuristic from data we currently have:
    // only owner BMs vs client BMs count. Without user/roles API this is a
    // rough proxy — spec §7.4 asks us to go deeper once business_users/system_users endpoints are wired.
    const owned = bms.filter(b => b.role === 'owner').length;
    const total = bms.length;
    const diversity = total === 0 ? 0 : Math.min(100, (owned / total) * 100);
    const verified = bms.filter(b => b.verification_status && b.verification_status !== 'not_verified').length;
    const verifiedScore = total === 0 ? 0 : (verified / total) * 100;

    const factors: ScoreFactor[] = [
        { key: 'owned_share',    label: 'Control directo',    weight: 0.5, value: diversity },
        { key: 'verified_share', label: 'BMs verificados',    weight: 0.5, value: verifiedScore },
    ];
    return {
        key: 'access_risk_score',
        label: 'Access risk (inverso)',
        score: weighted(factors),
        factors,
        explanation: 'Proxy actual basado en control directo y verificación. Se profundizará con business_users / system_users.',
    };
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
