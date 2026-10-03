import { loadChatMessages, saveChatMessages, saveToolCalls } from "@/features/ai/actions/chat-store";
import { chatTools } from "@/features/ai/tools";
import { getChatModel } from "@/features/ai/utils/model";
import { requireUser } from "@/features/auth/action/require-user";
import { tryConsumeTrialMessage } from "@/features/auth/trial";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { convertToModelMessages, createIdGenerator, createUIMessageStreamResponse, InvalidToolInputError, isStepCount, NoSuchToolError, streamText, toUIMessageStream, type UIMessage } from "ai";
/**
 * POST /api/chat — Streams an AI assistant reply for a conversation.
 *
 * Validates auth and ownership, persists the user message, then streams the
 * assistant response via the AI SDK. Final messages are saved when the stream ends.
 */
export async function POST(req: Request) {
    await auth.protect();

    const { message, id }: { message: UIMessage, id: string } = await req.json();

    if (!message || !id) {
        return new Response("Missing message or conversation id", { status: 400 });
    }

    const user = await requireUser();

    const conversation = await prisma.conversation.findFirst({
        where: {
            id,
            userId: user.id
        }
    });

    if (!conversation) {
        return new Response("Conversation not found", { status: 404 });
    }

    const previousMessages = await loadChatMessages(id);

    const alreadySaved = previousMessages.some(
        (storedMessage)=>storedMessage.id === message.id
    )

    const messages = alreadySaved ? previousMessages : [...previousMessages, message];

    if(!alreadySaved){
        const trial = await tryConsumeTrialMessage(user);
        if(!trial.allowed) {
            return Response.json(
                { code: "TRIAL_LIMIT_REACHED", message: "Trial message limit reached",
                    used: trial.used, limit: trial.limit, remaining: 0 },
                { status: 403 },
            );
        }
        await saveChatMessages(id, [message]);
    }

    const result =  streamText({
        model: getChatModel(conversation.model),
        system: conversation.systemPrompt ?? "You are ChaiGpt , a helpful assistant",
        messages: await convertToModelMessages(messages, {
            ignoreIncompleteToolCalls: true,
        }),
        tools: chatTools,
        stopWhen: isStepCount(5),
        onError: ({ error }) => {
            console.error("[chat] stream error", error);
        }
    });

    result.consumeStream();

    return createUIMessageStreamResponse({
        stream:toUIMessageStream({
           stream:result.stream,
           originalMessages:messages,
           generateMessageId:createIdGenerator({prefix:"msg" , size:16}),
           onError: (error) => {
            if(NoSuchToolError.isInstance(error)) {
                return "The model tried to call an unknown tool. Please try again."
            }
            if(InvalidToolInputError.isInstance(error)) {
                return "The model called a tool with invalid inputs. Please try again."
            }
            return "Something went wrong while generating the response. Please try again."
           },
           onEnd:async({messages:finalMessages})=>{
            try {
                await saveChatMessages(id , finalMessages , {updateTitle:false})
                await saveToolCalls(id, finalMessages);
            } catch (error) {
                console.error(error);
            }
           }
        })
    })

}