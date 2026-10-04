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
import { DEFAULT_MODEL_ID, CHAT_MODELS } from '@/features/ai/config/models';
import { ModelPicker } from './model-picker';
import { updateConversationModel } from '../actions/conversation-actions';
import { useCreateBranch } from "@/features/branching/hooks/use-branches";
import { BranchBar } from '@/features/branching/components/branch-bar';
import type { TrialStatus } from '@/features/auth/trial-config';
import { PROVIDER_CREDIT_MESSAGE } from '@/features/ai/utils/provider-errors';
import { getTrialStatusAction } from '@/features/auth/action/trial-status';
import { parseTrialLimitError } from '@/features/auth/trial-client';
import { TrialLimitNotice } from '@/features/auth/components/trial-limit-notice';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';


type ConversationViewProps = {
    conversationId: string;
    initialMessages: UIMessage[];
    initialModel?: string;
    trialStatus: TrialStatus;
};

/**
 * Main chat view — header, message list (or empty state), and composer with streaming.
 */
export const ConversationView = ({ conversationId, initialMessages, initialModel = DEFAULT_MODEL_ID, trialStatus }: ConversationViewProps) => {

    const queryClient = useQueryClient();
    const { data: conversations } = useConversations();
    const [model, setModel] = React.useState(initialModel);
    const [isSwitchingModel, setIsSwitchingModel] = React.useState(false);
    const [trial, setTrial] = React.useState(trialStatus);

    const refreshTrial = React.useCallback(async () => {
        try {
            setTrial(await getTrialStatusAction())
        } catch {
            // keep the last known status; the counter is display-only.
        }
    }, []);

    const transport = useMemo(() => new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ id, messages }) => ({
            body: {
                id, message: messages.at(-1)
            }
        })
    }), []);

    const { messages, sendMessage, status, error, regenerate } = useChat({
        id: conversationId,
        messages: initialMessages,
        transport,
        onFinish: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.conversations.all,
            });
            void refreshTrial();
        },
        onError: (error) => {
            const limit = parseTrialLimitError(error);

            if (limit) {
                setTrial((current) => ({
                    ...current,
                    used: limit.used,
                    limit: limit.limit,
                    remaining: 0,
                }));
                toast.error("You've reached your free message limit.");
                return;
            }
            toast.error(error.message);
            void refreshTrial();
        },
    });
    const { mutate: createBranch, isPending: isBranching, variables } = useCreateBranch();
    const title =
        conversations?.find((item) => item.id === conversationId)?.title ?? "Chat";

    const isNewConversation = messages.length == 0;
    const trialLimitError = parseTrialLimitError(error);
    const trialBlocked = trial.remaining === 0;
    const modelLabel = CHAT_MODELS.find((item) => item.id === model)?.label ?? model;
    const providerOutOfCredits = error?.message === PROVIDER_CREDIT_MESSAGE;

    async function handleModelChange(nextModel: string) {
        if (nextModel == model) return;
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
                {isNewConversation ? (
                    <div className='ml-auto'>
                        <ModelPicker
                            value={model}
                            onValueChange={(next) => void handleModelChange(next)}
                            disabled={isSwitchingModel}
                        />
                    </div>
                ) : (
                    <Badge variant="secondary" className='ml-auto' title='Model in uses'>{modelLabel}</Badge>
                )}
            </header>

            <BranchBar conversationId={conversationId}></BranchBar>

            {messages.length === 0 ? (
                <ChatEmpty />
            ) : (
                <ChatMessages
                    messages={messages}
                    status={status}
                    error={trialLimitError ? undefined : error}
                    onRetry={providerOutOfCredits ? undefined : () => void regenerate()}
                    onBranch={(messageId) => createBranch({ conversationId, messageId })}
                    branchingMessageId={isBranching ? variables?.messageId ?? null : null}
                    branchDisabled={status !== "ready"}
                />
            )}

            {trial.remaining !== null && !trialBlocked && (
                <p className={cn("mx-auto w-full max-w-3xl px-4 pb-1 text-xs text-muted-foreground md:px-6", trial.remaining <= 3 && "text-amber-600 dark:text-amber-500"
                )}>
                    {trial.remaining} of {trial.limit} free messages left
                </p>
            )}
            {trialBlocked ? (
                <TrialLimitNotice used={trial.used} limit={trial.limit} />
            ) : (<ChatComposer
                onSend={(text) => {
                    void sendMessage({ text });
                }}
                isSending={status === "submitted" || status === "streaming"}

                autoFocus
            />)}

        </div>
    )
}
