"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

/**
 * Syncs the signed-in Clerk user into the local Prisma `User` table (upsert).
 *
 * @returns The created or updated Prisma user record.
 * @throws {Error} When no Clerk session is present.
 */
export async function onBoard() {
    const clerkUser = await currentUser();

    if (!clerkUser) {
        throw new Error("Unauthorized")
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? null;
    const profile = {
        email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl
    };

    try {
        return await prisma.user.upsert({
            where: { clerkId: clerkUser.id },
            create: { clerkId: clerkUser.id, ...profile },
            update: profile
        })
    } catch (error) {
        // The email can already belong to a row with a different clerkId
        // (Clerk account recreated, or a different Clerk app). Re-link that
        // row instead of failing with a unique constraint error.
        const existingByEmail = email
            ? await prisma.user.findUnique({ where: { email } })
            : null;

        if (existingByEmail && existingByEmail.clerkId !== clerkUser.id) {
            return prisma.user.update({
                where: { id: existingByEmail.id },
                data: { clerkId: clerkUser.id, ...profile }
            });
        }

        throw error;
    }
}