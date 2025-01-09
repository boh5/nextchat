import { db } from '@/lib/db/drizzle';
import {
  friends,
  groupMembers,
  groups,
  messages,
  users,
} from '@/lib/db/schema';
import { and, desc, eq, gt, not, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

export const chatRouter = router({
  getFriendsList: protectedProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = 20;
      const { user } = ctx;

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
            and(eq(friends.friendId, users.id), eq(friends.userId, user.id)),
            and(eq(friends.userId, users.id), eq(friends.friendId, user.id))
          )
        )
        .leftJoin(messages, eq(messages.id, friends.lastMessageId))
        .where(
          and(
            eq(friends.status, 'accepted'),
            input.cursor
              ? gt(messages.createdAt, new Date(input.cursor))
              : undefined
          )
        )
        .orderBy(desc(messages.createdAt))
        .limit(limit + 1);

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
    }),

  getGroupsList: protectedProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = 20;
      const { user } = ctx;

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
            eq(groupMembers.userId, user.id),
            input.cursor
              ? gt(messages.createdAt, new Date(input.cursor))
              : undefined
          )
        )
        .orderBy(desc(messages.createdAt))
        .limit(limit + 1);

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
    }),

  sendMessage: protectedProcedure
    .input(
      z.object({
        content: z.string(),
        receiverId: z.string(),
        type: z.enum(['private', 'group']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;

      // 验证权限
      if (input.type === 'private') {
        // 检查是否是好友
        const isFriend = await db
          .select()
          .from(friends)
          .where(
            and(
              eq(friends.status, 'accepted'),
              or(
                and(
                  eq(friends.userId, user.id),
                  eq(friends.friendId, input.receiverId)
                ),
                and(
                  eq(friends.userId, input.receiverId),
                  eq(friends.friendId, user.id)
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
              eq(groupMembers.groupId, input.receiverId),
              eq(groupMembers.userId, user.id)
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
          content: input.content,
          senderId: user.id,
          receiverId: input.receiverId,
          type: input.type,
        })
        .returning();

      // 更新最后一条消息和未读状态
      if (input.type === 'private') {
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
              eq(friends.userId, input.receiverId),
              eq(friends.friendId, user.id)
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
          .where(eq(groups.id, input.receiverId));

        await db
          .update(groupMembers)
          .set({
            unreadCount: sql`${groupMembers.unreadCount} + 1`,
          })
          .where(
            and(
              eq(groupMembers.groupId, input.receiverId),
              not(eq(groupMembers.userId, user.id))
            )
          );
      }

      return message;
    }),

  markAsRead: protectedProcedure
    .input(
      z.object({
        targetId: z.string(),
        type: z.enum(['private', 'group']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;

      if (input.type === 'private') {
        await db
          .update(friends)
          .set({
            unreadCount: 0,
          })
          .where(
            and(
              eq(friends.status, 'accepted'),
              eq(friends.userId, user.id),
              eq(friends.friendId, input.targetId)
            )
          );
      } else {
        await db
          .update(groupMembers)
          .set({
            unreadCount: 0,
          })
          .where(
            and(
              eq(groupMembers.groupId, input.targetId),
              eq(groupMembers.userId, user.id)
            )
          );
      }

      return { success: true };
    }),
});
