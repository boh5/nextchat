'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDebounce } from '@/hooks/use-debounce';
import { useToast } from '@/hooks/use-toast';
import { trpc } from '@/lib/trpc/client';
import {
  Check,
  MessageSquare,
  User as UserIcon,
  UserPlus,
  X,
} from 'lucide-react';
import { useState } from 'react';

export function FriendManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const { data: friends = [] } = trpc.friend.getFriendList.useQuery();
  const { data: pendingRequests = [] } =
    trpc.friend.getPendingFriendRequests.useQuery();
  const { data: searchResults = [], isFetching: isSearching } =
    trpc.friend.searchUsers.useQuery(
      { query: debouncedSearch },
      { enabled: debouncedSearch.length > 0 }
    );

  const sendRequestMutation = trpc.friend.sendFriendRequest.useMutation({
    onSuccess: () => {
      toast({
        description: 'Friend request sent',
      });
      utils.friend.getFriendList.invalidate();
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to send friend request',
      });
    },
  });

  const acceptRequestMutation = trpc.friend.acceptFriendRequest.useMutation({
    onSuccess: () => {
      toast({
        description: 'Friend request accepted',
      });
      utils.friend.getFriendList.invalidate();
      utils.friend.getPendingFriendRequests.invalidate();
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to accept friend request',
      });
    },
  });

  const rejectRequestMutation = trpc.friend.rejectFriendRequest.useMutation({
    onSuccess: () => {
      toast({
        description: 'Friend request rejected',
      });
      utils.friend.getPendingFriendRequests.invalidate();
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to reject friend request',
      });
    },
  });

  const handleSendRequest = (friendId: string) => {
    sendRequestMutation.mutate({ friendId });
  };

  const handleAcceptRequest = (requestId: string) => {
    acceptRequestMutation.mutate({ requestId });
  };

  const handleRejectRequest = (requestId: string) => {
    rejectRequestMutation.mutate({ requestId });
  };

  const renderSearchContent = () => {
    if (!debouncedSearch.length) {
      return friends.map((friend) => (
        <div
          key={friend.id}
          className="flex w-full items-center gap-4 rounded-md p-3 hover:bg-accent"
        >
          <Avatar className="h-10 w-10">
            {friend.friend?.image && (
              <AvatarImage
                src={friend.friend.image}
                alt={friend.friend?.name || ''}
              />
            )}
            <AvatarFallback>
              <UserIcon className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">
              {friend.friend?.name || friend.friend?.email || friend.friendId}
            </div>
            <div className="text-muted-foreground text-sm">
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
      ));
    }

    if (isSearching) {
      return (
        <div className="py-8 text-center text-muted-foreground">
          Searching...
        </div>
      );
    }

    if (searchResults.length === 0) {
      return (
        <div className="py-8 text-center text-muted-foreground">
          No users found
        </div>
      );
    }

    return searchResults.map((user) => (
      <div
        key={user.id}
        className="flex w-full items-center gap-4 rounded-md p-3 hover:bg-accent"
      >
        <Avatar className="h-10 w-10">
          {user.image && <AvatarImage src={user.image} alt={user.name || ''} />}
          <AvatarFallback>
            <UserIcon className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">
            {user.name || user.email || user.id}
          </div>
        </div>
        <div className="ml-2 flex shrink-0 gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleSendRequest(user.id)}
            disabled={sendRequestMutation.isPending}
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    ));
  };

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
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">{renderSearchContent()}</div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="requests" className="mt-4">
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex w-full items-center gap-4 rounded-md border p-3"
              >
                <Avatar className="h-10 w-10">
                  {request.user?.image && (
                    <AvatarImage
                      src={request.user.image}
                      alt={request.user?.name || ''}
                    />
                  )}
                  <AvatarFallback>
                    <UserIcon className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">
                    {request.user?.name ||
                      request.user?.email ||
                      request.userId}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="ml-2 flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-green-500"
                    onClick={() => handleAcceptRequest(request.id)}
                    disabled={acceptRequestMutation.isPending}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500"
                    onClick={() => handleRejectRequest(request.id)}
                    disabled={rejectRequestMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {pendingRequests.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                No friend requests
              </div>
            )}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
