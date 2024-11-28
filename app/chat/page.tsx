import { redirect } from 'next/navigation'
import ChatLayout from '@/components/chat/chat-layout'
import { auth } from '@/lib/auth/auth'

export default async function ChatPage() {
  const session = await auth()

  if (!session) {
    redirect('/signin')
  }

  return <ChatLayout user={session.user} />
}
