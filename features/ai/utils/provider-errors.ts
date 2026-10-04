import { APICallError } from "ai";

/** Stable user-facing copy for provider credit exhaustion (also matched client-side) */
export const PROVIDER_CREDIT_MESSAGE = "The model provider account is out of credits. Switch models, or wait until an admin tops up the account."

const CREDIT_PATTERNS = [
    /insufficient\s+(?:balance|credits?|funds|quota)/i,
    /exceeded your current quota/i,
    /credit balance is too low/i,
    /payment required/i,
];

/**
 * Maps a provider-side credit/quota failure to the stable message above.
 * Returns null for every other error so existing handling stays in charge.
 */
export function describeProviderCreditError(error: unknown): string | null {
    if (!APICallError.isInstance(error)) {
        return null;
    }

    const haystack = `${error.message}\n${error.responseBody ?? ""}`;

    const isCreditFailure = 
        error.statusCode === 402 ||
        CREDIT_PATTERNS.some((pattern) => pattern.test(haystack));

    return isCreditFailure ? PROVIDER_CREDIT_MESSAGE : null;
}