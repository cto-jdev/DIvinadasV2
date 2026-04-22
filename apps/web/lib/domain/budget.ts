/**
 * Budget derivations — pure functions.
 * Spec: dashboard_meta_claude_spec.md §6.3.
 *
 * All monetary inputs are Meta's string cents. Outputs are numbers in
 * the same unit (cents) so the UI can format with the account currency.
 */
import type { PacingState } from './types';

export function toCents(v: string | number | undefined | null): number {
    if (v === undefined || v === null) return 0;
    const n = typeof v === 'string' ? Number(v) : v;
    return Number.isFinite(n) ? n : 0;
}

/** Remaining spend cap. Returns null when the cap is 0 / missing (no cap). */
export function remainingCapCents(amountSpent?: string, spendCap?: string): number | null {
    const cap = toCents(spendCap);
    if (cap <= 0) return null;
    const spent = toCents(amountSpent);
    return Math.max(0, cap - spent);
}

export function capUtilizationPct(amountSpent?: string, spendCap?: string): number | null {
    const cap = toCents(spendCap);
    if (cap <= 0) return null;
    const spent = toCents(amountSpent);
    return (spent / cap) * 100;
}

/** Daily burn rate given a spend series over N days. */
export function burnRate(spendCentsOverWindow: number, windowDays: number): number {
    if (windowDays <= 0) return 0;
    return spendCentsOverWindow / windowDays;
}

/** Days until `remaining` is exhausted at the given burn rate. */
export function daysToExhaust(remainingCents: number | null, burnRateCents: number): number | null {
    if (remainingCents === null || burnRateCents <= 0) return null;
    return remainingCents / burnRateCents;
}

/**
 * Pacing classifier for a campaign / ad set vs its expected spend-to-date.
 * `expected = planned_budget * elapsed_ratio`.
 *  < 60%  → underpaced
 *  60-115% → on_track
 *  115-150% → accelerated
 *  >150% → critically_accelerated
 */
export function classifyPacing(actualCents: number, expectedCents: number): PacingState {
    if (expectedCents <= 0) return 'on_track';
    const ratio = actualCents / expectedCents;
    if (ratio < 0.6)  return 'underpaced';
    if (ratio <= 1.15) return 'on_track';
    if (ratio <= 1.5)  return 'accelerated';
    return 'critically_accelerated';
}

/** Expected spend given a campaign schedule and planned budget. */
export function expectedSpendToDate(
    plannedBudgetCents: number,
    startIso?: string,
    stopIso?: string,
    nowIso?: string,
): number {
    if (plannedBudgetCents <= 0) return 0;
    if (!startIso) return 0;
    const now = nowIso ? new Date(nowIso).getTime() : Date.now();
    const start = new Date(startIso).getTime();
    if (now <= start) return 0;
    if (!stopIso) return plannedBudgetCents;
    const stop = new Date(stopIso).getTime();
    if (stop <= start) return plannedBudgetCents;
    const elapsed = Math.min(now, stop) - start;
    const total = stop - start;
    return plannedBudgetCents * (elapsed / total);
}

/**
 * Budget Waste Risk 0..100 (higher = more wasteful).
 * Heuristic combining: elevated CPC/CPA-ish proxy (cost per click) and
 * low CTR against simple thresholds. Inputs are optional: if we can't
 * compute, we return null so the UI can show "sin datos".
 */
export function budgetWasteRisk(args: {
    spendCents: number;
    clicks: number;
    impressions: number;
    cpcCents?: number;
    ctrPct?: number;
}): number | null {
    const { spendCents, clicks, impressions } = args;
    if (spendCents <= 0 || impressions <= 0) return null;

    const ctr = args.ctrPct ?? (clicks / impressions) * 100;
    const cpc = args.cpcCents ?? (clicks > 0 ? spendCents / clicks : spendCents);

    let risk = 0;
    // CTR band: <0.5% → heavy penalty; 0.5-1% → light; 1-2% → none; >2% → bonus
    if (ctr < 0.5)      risk += 45;
    else if (ctr < 1.0) risk += 25;
    else if (ctr < 2.0) risk += 10;

    // CPC band in cents (reference: 100 = USD 1.00). Tune-able.
    if (cpc > 400)      risk += 40;
    else if (cpc > 200) risk += 25;
    else if (cpc > 100) risk += 10;

    // Click scarcity
    if (clicks < 10) risk += 15;

    return Math.max(0, Math.min(100, risk));
}
