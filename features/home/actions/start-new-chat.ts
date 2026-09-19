"use server";

import { requireUser } from "@/features/auth/action/require-user";
import { prisma } from "@/lib/db";
import { DEFAULT_MODEL_ID, isChatModelId } from "@/features/ai/config/models";

/**
 * Server action that creates a new conversation titled "New Chat".
 *
 * @param modelId -  Optional catalog model ID; falls back to the default model.
 * @returns The ID of the newly created conversation.
 */
export async function startNewChat(modelId?: string){
    const user = await requireUser();
    const model = modelId && isChatModelId(modelId) ? modelId : DEFAULT_MODEL_ID;

    const conversation = await prisma.conversation.create({
        data:{
            userId:user.id,
            title:"New Chat",
            model
        }
    });

    return conversation.id;
}