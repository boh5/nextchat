'use server';

import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db/drizzle';
import {
  friends,
  groupMembers,
  groups,
  messages,
  users,
} from '@/lib/db/schema';
import { and, desc, eq, gt, not, or, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface ChatTarget {
  id: string;
  name: string;
  avatar: string | null;
  lastMessage?: {
    content: string;
    timestamp: string;
  };
  unreadCount: number;
}

interface ListResponse {
  items: ChatTarget[];
  nextCursor?: string;
}

export async function getFriendsList(cursor?: string): Promise<ListResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const limit = 20;

  // 获取好友列表
  const friendsList = await db
    .select({
      friend: {
        id: users.id,
        name: users.name,
        avatar: users.image,
      },
      lastMessage: {
        content: messages.content,
        createdAt: messages.createdAt,
      },
      unreadCount: friends.unreadCount,
    })
    .from(friends)
    .innerJoin(
      users,
      or(
        and(
          eq(friends.friendId, users.id),
          eq(friends.userId, session.user.id)
        ),
        and(eq(friends.userId, users.id), eq(friends.friendId, session.user.id))
      )
    )
    .leftJoin(messages, eq(messages.id, friends.lastMessageId))
    .where(
      and(
        eq(friends.status, 'accepted'),
        cursor ? gt(messages.createdAt, new Date(cursor)) : undefined
      )
    )
    .orderBy(desc(messages.createdAt))
    .limit(limit + 1);

  // 检查是否还有更多数据
  const hasMore = friendsList.length > limit;
  const items = hasMore ? friendsList.slice(0, -1) : friendsList;

  const formattedItems = items.map((item) => ({
    id: item.friend.id,
    name: item.friend.name || 'Unknown User',
    avatar: item.friend.avatar,
    lastMessage: item.lastMessage
      ? {
          content: item.lastMessage.content,
          timestamp: item.lastMessage.createdAt.toISOString(),
        }
      : undefined,
    unreadCount: item.unreadCount,
  }));

  return {
    items: formattedItems,
    nextCursor:
      hasMore && items.at(-1)?.lastMessage
        ? items.at(-1)?.lastMessage?.createdAt.toISOString()
        : undefined,
  };
}

export async function getGroupsList(cursor?: string): Promise<ListResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const limit = 20;

  // 获取用户所在的群组列表
  const groupsList = await db
    .select({
      group: {
        id: groups.id,
        name: groups.name,
        avatar: groups.avatar,
      },
      lastMessage: {
        content: messages.content,
        createdAt: messages.createdAt,
      },
      unreadCount: groupMembers.unreadCount,
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groups.id, groupMembers.groupId))
    .leftJoin(messages, eq(messages.id, groups.lastMessageId))
    .where(
      and(
        eq(groupMembers.userId, session.user.id),
        cursor ? gt(messages.createdAt, new Date(cursor)) : undefined
      )
    )
    .orderBy(desc(messages.createdAt))
    .limit(limit + 1);

  // 检查是否还有更多数据
  const hasMore = groupsList.length > limit;
  const items = hasMore ? groupsList.slice(0, -1) : groupsList;

  const formattedItems = items.map((item) => ({
    id: item.group.id,
    name: item.group.name,
    avatar: item.group.avatar,
    lastMessage: item.lastMessage
      ? {
          content: item.lastMessage.content,
          timestamp: item.lastMessage.createdAt.toISOString(),
        }
      : undefined,
    unreadCount: item.unreadCount,
  }));

  return {
    items: formattedItems,
    nextCursor:
      hasMore && items.at(-1)?.lastMessage
        ? items.at(-1)?.lastMessage?.createdAt.toISOString()
        : undefined,
  };
}

export async function sendMessage(data: {
  content: string;
  receiverId: string;
  type: 'private' | 'group';
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;

  // 验证权限
  if (data.type === 'private') {
    // 检查是否是好友
    const isFriend = await db
      .select()
      .from(friends)
      .where(
        and(
          eq(friends.status, 'accepted'),
          or(
            and(
              eq(friends.userId, userId),
              eq(friends.friendId, data.receiverId)
            ),
            and(
              eq(friends.userId, data.receiverId),
              eq(friends.friendId, userId)
            )
          )
        )
      )
      .limit(1);

    if (!isFriend.length) {
      throw new Error('Not friend');
    }
  } else {
    // 检查是否是群组成员
    const isMember = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, data.receiverId),
          eq(groupMembers.userId, userId)
        )
      )
      .limit(1);

    if (!isMember.length) {
      throw new Error('Not group member');
    }
  }

  // 发送消息
  const [message] = await db
    .insert(messages)
    .values({
      content: data.content,
      senderId: userId,
      receiverId: data.receiverId,
      type: data.type,
    })
    .returning();

  // 更新最后一条消息和未读状态
  if (data.type === 'private') {
    // 更新好友关系表
    await db
      .update(friends)
      .set({
        lastMessageId: message.id,
        unreadCount: sql`${friends.unreadCount} + 1`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(friends.status, 'accepted'),
          eq(friends.userId, data.receiverId),
          eq(friends.friendId, userId)
        )
      );
  } else {
    // 更新群组表和成员未读状态
    await db
      .update(groups)
      .set({
        lastMessageId: message.id,
        updatedAt: new Date(),
      })
      .where(eq(groups.id, data.receiverId));

    // 更新所有其他成员的未读状态
    await db
      .update(groupMembers)
      .set({
        unreadCount: sql`${groupMembers.unreadCount} + 1`,
      })
      .where(
        and(
          eq(groupMembers.groupId, data.receiverId),
          not(eq(groupMembers.userId, userId))
        )
      );
  }

  revalidatePath('/chat');
  return message;
}

export async function markAsRead(targetId: string, type: 'private' | 'group') {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;

  if (type === 'private') {
    // 更新好友关系表的未读计数
    await db
      .update(friends)
      .set({
        unreadCount: 0,
      })
      .where(
        and(
          eq(friends.status, 'accepted'),
          eq(friends.userId, userId),
          eq(friends.friendId, targetId)
        )
      );
  } else {
    // 更新群组成员的未读计数
    await db
      .update(groupMembers)
      .set({
        unreadCount: 0,
      })
      .where(
        and(eq(groupMembers.groupId, targetId), eq(groupMembers.userId, userId))
      );
  }

  revalidatePath('/chat');
  return { success: true };
}
