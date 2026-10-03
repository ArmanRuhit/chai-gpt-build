import { prisma } from "@/lib/db";
import type { User } from "@/lib/generated/prisma/client";
import { parseTrialMessageLimit, readTrialMessageLimitRaw } from "@/features/auth/trial-config";

export type TrialCheck = {
    allowed: boolean;
    used: number;
    limit: number;
    remaining: number | null;
}

export async function tryConsumeTrialMessage(user: User): Promise<TrialCheck> {
    const envLimit = parseTrialMessageLimit(readTrialMessageLimitRaw());
    const override = user.trialLimitOverride;
    const limit =
        override === -1 ? -1 :
            override !== null && override > 0 ? override :
                envLimit; // null → env; 0 / < -1 → policy fallback (pick & document)

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