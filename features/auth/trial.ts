import { prisma } from "@/lib/db";
import type { User } from "@/lib/generated/prisma/client";
import { buildTrialStatus, resolveTrialLimit, type TrialStatus } from "@/features/auth/trial-config";

export type TrialCheck = TrialStatus & { allowed: boolean };

// Read-only status for the UI — resolves the same rule as consume, no writes.
export function getTrialStatus(user: User): TrialStatus {
    return buildTrialStatus(
        user.trialMessagesUsed,
        resolveTrialLimit(user.trialLimitOverride)
    )
}

export async function tryConsumeTrialMessage(user: User): Promise<TrialCheck> {
    const limit = resolveTrialLimit(user.trialLimitOverride);

    let used = user.trialMessagesUsed;

    if (limit === -1) {
        await prisma.user.update({
            where: { id: user.id },
            data: { trialMessagesUsed: { increment: 1 } }
        })

        used = used + 1;

        return {
            allowed: true,
            used,
            limit: -1,
            remaining: null,
        };
    }

    const { count } = await prisma.user.updateMany({
        where: { id: user.id, trialMessagesUsed: { lt: limit } },
        data: { trialMessagesUsed: { increment: 1 } }
    });


    if (count === 0) {
        return {
            allowed: false,
            used,
            limit,
            remaining: 0
        };
    } else {
        used = used + 1;
        return {
            allowed: true,
            used,
            limit,
            remaining: limit - used
        };
    }
}


