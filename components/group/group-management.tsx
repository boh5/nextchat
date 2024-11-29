import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { UserPlus, Users, Settings } from 'lucide-react'
import { groupAvatars } from '@/public/placeholder'

interface Group {
  id: string
  name: string
  avatar: string
  description: string
  memberCount: number
  isOwner: boolean
}

const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Tech Team',
    avatar: groupAvatars.group1,
    description: 'Technical discussions and updates',
    memberCount: 12,
    isOwner: true,
  },
  {
    id: '2',
    name: 'Project Alpha',
    avatar: groupAvatars.group2,
    description: 'Project Alpha team collaboration',
    memberCount: 8,
    isOwner: false,
  },
  {
    id: '3',
    name: 'Design Team',
    avatar: groupAvatars.group3,
    description: 'UI/UX design discussions',
    memberCount: 6,
    isOwner: true,
  },
  {
    id: '4',
    name: 'Marketing',
    avatar: groupAvatars.group4,
    description: 'Marketing strategy and campaigns',
    memberCount: 10,
    isOwner: false,
  },
]

function CreateGroupDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Users className="mr-2 h-4 w-4" />
          Create New Group
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Input placeholder="Group Name" />
          </div>
          <div className="space-y-2">
            <Textarea placeholder="Group Description" />
          </div>
          <Button className="w-full">Create Group</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function GroupManagement() {
  return (
    <Tabs defaultValue="mygroups" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="mygroups">My Groups</TabsTrigger>
        <TabsTrigger value="discover">Discover</TabsTrigger>
      </TabsList>

      <TabsContent value="mygroups" className="mt-4">
        <div className="space-y-4">
          <CreateGroupDialog />
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {mockGroups.map(group => (
                <div
                  key={group.id}
                  className="flex items-center justify-between rounded-md border p-2 hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={group.avatar} alt={group.name} />
                      <AvatarFallback>
                        <Users className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{group.name}</div>
                      <div className="text-sm text-muted-foreground">{group.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {group.memberCount} members
                      </div>
                    </div>
                  </div>
                  {group.isOwner ? (
                    <Button size="sm" variant="ghost">
                      <Settings className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </TabsContent>

      <TabsContent value="discover" className="mt-4 space-y-4">
        <Input placeholder="Search groups..." />
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {mockGroups.map(group => (
              <div
                key={group.id}
                className="flex items-center justify-between rounded-md border p-2 hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={group.avatar} alt={group.name} />
                    <AvatarFallback>
                      <Users className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{group.name}</div>
                    <div className="text-sm text-muted-foreground">{group.description}</div>
                    <div className="text-xs text-muted-foreground">{group.memberCount} members</div>
                  </div>
                </div>
                <Button size="sm">Join</Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  )
}
