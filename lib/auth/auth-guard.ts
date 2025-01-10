import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function requireGuest() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session?.user) {
    redirect('/chat');
  }
}

export async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect('/signin');
  }

  return session;
}
