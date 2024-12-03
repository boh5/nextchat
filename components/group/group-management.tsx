'use client'

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
import { Users, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  createGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  getUserGroups,
  updateGroup,
} from '@/app/actions/group'
import { useToast } from '@/hooks/use-toast'

interface Group {
  id: string
  name: string
  description: string | null
  avatar: string | null
  createdAt: Date
  updatedAt: Date
  creatorId: string
}

interface GroupWithRole {
  group: Group
  role: 'admin' | 'member'
}

function EditGroupDialog({ group, onClose }: { group: Group; onClose: () => void }) {
  const [name, setName] = useState(group.name)
  const [description, setDescription] = useState(group.description || '')
  const [isOpen, setIsOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmName, setDeleteConfirmName] = useState('')
  const { toast } = useToast()

  const handleSubmit = async () => {
    try {
      await updateGroup(group.id, { name, description })
      toast({
        description: 'Group updated successfully',
      })
      setIsOpen(false)
      onClose()
      // 触发父组件重新加载群组列表
      window.dispatchEvent(new CustomEvent('refreshGroups'))
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update group',
      })
    }
  }

  const handleDelete = async () => {
    if (deleteConfirmName !== group.name) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Group name does not match',
      })
      return
    }

    try {
      await deleteGroup(group.id)
      toast({
        description: 'Group deleted successfully',
      })
      setIsOpen(false)
      onClose()
      window.dispatchEvent(new CustomEvent('refreshGroups'))
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete group',
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Input placeholder="Group Name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Group Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <Button className="w-full" onClick={handleSubmit}>
            Update Group
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Danger Zone</span>
            </div>
          </div>

          {!showDeleteConfirm ? (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Group
            </Button>
          ) : (
            <div className="space-y-4 rounded-md border border-destructive p-4">
              <div className="text-sm text-muted-foreground">
                To confirm deletion, please type the group name:{' '}
                <span className="font-medium">{group.name}</span>
              </div>
              <Input
                placeholder="Type group name to confirm"
                value={deleteConfirmName}
                onChange={e => setDeleteConfirmName(e.target.value)}
              />
              <div className="flex gap-2">
                <Button variant="destructive" className="flex-1" onClick={handleDelete}>
                  Confirm Delete
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteConfirmName('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CreateGroupDialog() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    try {
      await createGroup({ name, description })
      toast({
        description: 'Group created successfully',
      })
      setIsOpen(false)
      setName('')
      setDescription('')
      window.dispatchEvent(new CustomEvent('refreshGroups'))
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create group',
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            <Input placeholder="Group Name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Group Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <Button className="w-full" onClick={handleSubmit}>
            Create Group
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function GroupManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [userGroups, setUserGroups] = useState<GroupWithRole[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadUserGroups()
    window.addEventListener('refreshGroups', loadUserGroups)
    return () => {
      window.removeEventListener('refreshGroups', loadUserGroups)
    }
  }, [])

  const loadUserGroups = async () => {
    try {
      const groups = await getUserGroups()
      setUserGroups(groups)
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load groups',
      })
    }
  }

  const handleJoinGroup = async (groupId: string) => {
    try {
      await joinGroup(groupId)
      toast({
        description: 'Joined group successfully',
      })
      loadUserGroups()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to join group',
      })
    }
  }

  const handleLeaveGroup = async (groupId: string) => {
    try {
      await leaveGroup(groupId)
      toast({
        description: 'Left group successfully',
      })
      loadUserGroups()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to leave group',
      })
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await deleteGroup(groupId)
      toast({
        description: 'Group deleted successfully',
      })
      loadUserGroups()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete group',
      })
    }
  }

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
              {userGroups.map(({ group, role }) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between rounded-md border p-2 hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      {group.avatar && <AvatarImage src={group.avatar} alt={group.name} />}
                      <AvatarFallback>
                        <Users className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{group.name}</div>
                      <div className="text-sm text-muted-foreground">{group.description}</div>
                      <div className="text-xs text-muted-foreground">Role: {role}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {role === 'admin' ? (
                      <EditGroupDialog group={group} onClose={() => loadUserGroups()} />
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => handleLeaveGroup(group.id)}>
                        Leave
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {userGroups.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  You have not joined any groups yet
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </TabsContent>

      <TabsContent value="discover" className="mt-4 space-y-4">
        <Input
          placeholder="Search groups..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {/* 这里需要添加发现新群组的功能 */}
            <div className="py-8 text-center text-muted-foreground">Coming soon...</div>
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  )
}
