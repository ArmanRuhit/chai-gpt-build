export type TrialStatus = {
    used: number;
    limit: number;
    remaining: number | null;
}

export function parseTrialMessageLimit(raw : string | undefined): number {
    if(raw === undefined)
        return 15;

    const parsed = Number(raw.trim());

    return Number.isFinite(parsed) ? parsed : 0;
}

export function readTrialMessageLimitRaw(): string | undefined {
    return process.env.TRIAL_MESSAGE_LIMIT
}

// Single source of truth for the limit rule.
// -1 -> unlimited; positive override -> absolute; null /0/ < -1 -> env limit
export function resolveTrialLimit(override: number | null): number {
    if (override === -1) return -1;
    if (override !== null && override > 0) return override;

    return parseTrialMessageLimit(readTrialMessageLimitRaw())
}

// remaining is null for unlimited, floored at 0 otherwise (read path and
// blocked path agree).
export function buildTrialStatus(used: number, limit: number): TrialStatus {
    return {
        used,
        limit,
        remaining: limit === -1 ? null : Math.max(0, limit - used),
    };
}