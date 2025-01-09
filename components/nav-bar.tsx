import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth/auth';
import Link from 'next/link';
import { Icons } from './ui/icons';
import { UserButton } from './user-button';

export async function NavBar() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between">
        <div className="mr-4 flex">
          <Link
            className="mr-6 flex items-center space-x-2 text-primary"
            href="/"
          >
            <Icons.logo className="h-6 w-6" />
            <span className="font-bold">NextChat</span>
          </Link>
          <nav className="flex items-center space-x-6">
            <Link
              href="/chat"
              className="font-medium text-sm transition-colors hover:text-foreground/80"
            >
              Chat
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {user ? (
            <UserButton user={user} />
          ) : (
            <Button asChild>
              <Link href="/signin">SignIn</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
