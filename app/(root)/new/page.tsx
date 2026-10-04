import { startNewChat } from '@/features/home/actions/start-new-chat'
import { redirect } from 'next/navigation'

/**
 * Home page — creates a new chat and redirects to `/c/{id}`.
 */
const NewChatPage = async() => {
  const conversationId = await startNewChat()
  
  
  redirect(`/c/${conversationId}`)
}

export default NewChatPage