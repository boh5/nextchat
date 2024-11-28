'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, Menu } from 'lucide-react'
import { User } from 'next-auth'
interface ChatMainProps {
  user: User
  onMenuClick?: () => void
}

export default function ChatMain({ user, onMenuClick }: ChatMainProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Chat header */}
      <div className="flex items-center gap-4 border-b p-4 dark:border-gray-700">
        <button
          onClick={onMenuClick}
          className="rounded-sm opacity-70 transition-opacity hover:opacity-100 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h2 className="text-lg font-semibold">Chat Title</h2>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Message bubbles placeholder */}
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="max-w-[80%] rounded-2xl rounded-tl-none bg-gray-100 p-4 dark:bg-gray-800">
              <div className="mb-1 font-medium">Assistant</div>
              <div>Hello! How can I help you today?</div>
            </div>
          </div>

          <div className="flex flex-row-reverse gap-3">
            {user.image ? (
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image} alt={user.email ?? ''} />
                <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
                {user.name?.[0] || user.email?.[0] || '?'}
              </div>
            )}
            <div className="max-w-[80%] rounded-2xl rounded-tr-none bg-primary p-4 text-white">
              <div className="mb-1 font-medium">{user.name || 'You'}</div>
              <div>Hi! I have a question about...</div>
            </div>
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="border-t p-4 dark:border-gray-700">
        <form className="flex gap-4" onSubmit={e => e.preventDefault()}>
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 rounded-lg border bg-transparent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary p-2 text-white transition-colors hover:bg-primary/90"
          >
            <Send className="h-5 w-5" />
            <span className="sr-only">Send message</span>
          </button>
        </form>
      </div>
    </div>
  )
}
