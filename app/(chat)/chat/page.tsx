import { ChatSidebar } from '@/components/chat/chat-sidebar'
import { ChatWindow } from '@/components/chat/chat-window'
import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'

export default async function ChatPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/signin')
  }

  return (
    <main className="flex h-[calc(100vh-3.5rem)]">
      <div className="hidden md:block">
        <ChatSidebar />
      </div>
      <div className="flex-1">
        <ChatWindow />
      </div>
    </main>
  )
}
