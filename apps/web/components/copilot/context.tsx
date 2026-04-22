/**
 * Copilot context provider.
 *
 * Each panel page (dashboard / ads / bm / pages) registers its current
 * analytics scope here. The right AI sidebar reads this to give
 * context-aware recommendations without the user having to re-explain.
 */
'use client';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type {
    AdAccountSnapshot, CampaignSnapshot, PageSnapshot, BmSnapshot,
    DecisionItem, Score,
} from '@/lib/domain/types';

export type CopilotScope = {
    module: 'dashboard' | 'ads' | 'bm' | 'pages' | 'clonner' | 'other';
    tenantId?: string;
    connectionId?: string;
    currency?: string;
    active_account?: { id: string; name: string } | null;
    summary: {
        bms_count?: number;
        accounts_count?: number;
        accounts_frozen?: number;
        accounts_near_cap?: number;
        campaigns_count?: number;
        campaigns_accelerating?: number;
        campaigns_underpaced?: number;
        campaigns_wasteful?: number;
        pages_count?: number;
        pages_ready?: number;
        global_health?: number;
        access_risk_inv?: number;
        total_spend_7d_cents?: number;
    };
    top_decisions: DecisionItem[];
    scores: Score[];
    raw?: {
        accounts?: AdAccountSnapshot[];
        campaigns?: CampaignSnapshot[];
        pages?: PageSnapshot[];
        bms?: BmSnapshot[];
    };
};

const EMPTY: CopilotScope = { module: 'other', summary: {}, top_decisions: [], scores: [] };

type Ctx = {
    scope: CopilotScope;
    setScope: (s: CopilotScope) => void;
    open: boolean;
    toggle: () => void;
    setOpen: (v: boolean) => void;
};

const CopilotContext = createContext<Ctx>({
    scope: EMPTY, setScope: () => {}, open: true, toggle: () => {}, setOpen: () => {},
});

export function CopilotProvider({ children }: { children: React.ReactNode }) {
    const [scope, setScope] = useState<CopilotScope>(EMPTY);
    const [open, setOpen] = useState(true);
    const toggle = useCallback(() => setOpen(v => !v), []);
    const value = useMemo(() => ({ scope, setScope, open, toggle, setOpen }), [scope, open, toggle]);
    return <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>;
}

export function useCopilot() { return useContext(CopilotContext); }

/**
 * Hook for panel pages to push their current scope into the Copilot.
 * Call once per render of the page with a stable object.
 */
export function useRegisterCopilotScope(scope: CopilotScope, deps: unknown[]) {
    const { setScope } = useCopilot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    React.useEffect(() => { setScope(scope); }, deps);
}
