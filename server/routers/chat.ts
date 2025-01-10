import { db } from '@/lib/db/drizzle';
import { friend, group, groupMember, message, user } from '@/lib/db/schema';
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
      const { user: currentUser } = ctx;

      const friendsList = await db
        .select({
          friend: {
            id: user.id,
            name: user.name,
            avatar: user.image,
          },
          lastMessage: {
            content: message.content,
            createdAt: message.createdAt,
          },
          unreadCount: friend.unreadCount,
        })
        .from(friend)
        .innerJoin(
          user,
          or(
            and(
              eq(friend.friendId, user.id),
              eq(friend.userId, currentUser.id)
            ),
            and(eq(friend.userId, user.id), eq(friend.friendId, currentUser.id))
          )
        )
        .leftJoin(message, eq(message.id, friend.lastMessageId))
        .where(
          and(
            eq(friend.status, 'accepted'),
            input.cursor
              ? gt(message.createdAt, Number(input.cursor))
              : undefined
          )
        )
        .orderBy(desc(message.createdAt))
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
              timestamp: new Date(
                Number(item.lastMessage.createdAt) * 1000
              ).toISOString(),
            }
          : undefined,
        unreadCount: item.unreadCount,
      }));

      const lastItem = items.at(-1);
      return {
        items: formattedItems,
        nextCursor:
          hasMore && lastItem?.lastMessage
            ? lastItem.lastMessage.createdAt.toString()
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
      const { user: currentUser } = ctx;

      const groupsList = await db
        .select({
          group: {
            id: group.id,
            name: group.name,
            avatar: group.avatar,
          },
          lastMessage: {
            content: message.content,
            createdAt: message.createdAt,
          },
          unreadCount: groupMember.unreadCount,
        })
        .from(groupMember)
        .innerJoin(group, eq(group.id, groupMember.groupId))
        .leftJoin(message, eq(message.id, group.lastMessageId))
        .where(
          and(
            eq(groupMember.userId, currentUser.id),
            input.cursor
              ? gt(message.createdAt, Number(input.cursor))
              : undefined
          )
        )
        .orderBy(desc(message.createdAt))
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
              timestamp: new Date(
                Number(item.lastMessage.createdAt) * 1000
              ).toISOString(),
            }
          : undefined,
        unreadCount: item.unreadCount,
      }));

      const lastItem = items.at(-1);
      return {
        items: formattedItems,
        nextCursor:
          hasMore && lastItem?.lastMessage
            ? lastItem.lastMessage.createdAt.toString()
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
      const { user: currentUser } = ctx;

      // 验证权限
      if (input.type === 'private') {
        // 检查是否是好友
        const isFriend = await db
          .select()
          .from(friend)
          .where(
            and(
              eq(friend.status, 'accepted'),
              or(
                and(
                  eq(friend.userId, currentUser.id),
                  eq(friend.friendId, input.receiverId)
                ),
                and(
                  eq(friend.userId, input.receiverId),
                  eq(friend.friendId, currentUser.id)
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
          .from(groupMember)
          .where(
            and(
              eq(groupMember.groupId, input.receiverId),
              eq(groupMember.userId, currentUser.id)
            )
          )
          .limit(1);

        if (!isMember.length) {
          throw new Error('Not group member');
        }
      }

      // 发送消息
      const [newMessage] = await db
        .insert(message)
        .values({
          content: input.content,
          senderId: currentUser.id,
          receiverId: input.receiverId,
          type: input.type,
        })
        .returning();

      // 更新最后一条消息和未读状态
      if (input.type === 'private') {
        // 更新好友关系表
        await db
          .update(friend)
          .set({
            lastMessageId: newMessage.id,
            unreadCount: sql`${friend.unreadCount} + 1`,
            updatedAt: sql`CURRENT_TIMESTAMP`,
          })
          .where(
            and(
              eq(friend.status, 'accepted'),
              eq(friend.userId, input.receiverId),
              eq(friend.friendId, currentUser.id)
            )
          );
      } else {
        // 更新群组表和成员未读状态
        await db
          .update(group)
          .set({
            lastMessageId: newMessage.id,
            updatedAt: sql`CURRENT_TIMESTAMP`,
          })
          .where(eq(group.id, input.receiverId));

        await db
          .update(groupMember)
          .set({
            unreadCount: sql`${groupMember.unreadCount} + 1`,
          })
          .where(
            and(
              eq(groupMember.groupId, input.receiverId),
              not(eq(groupMember.userId, currentUser.id))
            )
          );
      }

      return newMessage;
    }),
});
