import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UsersIcon, UserIcon, UserPlusIcon, UserPlus, Users, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { FriendManagement } from '@/components/friend/friend-management'
import { GroupManagement } from '@/components/group/group-management'
import { userAvatars } from '@/public/placeholder'
import { groupAvatars } from '@/public/placeholder'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface ChatItem {
  id: string
  name: string
  avatar: string
  lastMessage: string
  timestamp: string
  unread?: number
  type: 'private' | 'group'
}

const mockChats: ChatItem[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    avatar: userAvatars.user1,
    lastMessage: "Hey, how's it going?",
    timestamp: '2m ago',
    unread: 2,
    type: 'private',
  },
  {
    id: '2',
    name: 'Tech Team',
    avatar: groupAvatars.group1,
    lastMessage: 'Meeting starts in 10 minutes',
    timestamp: '5m ago',
    unread: 3,
    type: 'group',
  },
  {
    id: '3',
    name: 'Bella Smith',
    avatar: userAvatars.user2,
    lastMessage: 'The meeting is scheduled for tomorrow',
    timestamp: '1h ago',
    type: 'private',
  },
  {
    id: '4',
    name: 'Project Alpha',
    avatar: groupAvatars.group2,
    lastMessage: 'New milestone achieved!',
    timestamp: '1h ago',
    type: 'group',
  },
  {
    id: '5',
    name: 'Chris Davis',
    avatar: userAvatars.user3,
    lastMessage: 'Thanks for your help!',
    timestamp: '2h ago',
    type: 'private',
  },
  {
    id: '6',
    name: 'Design Team',
    avatar: groupAvatars.group3,
    lastMessage: 'New design review needed',
    timestamp: '3h ago',
    type: 'group',
  },
  {
    id: '7',
    name: 'Diana Wilson',
    avatar: userAvatars.user4,
    lastMessage: "Let's catch up soon",
    timestamp: '1d ago',
    type: 'private',
  },
]

function ChatList({ type }: { type: 'private' | 'group' }) {
  const filteredChats = mockChats.filter(chat => chat.type === type)

  return (
    <div className="divide-y divide-border">
      {filteredChats.map(chat => (
        <div
          key={chat.id}
          className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-accent"
        >
          <Avatar>
            <AvatarImage src={chat.avatar} alt={chat.name} />
            <AvatarFallback>
              {chat.type === 'group' ? <Users className="h-6 w-6" /> : <User className="h-6 w-6" />}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="truncate font-medium">{chat.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{chat.timestamp}</span>
            </div>
            <p className="truncate text-sm text-muted-foreground">{chat.lastMessage}</p>
          </div>
          {chat.unread && (
            <div className="absolute right-4 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {chat.unread}
            </div>
          )}
        </div>
      ))}
      {filteredChats.length === 0 && (
        <div className="py-4 text-center text-sm text-muted-foreground">No messages yet</div>
      )}
    </div>
  )
}

export function ChatSidebar() {
  return (
    <div className="flex h-full w-[320px] flex-col border-r bg-background">
      <div className="space-y-4 border-b p-4">
        <Input placeholder="Search messages..." className="bg-muted" />
        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <UserPlusIcon className="mr-2 h-4 w-4" />
                Add Friend
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Manage Friends</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <FriendManagement />
              </div>
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <UserPlus className="mr-2 h-4 w-4" />
                Groups
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Manage Groups</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <GroupManagement />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <Tabs defaultValue="private" className="flex flex-1 flex-col">
        <TabsList className="grid h-12 w-full grid-cols-2 p-0">
          <TabsTrigger value="private" className="rounded-none data-[state=active]:bg-accent">
            <UserIcon className="mr-2 h-4 w-4" />
            Private
          </TabsTrigger>
          <TabsTrigger value="group" className="rounded-none data-[state=active]:bg-accent">
            <UsersIcon className="mr-2 h-4 w-4" />
            Groups
          </TabsTrigger>
        </TabsList>
        <ScrollArea className="flex-1">
          <TabsContent value="private" className="m-0 mt-0">
            <ChatList type="private" />
          </TabsContent>
          <TabsContent value="group" className="m-0 mt-0">
            <ChatList type="group" />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
