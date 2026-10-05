"use server"

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { onBoard } from "./onboard";

/**
 * Ensures the request is authenticated and the user has completed onboarding.
 *
 * @returns The Prisma `User` linked to the current Clerk session.
 * @throws {Error} When the session is missing or the user cannot be synced.
 */
export async function requireUser() {
    const { userId } = await auth.protect();
  
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
  
    if (!user) {
      // The layout sync (onBoard) can still be in flight when a page renders.
      // Create the row on demand instead of failing the request.
      return onBoard();
    }
  
    return user;
  }
  