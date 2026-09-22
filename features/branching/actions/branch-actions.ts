"use server"

import { revalidatePath } from "next/cache"

import { requireUser } from "@/features/auth/action/require-user"
import { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/db"

/** A conversation in a branch family, as shown in the branch switcher. */
export type BranchSibling = {
  id: string;
  title: string;
  forkedAtMessageId: string | null;
};

/** Branch metadata for the current conversation. */
export type BranchContext = {
  parent: { id: string; title: string } | null;
  forkedAtMessageId: string | null;
  siblings: BranchSibling[];
};

/**
 * Creates a branch: copies every message up to and including `messageId` into a 
 * new conversation linked to the original. Tool parts travel with the messages,
 * sp search results and citations replay in the branch.
 */
export async function createBranch(conversationId: string, messageId: string) {
    const user = await requireUser();

    const parent = await prisma.conversation.findFirst({
        where: { id: conversationId, userId: user.id },
    });

    if(!parent) {
        throw new Error("Conversation not found");
    }

    const forkMessage = await prisma.message.findFirst({
        where: { id: messageId, conversationId },
        select: { id: true, createdAt: true },
    })

    if(!forkMessage) {
        throw new Error("Message not found in this conversation");
    }

    const messages = await prisma.message.findMany({
        where: { conversationId, createdAt: { lte: forkMessage.createdAt } },
        orderBy: {  createdAt: "asc"}
    })

    const branch = await prisma.$transaction(async (tx) => {
        const created = await tx.conversation.create({
            data: {
                userId: user.id,
                title: parent.title,
                model: parent.model,
                systemPrompt: parent.systemPrompt,
                parentConversationId: parent.id,
                forkedAtMessageId: messageId,
                lastMessageAt: forkMessage.createdAt,
            },
        });

        for (const message of messages) {
            await tx.message.create({
                data: {
                    conversationId: created.id,
                    role: message.role,
                    status: message.status,
                    content:message.content,
                    parts: message.parts === null 
                        ? Prisma.JsonNull
                        : (message.parts as Prisma.InputJsonValue),
                    metadata: message.metadata === null 
                        ? Prisma.JsonNull
                        : (message.metadata as Prisma.InputJsonValue),
                    createdAt: message.createdAt,
                }
            })
        }

        return created;
    });

    revalidatePath("/")
    revalidatePath(`/c/${branch.id}`)

    return { id: branch.id, title: branch.title }
}

/** 
 * Loads branch metadata for the header: parent link and sibling conversations
 * forked from the same message (the parent counts as the first entry)
 * 
 */
export async function getBranchContext(
    conversationId: string
): Promise<BranchContext> {
    const user = await requireUser();

    const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId: user.id },
        select: { id: true, parentConversationId: true, forkedAtMessageId: true },
    });

    if(!conversation) {
        throw new Error("Conversation not found");
    }

    if(!conversation.parentConversationId) {
        return { parent: null, forkedAtMessageId: null, siblings: [] };
    }

    const parent = await prisma.conversation.findFirst({
        where: { id: conversation.parentConversationId, userId: user.id },
        select: {id: true, title: true},
    });

    if(!parent) {
        return {
            parent: null,
            forkedAtMessageId: conversation.forkedAtMessageId,
            siblings: [],
        };
    }

    const branches = await prisma.conversation.findMany({
        where: {
            userId: user.id,
            parentConversationId: parent.id,
            forkedAtMessageId: conversation.forkedAtMessageId,
        },
        orderBy: { createdAt: "asc" },
        select: { id:true, title: true, forkedAtMessageId: true },
    });

    return {
        parent,
        forkedAtMessageId: conversation.forkedAtMessageId,
        siblings: [
            { id: parent.id, title: parent.title, forkedAtMessageId: null },
            ...branches,
        ],
    };
}