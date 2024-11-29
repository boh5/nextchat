import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Check, MessageSquare, UserPlus, X, User as UserIcon } from 'lucide-react'
import { userAvatars } from '@/public/placeholder'

interface User {
  id: string
  name: string
  avatar: string
  status: 'online' | 'offline'
  lastSeen?: string
}

interface FriendRequest {
  id: string
  user: User
  message: string
  timestamp: string
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    avatar: userAvatars.user1,
    status: 'online',
  },
  {
    id: '2',
    name: 'Bella Smith',
    avatar: userAvatars.user2,
    status: 'offline',
    lastSeen: '2 hours ago',
  },
  {
    id: '3',
    name: 'Chris Davis',
    avatar: userAvatars.user3,
    status: 'online',
  },
  {
    id: '4',
    name: 'Diana Wilson',
    avatar: userAvatars.user4,
    status: 'offline',
    lastSeen: '1 day ago',
  },
]

const mockFriendRequests: FriendRequest[] = [
  {
    id: '1',
    user: {
      id: '5',
      name: 'Ethan Brown',
      avatar: userAvatars.user5,
      status: 'online',
    },
    message: "Hi, I'd like to connect!",
    timestamp: '2 hours ago',
  },
]

export function FriendManagement() {
  return (
    <Tabs defaultValue="search" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="search">Search</TabsTrigger>
        <TabsTrigger value="requests">Requests</TabsTrigger>
      </TabsList>

      <TabsContent value="search" className="mt-4 space-y-4">
        <Input placeholder="Search by name or email..." />
        <div className="space-y-2">
          {mockUsers.map(user => (
            <div
              key={user.id}
              className="flex w-full items-center gap-4 rounded-md p-3 hover:bg-accent"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>
                  <UserIcon className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{user.name}</div>
                <div className="text-sm text-muted-foreground">
                  {user.status === 'online' ? (
                    <span className="text-green-500">Online</span>
                  ) : (
                    <span>Last seen {user.lastSeen}</span>
                  )}
                </div>
              </div>
              <div className="ml-2 flex shrink-0 gap-2">
                <Button size="sm" variant="ghost">
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="requests" className="mt-4">
        <div className="space-y-4">
          {mockFriendRequests.map(request => (
            <div key={request.id} className="flex w-full items-center gap-4 rounded-md border p-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={request.user.avatar} alt={request.user.name} />
                <AvatarFallback>
                  <UserIcon className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{request.user.name}</div>
                <div className="truncate text-sm text-muted-foreground">{request.message}</div>
                <div className="text-xs text-muted-foreground">{request.timestamp}</div>
              </div>
              <div className="ml-2 flex shrink-0 gap-2">
                <Button size="sm" variant="ghost" className="text-green-500">
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-red-500">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {mockFriendRequests.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">No friend requests</div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
