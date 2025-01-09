'use client';

import {
  type ChatTarget,
  getFriendsList,
  getGroupsList,
} from '@/app/actions/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useIntersection } from '@mantine/hooks';
import { useInfiniteQuery } from '@tanstack/react-query';
import { User, Users } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ChatListProps {
  type: 'private' | 'group';
  onSelectChat: (chat: ChatTarget) => void;
  selectedChatId?: string;
}

export function ChatList({
  type,
  onSelectChat,
  selectedChatId,
}: ChatListProps) {
  const lastItemRef = useRef<HTMLDivElement>(null);
  const { ref, entry } = useIntersection({
    root: lastItemRef.current,
    threshold: 1,
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: [type === 'private' ? 'friends' : 'groups'],
      queryFn: ({ pageParam }) =>
        type === 'private'
          ? getFriendsList(pageParam as string)
          : getGroupsList(pageParam as string),
      initialPageParam: '',
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entry?.isIntersecting, fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (status === 'pending') {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (status === 'error') {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading {type} list
      </div>
    );
  }

  const items = data.pages.flatMap((page) => page.items);

  return (
    <ScrollArea className="h-screen">
      <div className="space-y-2 p-4">
        {items.map((item: ChatTarget, index) => (
          <button
            type="button"
            key={item.id}
            ref={index === items.length - 1 ? ref : undefined}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent',
              selectedChatId === item.id && 'bg-accent'
            )}
            onClick={() => onSelectChat(item)}
          >
            <Avatar>
              <AvatarImage src={item.avatar || undefined} alt={item.name} />
              <AvatarFallback>
                {type === 'group' ? (
                  <Users className="h-5 w-5" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-medium">{item.name}</span>
                {item.lastMessage && (
                  <span className="text-muted-foreground text-xs">
                    {new Date(item.lastMessage.timestamp).toLocaleTimeString(
                      [],
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </span>
                )}
              </div>
              {item.lastMessage && (
                <p className="truncate text-muted-foreground text-sm">
                  {item.lastMessage.content}
                </p>
              )}
            </div>
            {item.unreadCount > 0 && (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                {item.unreadCount}
              </div>
            )}
          </button>
        ))}
        {isFetchingNextPage && (
          <div className="p-4 text-center text-muted-foreground">
            Loading more...
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
