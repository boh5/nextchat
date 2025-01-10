import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { ChatWindow } from '@/components/chat/chat-window';
import { requireAuth } from '@/lib/auth/auth-guard';

export default async function ChatPage() {
  await requireAuth();

  return (
    <main className="flex h-[calc(100vh-3.5rem)]">
      <div className="hidden md:block">
        <ChatSidebar />
      </div>
      <div className="flex-1">
        <ChatWindow />
      </div>
    </main>
  );
}
