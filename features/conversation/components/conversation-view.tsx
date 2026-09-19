"use client";
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useQueryClient } from '@tanstack/react-query';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { useChat } from "@ai-sdk/react"
import React, { useMemo } from 'react'
import { useConversations } from '../hooks/use-conversation';
import { queryKeys } from '../utils/query-keys';
import { toast } from 'sonner';
import { ChatEmpty } from './chat-empty';
import { ChatMessages } from './chat-messages';
import { ChatComposer } from './chat-composer';
import { DEFAULT_MODEL_ID } from '@/features/ai/config/models';
import { ModelPicker } from './model-picker';
import { updateConversationModel } from '../actions/conversation-actions';

type ConversationViewProps = {
    conversationId: string;
    initialMessages: UIMessage[];
    initialModel?: string;
};

/**
 * Main chat view — header, message list (or empty state), and composer with streaming.
 */
export const ConversationView = ({ conversationId, initialMessages, initialModel = DEFAULT_MODEL_ID }: ConversationViewProps) => {

    const queryClient = useQueryClient();
    const { data: conversations } = useConversations();
    const [model, setModel] = React.useState(initialModel);
    const [isSwitchingModel, setIsSwitchingModel] = React.useState(false);

    const transport = useMemo(() => new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ id, messages }) => ({
            body: {
                id, message: messages.at(-1)
            }
        })
    }), []);

    const { messages, sendMessage, status } = useChat({
        id: conversationId,
        messages: initialMessages,
        transport,
        onFinish: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.conversations.all,
            });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    })
    const title =
    conversations?.find((item) => item.id === conversationId)?.title ?? "Chat";

    const isNewConversation = messages.length == 0;

    async function handleModelChange(nextModel: string) {
        if(nextModel == model) return;
        const previousModel = model;
        setModel(nextModel);
        setIsSwitchingModel(true);

        try {
            await updateConversationModel(conversationId, nextModel);
        } catch (error) {
            setModel(previousModel);
            toast.error(error instanceof Error ? error.message : "Could not switch model");
        } finally {
            setIsSwitchingModel(false);
        }
    }

    return (
        <div className="flex h-full min-h-0 flex-1 flex-col">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-3">
                <SidebarTrigger />
                <Separator orientation="vertical" className="mx-1 h-4" />
                <h1 className="truncate text-sm font-medium">{title}</h1>
                {isNewConversation && (
                    <div className='ml-auto'>
                        <ModelPicker
                            value={model}
                            onValueChange={(next) => void handleModelChange(next)}
                            disabled={isSwitchingModel}
                        />
                    </div>
                )}
            </header>

            {messages.length === 0 ? (
                <ChatEmpty />
            ) : (
                <ChatMessages messages={messages} status={status} />
            )}

            <ChatComposer
                onSend={(text) => {
                    void sendMessage({ text });
                }}
                isSending={status !== "ready"}
                autoFocus
            />
        </div>
    )
}
