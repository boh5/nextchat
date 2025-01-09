'use server';

import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db/drizzle';
import { friends } from '@/lib/db/schema';
import { and, eq, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function sendFriendRequest(friendId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;

  // Check if friend request already exists
  const existingRequest = await db
    .select()
    .from(friends)
    .where(
      or(
        and(eq(friends.userId, userId), eq(friends.friendId, friendId)),
        and(eq(friends.userId, friendId), eq(friends.friendId, userId))
      )
    );

  if (existingRequest.length > 0) {
    throw new Error('Friend request already exists');
  }

  await db.insert(friends).values({
    userId,
    friendId,
    status: 'pending',
  });

  revalidatePath('/friends');
  return { success: true };
}

export async function acceptFriendRequest(requestId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;

  const request = await db
    .select()
    .from(friends)
    .where(
      and(
        eq(friends.id, requestId),
        eq(friends.friendId, userId),
        eq(friends.status, 'pending')
      )
    );

  if (request.length === 0) {
    throw new Error('Friend request not found');
  }

  await db
    .update(friends)
    .set({ status: 'accepted', updatedAt: new Date() })
    .where(eq(friends.id, requestId));

  revalidatePath('/friends');
  return { success: true };
}

export async function rejectFriendRequest(requestId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;

  await db
    .delete(friends)
    .where(
      and(
        eq(friends.id, requestId),
        eq(friends.friendId, userId),
        eq(friends.status, 'pending')
      )
    );

  revalidatePath('/friends');
  return { success: true };
}

export async function removeFriend(friendId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;

  await db
    .delete(friends)
    .where(
      or(
        and(eq(friends.userId, userId), eq(friends.friendId, friendId)),
        and(eq(friends.userId, friendId), eq(friends.friendId, userId))
      )
    );

  revalidatePath('/friends');
  return { success: true };
}

export async function getFriendList() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;

  const friendsList = await db
    .select({
      id: friends.id,
      status: friends.status,
      createdAt: friends.createdAt,
      userId: friends.userId,
      friendId: friends.friendId,
    })
    .from(friends)
    .where(or(eq(friends.userId, userId), eq(friends.friendId, userId)));

  return friendsList;
}

export async function getPendingFriendRequests() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;

  const pendingRequests = await db
    .select()
    .from(friends)
    .where(and(eq(friends.friendId, userId), eq(friends.status, 'pending')));

  return pendingRequests;
}
