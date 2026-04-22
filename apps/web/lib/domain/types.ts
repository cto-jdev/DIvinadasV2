/**
 * DivinAds domain types — canonical representation that the UI and
 * scoring engine consume. Each field carries a `source_type` so the
 * interface can honestly distinguish API-official data from derived
 * calculations and manual/operator annotations.
 *
 * Spec: dashboard_meta_claude_spec.md §2.2, §8.
 */

export type SourceType = 'api' | 'derived' | 'manual' | 'unsupported';

export type SyncStatus = 'ok' | 'stale' | 'failed' | 'unknown';

export type AdAccountSnapshot = {
    id: string;                    // Meta external id (act_...)
    name: string;
    currency: string;
    account_status: number;
    amount_spent?: string;         // cents (string, from Meta)
    spend_cap?: string;            // cents (0 ⇒ no cap)
    balance?: string;              // cents
    disable_reason?: number;
    timezone_name?: string;
    business_id?: string | null;
    source_type: SourceType;       // typically 'api'
    source_endpoint: string;       // e.g. '/me/adaccounts'
    last_sync_at: string;
};

export type CampaignSnapshot = {
    id: string;
    ad_account_id: string;
    name: string;
    objective?: string;
    status: string;                // ACTIVE, PAUSED, DELETED, ARCHIVED
    effective_status?: string;
    daily_budget?: string;         // cents; present only if campaign-level CBO
    lifetime_budget?: string;      // cents; present only if campaign-level LBO
    budget_remaining?: string;     // cents
    bid_strategy?: string;
    buying_type?: string;
    start_time?: string;
    stop_time?: string;
    spend?: string;                // last_7d spend, cents
    impressions?: string;
    clicks?: string;
    source_type: SourceType;
    source_endpoint: string;
    last_sync_at: string;
};

export type BmSnapshot = {
    id: string;
    name: string;
    role: 'owner' | 'client';
    verification_status?: string;
    source_type: SourceType;
    source_endpoint: string;
    last_sync_at: string;
};

export type PageSnapshot = {
    id: string;
    name: string;
    category?: string;
    fan_count?: number;
    followers_count?: number;
    verification_status?: string;
    link?: string;
    is_published?: boolean;
    instagram_business_account?: { id: string; username: string } | null;
    picture_url?: string;
    source_type: SourceType;
    source_endpoint: string;
    last_sync_at: string;
};

/** Budget analytics derivations — spec §6.3 */
export type BudgetDerivations = {
    remaining_cap_cents: number | null;
    cap_utilization_pct: number | null;
    burn_rate_daily_cents_7d: number | null;
    days_to_exhaust: number | null;
    pacing_state: PacingState | null;
};

export type PacingState = 'underpaced' | 'on_track' | 'accelerated' | 'critically_accelerated';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

/** Global decision queue row — spec §7.1, §10 */
export type DecisionItem = {
    entity_type: 'ad_account' | 'campaign' | 'ad_set' | 'bm' | 'page';
    entity_id: string;
    entity_name: string;
    problem: string;
    severity: Severity;
    evidence: string;              // human-readable string citing the data
    recommended_action: string;
    score_ref?: string;
    economic_impact?: string;      // e.g. "USD 1.2k cap restante"
    as_of: string;
};

/** Score model — spec §9 */
export type ScoreFactor = {
    key: string;
    label: string;
    weight: number;                // 0..1, must sum to 1.0
    value: number;                 // 0..100
};

export type Score = {
    key: string;
    label: string;
    score: number;                 // 0..100, higher = healthier
    factors: ScoreFactor[];
    explanation: string;
};
