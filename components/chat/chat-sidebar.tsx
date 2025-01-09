'use client';

import type { ChatTarget } from '@/app/actions/chat';
import { FriendManagement } from '@/components/friend/friend-management';
import { GroupManagement } from '@/components/group/group-management';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserIcon, UserPlus, UserPlusIcon, UsersIcon } from 'lucide-react';
import { useState } from 'react';
import { ChatList } from './chat-list';

export function ChatSidebar() {
  const [selectedChat, setSelectedChat] = useState<ChatTarget | null>(null);

  const handleSelectChat = (chat: ChatTarget) => {
    setSelectedChat(chat);
    // TODO: Implement chat selection logic
  };

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
          <TabsTrigger
            value="private"
            className="rounded-none data-[state=active]:bg-accent"
          >
            <UserIcon className="mr-2 h-4 w-4" />
            Private
          </TabsTrigger>
          <TabsTrigger
            value="group"
            className="rounded-none data-[state=active]:bg-accent"
          >
            <UsersIcon className="mr-2 h-4 w-4" />
            Groups
          </TabsTrigger>
        </TabsList>
        <ScrollArea className="flex-1">
          <TabsContent value="private" className="m-0 mt-0">
            <ChatList
              type="private"
              onSelectChat={handleSelectChat}
              selectedChatId={selectedChat?.id}
            />
          </TabsContent>
          <TabsContent value="group" className="m-0 mt-0">
            <ChatList
              type="group"
              onSelectChat={handleSelectChat}
              selectedChatId={selectedChat?.id}
            />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
