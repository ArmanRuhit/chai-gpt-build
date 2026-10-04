"use server";

import { requireUser } from "@/features/auth/action/require-user";
import { getTrialStatus } from "@/features/auth/trial";
import type { TrialStatus } from "@/features/auth/trial-config";

/**
 * Re-syncs the trial counter for the client after a send - server truth,
 * not a local guess. Mirrors `getTrialStatus` on the conversation page.
 */
export async function getTrialStatusAction(): Promise<TrialStatus> {
    const user = await requireUser();

    return getTrialStatus(user);
}