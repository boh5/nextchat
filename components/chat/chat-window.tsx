import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { userAvatars } from '@/public/placeholder';
import { Menu, Send } from 'lucide-react';
import { ChatSidebar } from './chat-sidebar';

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: string;
  isSent: boolean;
}

const mockMessages: Message[] = [
  {
    id: '1',
    content: "Hey, how's it going?",
    sender: {
      id: '1',
      name: 'Alex Johnson',
      avatar: userAvatars.user1,
    },
    timestamp: '2:30 PM',
    isSent: false,
  },
  {
    id: '2',
    content: "I'm good! Just working on the project. How about you?",
    sender: {
      id: '2',
      name: 'You',
      avatar: userAvatars.user2,
    },
    timestamp: '2:31 PM',
    isSent: true,
  },
  {
    id: '3',
    content: 'Same here. Making good progress!',
    sender: {
      id: '1',
      name: 'Alex Johnson',
      avatar: userAvatars.user1,
    },
    timestamp: '2:32 PM',
    isSent: false,
  },
];

export function ChatWindow() {
  return (
    <div className="flex h-full flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={userAvatars.user1} alt="Alex Johnson" />
            <AvatarFallback>AJ</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">Alex Johnson</div>
            <div className="text-muted-foreground text-sm">Online</div>
          </div>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <ChatSidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {mockMessages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-2 ${message.isSent ? 'flex-row-reverse' : ''}`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={message.sender.avatar}
                  alt={message.sender.name}
                />
                <AvatarFallback>
                  {message.sender.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div
                className={`flex flex-col ${message.isSent ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.isSent
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.content}
                </div>
                <span className="mt-1 text-muted-foreground text-xs">
                  {message.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4">
        <form className="flex items-center gap-2">
          <Input placeholder="Type a message..." className="flex-1" />
          <Button size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
