'use client'

import { Plus, LogOut } from 'lucide-react'
import { User } from 'next-auth'
import { signOut } from 'next-auth/react'

interface ChatSidebarProps {
  user: User
}

export default function ChatSidebar({ user }: ChatSidebarProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90">
        <Plus className="h-5 w-5" />
        <span>New Chat</span>
      </button>

      <div className="flex-1 space-y-2">
        {/* Chat list placeholder */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div className="h-2 w-2 rounded-full bg-primary" />
            <div className="flex-1">
              <div className="line-clamp-1 font-medium">Chat {i + 1}</div>
              <div className="line-clamp-1 text-sm text-gray-500">Last message preview...</div>
            </div>
          </div>
        ))}
      </div>

      {/* User profile */}
      <div className="flex items-center justify-between rounded-lg border-t p-4 dark:border-gray-700">
        <div className="flex items-center gap-3">
          {user.image && (
            <img
              src={user.image}
              alt={user.name || 'User avatar'}
              className="h-8 w-8 rounded-full"
            />
          )}
          {!user.image && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
              {user.name?.[0] || user.email?.[0] || '?'}
            </div>
          )}
          <div className="flex-1">
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
