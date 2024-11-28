'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { User } from 'next-auth'
import ChatSidebar from './chat-sidebar'
import ChatMain from './chat-main'

interface ChatLayoutProps {
  user: User
}

export default function ChatLayout({ user }: ChatLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-[calc(100vh-65px)]">
      {/* Sidebar - 桌面端显示为固定宽度，移动端显示为浮动层 */}
      <div className="hidden w-72 flex-shrink-0 bg-gray-50 dark:bg-gray-800 md:block">
        <div className="flex h-full flex-col">
          <div className="p-4">
            <h2 className="text-xl font-bold">Chats</h2>
          </div>
          <ChatSidebar user={user} />
        </div>
      </div>

      {/* 移动端侧边栏 */}
      <div
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-gray-50 transition-all duration-300 dark:bg-gray-800 md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4">
          <h2 className="text-xl font-bold">Chats</h2>
          <button
            className="rounded-sm opacity-70 transition-opacity hover:opacity-100"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Close sidebar</span>
          </button>
        </div>
        <ChatSidebar user={user} />
      </div>

      {/* 背景遮罩 */}
      <div
        className={`fixed inset-0 z-30 bg-gray-900/50 transition-all duration-300 md:hidden ${
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <main className="flex-1 bg-white dark:bg-gray-900">
        <ChatMain user={user} onMenuClick={() => setSidebarOpen(true)} />
      </main>
    </div>
  )
}
