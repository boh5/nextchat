'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User } from 'next-auth'
import { signOut, useSession } from 'next-auth/react'
export function NavBar() {
  const { data: session } = useSession()
  const [user, setUser] = useState<User | null>(session?.user ?? null)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between">
        <div className="mr-4 flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <span className="font-bold">NextChat</span>
          </Link>
          <nav className="flex items-center space-x-6">
            <Link
              href="/chat"
              className="text-sm font-medium transition-colors hover:text-foreground/80"
            >
              Chat
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image ?? ''} alt={user.email ?? ''} />
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="flex-col items-start">
                  <div className="text-sm font-medium">{user.email}</div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/signin">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
