export interface User {
  id: string
  name: string | null
  avatar: string | null
}

export interface Message {
  id: string
  content: string
  sender: User
  timestamp: string
  chatId: string
}

export interface Chat {
  id: string
  type: 'private' | 'group'
  name: string
  avatar: string
  lastMessage?: Message
  unreadCount: number
  participants: User[]
  updatedAt: string
}

export interface ChatListResponse {
  chats: Chat[]
  hasMore: boolean
  nextCursor?: string
}

export interface ChatListParams {
  type: 'private' | 'group'
  cursor?: string
  limit?: number
}
