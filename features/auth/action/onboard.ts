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
    console.log("[onboard] start");

    const clerkUser = await currentUser();

    if (!clerkUser) {
        console.error("[onboard] no Clerk user in session -> Unauthorized");
        throw new Error("Unauthorized")
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? null;
    const profile = {
        email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl
    };

    console.log("[onboard] syncing clerk user:", {
        clerkId: clerkUser.id,
        email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName
    });

    try {
        const user = await prisma.user.upsert({
            where: { clerkId: clerkUser.id },
            create: { clerkId: clerkUser.id, ...profile },
            update: profile
        });

        console.log("[onboard] upsert ok:", {
            id: user.id,
            clerkId: user.clerkId,
            email: user.email
        });

        return user;
    } catch (error) {
        console.error("[onboard] upsert failed:", error);

        // The email can already belong to a row with a different clerkId
        // (Clerk account recreated, or a different Clerk app). Re-link that
        // row instead of failing with a unique constraint error.
        const existingByEmail = email
            ? await prisma.user.findUnique({ where: { email } })
            : null;

        console.log("[onboard] existing row by email:", existingByEmail
            ? { id: existingByEmail.id, clerkId: existingByEmail.clerkId, email: existingByEmail.email }
            : null
        );

        if (existingByEmail && existingByEmail.clerkId !== clerkUser.id) {
            const relinked = await prisma.user.update({
                where: { id: existingByEmail.id },
                data: { clerkId: clerkUser.id, ...profile }
            });

            console.log("[onboard] re-linked row:", {
                id: relinked.id,
                clerkId: relinked.clerkId,
                email: relinked.email
            });

            return relinked;
        }

        console.error("[onboard] no row to re-link, rethrowing original error");
        throw error;
    }
}