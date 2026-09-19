import { loadChatMessages } from '@/features/ai/actions/chat-store';
import { DEFAULT_MODEL_ID } from '@/features/ai/config/models';
import { getConversation } from '@/features/conversation/actions/conversation-actions';
import { ConversationView } from '@/features/conversation/components/conversation-view';
import { notFound } from 'next/navigation';
import React from 'react'

type ConversationPageProps = {
    params: Promise<{ id: string }>;
  };

/**
 * Conversation page — loads messages and renders the chat UI for a given ID.
 */
const page = async({params}:ConversationPageProps) => {
    const {id} = await params;

    let conversation;
    try {
      conversation = await getConversation(id)
    } catch {
      notFound()
    }

    const initialMessages = await loadChatMessages(id);
    

  return (
    <ConversationView
      key={id}
      conversationId={id}
      initialMessages={initialMessages}
      initialModel={conversation.model ?? DEFAULT_MODEL_ID}
    />
  )
}

export default page