export function parseTrialMessageLimit(raw : string | undefined): number {
    if(raw === undefined)
        return 15;

    const parsed = Number(raw.trim());

    return Number.isFinite(parsed) ? parsed : 0;
}

export function readTrialMessageLimitRaw(): string | undefined {
    return process.env.TRIAL_MESSAGE_LIMIT
}
