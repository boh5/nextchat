'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Check, MessageSquare, X, User as UserIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  getFriendList,
  getPendingFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
} from '@/app/actions/friend'
import { useToast } from '@/hooks/use-toast'

interface FriendRequest {
  id: string
  userId: string
  friendId: string
  status: string
  createdAt: Date
  user?: {
    name: string | null
    email: string | null
    image: string | null
  }
  friend?: {
    name: string | null
    email: string | null
    image: string | null
  }
}

export function FriendManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [friends, setFriends] = useState<FriendRequest[]>([])
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadFriends()
    loadPendingRequests()
  }, [])

  const loadFriends = async () => {
    try {
      const friendsList = await getFriendList()
      setFriends(friendsList)
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load friends',
      })
    }
  }

  const loadPendingRequests = async () => {
    try {
      const requests = await getPendingFriendRequests()
      setPendingRequests(requests)
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load friend requests',
      })
    }
  }

  const handleSendRequest = async (friendId: string) => {
    try {
      await sendFriendRequest(friendId)
      toast({
        description: 'Friend request sent successfully',
      })
      loadFriends()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send friend request',
      })
    }
  }

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId)
      toast({
        description: 'Friend request accepted',
      })
      loadPendingRequests()
      loadFriends()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to accept friend request',
      })
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId)
      toast({
        description: 'Friend request rejected',
      })
      loadPendingRequests()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to reject friend request',
      })
    }
  }

  return (
    <Tabs defaultValue="search" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="search">Search</TabsTrigger>
        <TabsTrigger value="requests">Requests</TabsTrigger>
      </TabsList>

      <TabsContent value="search" className="mt-4 space-y-4">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {friends.map(friend => (
              <div
                key={friend.id}
                className="flex w-full items-center gap-4 rounded-md p-3 hover:bg-accent"
              >
                <Avatar className="h-10 w-10">
                  {friend.friend?.image && (
                    <AvatarImage src={friend.friend.image} alt={friend.friend?.name || ''} />
                  )}
                  <AvatarFallback>
                    <UserIcon className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">
                    {friend.friend?.name || friend.friend?.email || friend.friendId}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {friend.status === 'accepted' ? (
                      <span className="text-green-500">Friend</span>
                    ) : (
                      <span className="text-yellow-500">Pending</span>
                    )}
                  </div>
                </div>
                <div className="ml-2 flex shrink-0 gap-2">
                  <Button size="sm" variant="ghost">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="requests" className="mt-4">
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {pendingRequests.map(request => (
              <div
                key={request.id}
                className="flex w-full items-center gap-4 rounded-md border p-3"
              >
                <Avatar className="h-10 w-10">
                  {request.user?.image && (
                    <AvatarImage src={request.user.image} alt={request.user?.name || ''} />
                  )}
                  <AvatarFallback>
                    <UserIcon className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">
                    {request.user?.name || request.user?.email || request.userId}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="ml-2 flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-green-500"
                    onClick={() => handleAcceptRequest(request.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500"
                    onClick={() => handleRejectRequest(request.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {pendingRequests.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">No friend requests</div>
            )}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  )
}
