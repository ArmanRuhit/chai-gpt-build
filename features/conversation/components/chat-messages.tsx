"use client";

import { isReasoningUIPart, isTextUIPart, isToolUIPart, type UIMessage } from "ai";
import type { ChatStatus } from "ai";
import { ToolCall } from "./tool-call";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Loader } from "@/components/ai-elements/loader";
import { Reasoning } from "./reasoning";
import { CircleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";



type ChatMessagesProps = {
  messages: UIMessage[];
  status: ChatStatus;
  error?: Error;
  onRetry?: () => void;
};

/**
 * Renders the conversation message list with markdown responses and a loading indicator.
 */
export function ChatMessages({ messages, status, error, onRetry }: ChatMessagesProps) {
  const isWaiting =
    status === "submitted" && messages.at(-1)?.role === "user";

  return (
    <Conversation>
      <ConversationContent className="py-8">
        {messages.map((message) => (
          <Message key={message.id} from={message.role}>
            <MessageContent>
              {message.parts.map((part, index) => {
                if(isReasoningUIPart(part)) {
                  return <Reasoning key={index} state={part.state ?? "done"} text={part.text} />
                }

                if(isToolUIPart(part)) {
                  return <ToolCall key={part.toolCallId} part={part}/>
                }

                if(isTextUIPart(part)) {
                  return <MessageResponse key={index}>{part.text}</MessageResponse>
                }
              })}
            </MessageContent>
          </Message>
        ))}

        {isWaiting ? (
          <Message from="assistant">
            <MessageContent>
              <Loader />
            </MessageContent>
          </Message>
        ) : null}

        {error ? (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <CircleAlertIcon className="size-4 shrink-0" />
            <p className="min-w-0 flex-1 truncate">
              {error.message || "Something went wrong while generating the response."}
            </p>
            {onRetry ? (
              <Button onClick={onRetry} size="sm" variant="outline">Retry</Button>
            ) : null}
          </div>
        ) : null}
      </ConversationContent>
      <ConversationScrollButton />
   
    </Conversation>
  );
}
