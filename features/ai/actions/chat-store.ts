"use server";

import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db";
import { getToolName, isTextUIPart, isToolUIPart, type UIMessage } from "ai";

/** Extracts plain text from an AI SDK `UIMessage` by joining all text parts. */
function getMessageText(message: UIMessage) {
  return message.parts.filter(isTextUIPart).map((part) => part.text).join("");
}

/**
 * Normalizes stored message parts from the database into AI SDK `UIMessage` parts.
 * Falls back to a single text part when no structured parts are stored.
 */
function toUIMessageParts(
  parts: Prisma.JsonValue | null,
  content: string
): UIMessage["parts"] {
  const stored = parts as UIMessage["parts"] | null;
  if (Array.isArray(stored) && stored.length > 0) {
    return stored;
  }

  return [{ type: "text", text: content }];
}

/**
 * Loads all messages for a conversation from the database as AI SDK `UIMessage`s.
 *
 * @param conversationId - The conversation whose messages to load.
 * @returns Messages ordered oldest to newest, ready for `useChat`.
 */
export async function loadChatMessages(
  conversationId: string
): Promise<UIMessage[]> {
  const rows = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });

  return rows.map((row) => ({
    id: row.id,
    role: row.role === "ASSISTANT" ? "assistant" : "user",
    parts: toUIMessageParts(row.parts, row.content),
  }));
}

type SaveChatMessagesOptions = {
  updateTitle?: boolean;
};

/**
 * Upserts AI SDK `UIMessage`s into the database for a conversation.
 *
 * @param conversationId - Target conversation ID.
 * @param messages - Messages to persist (system messages are skipped).
 * @param options.updateTitle - When true, auto-titles "New Chat" from the first user message.
 */
export async function saveChatMessages(
  conversationId: string,
  messages: UIMessage[],
  options: SaveChatMessagesOptions = {}
) {
  const { updateTitle = true } = options;

  for (const message of messages) {
    if (message.role === "system") continue;

    const content = getMessageText(message);
    const role = message.role === "assistant" ? "ASSISTANT" : "USER";

    await prisma.message.upsert({
      where: { id: message.id },
      create: {
        id: message.id,
        conversationId,
        role,
        status: "COMPLETE",
        content,
        parts: message.parts as Prisma.InputJsonValue,
      },
      update: {
        content,
        parts: message.parts as Prisma.InputJsonValue,
        status: "COMPLETE",
      },
    });
  }

  const conversation = await prisma.conversation.findUniqueOrThrow({
    where: { id: conversationId },
    select: { title: true },
  });

  const firstUser = messages.find((message) => message.role === "user");
  const firstUserText = firstUser ? getMessageText(firstUser).trim() : "";

  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: new Date(),
      title:
        updateTitle && conversation.title === "New Chat" && firstUserText
          ? firstUserText.slice(0, 48)
          : conversation.title,
    },
  });
}

/**
 * Persists tool invocations from assistant messages into the ToolCall table.
 * Message `parts` remain the replay source; this table makes calls queryable.
 */
export async function saveToolCalls(
  conversationId: string,
  messages: UIMessage[]
) {
  for (const message of messages) {
    if(message.role !== "assistant") continue;

    for(const part of message.parts) {
      if(!isToolUIPart(part)) continue;

      const input = (part.input ?? {}) as Prisma.InputJsonValue;

      const output = part.state === "output-available" ? (part.output as Prisma.InputJsonValue) : undefined;

      const errorText = part.state === "output-error" ? part.errorText : undefined;

      const state = part.state === "output-available" ? "SUCCESS" : part.state === "output-error" ? "ERROR" : "PENDING";

      const data = {
        messageId: message.id,
        input,
        output,
        errorText,
        state,
        finishedAt: state === "PENDING" ? undefined : new Date(),
      } as const;

      await prisma.toolCall.upsert({
        where: { toolCallId: part.toolCallId },
        create: {
          conversationId,
          toolCallId: part.toolCallId,
          toolName: getToolName(part),
          ...data,
        },
        update: data,
      });
    }
  }
}
