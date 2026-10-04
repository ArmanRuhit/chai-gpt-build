import { APICallError } from "ai";

/** Body the chat route returns with its 403 when the trial quota is spent*/
export type TrialLimitPayload = {
    used: number;
    limit: number;
    remaining: 0;
};

/**
 * Extracts the trial-limit payload from a failed chat request.
 * Returns null for every other error so unrelated failures keep their own UI.
 */
export function parseTrialLimitError(error: unknown): TrialLimitPayload | null {
    if (!APICallError.isInstance(error) || error.statusCode !== 403) {
        return null;
    }

    try {
        const body = JSON.parse(error.responseBody ?? "") as {
            code?: string;
            used?: number;
            limit?: number;
        }

        if (body.code !== "TRIAL_LIMIT_REACHED" || typeof body.limit !== "number") {
            return null;
        }

        return {
            used: typeof body.used === "number" ? body.used : body.limit,
            limit: body.limit,
            remaining: 0,
        };
    } catch {
        return null;
    }
}