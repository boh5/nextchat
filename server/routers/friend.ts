import { db } from '@/lib/db/drizzle';
import { friends, users } from '@/lib/db/schema';
import { TRPCError } from '@trpc/server';
import { and, eq, ilike, notInArray, or } from 'drizzle-orm';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

export const friendRouter = router({
  sendFriendRequest: protectedProcedure
    .input(z.object({ friendId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Check if friend request already exists
      const existingRequest = await db
        .select()
        .from(friends)
        .where(
          or(
            and(
              eq(friends.userId, userId),
              eq(friends.friendId, input.friendId)
            ),
            and(
              eq(friends.userId, input.friendId),
              eq(friends.friendId, userId)
            )
          )
        );

      if (existingRequest.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Friend request already exists',
        });
      }

      await db.insert(friends).values({
        userId,
        friendId: input.friendId,
        status: 'pending',
      });

      return { success: true };
    }),

  acceptFriendRequest: protectedProcedure
    .input(z.object({ requestId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const request = await db
        .select()
        .from(friends)
        .where(
          and(
            eq(friends.id, input.requestId),
            eq(friends.friendId, userId),
            eq(friends.status, 'pending')
          )
        );

      if (request.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Friend request not found',
        });
      }

      await db
        .update(friends)
        .set({ status: 'accepted', updatedAt: new Date() })
        .where(eq(friends.id, input.requestId));

      return { success: true };
    }),

  rejectFriendRequest: protectedProcedure
    .input(z.object({ requestId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      await db
        .delete(friends)
        .where(
          and(
            eq(friends.id, input.requestId),
            eq(friends.friendId, userId),
            eq(friends.status, 'pending')
          )
        );

      return { success: true };
    }),

  removeFriend: protectedProcedure
    .input(z.object({ friendId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      await db
        .delete(friends)
        .where(
          or(
            and(
              eq(friends.userId, userId),
              eq(friends.friendId, input.friendId)
            ),
            and(
              eq(friends.userId, input.friendId),
              eq(friends.friendId, userId)
            )
          )
        );

      return { success: true };
    }),

  getFriendList: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const friendsList = await db
      .select({
        id: friends.id,
        status: friends.status,
        createdAt: friends.createdAt,
        userId: friends.userId,
        friendId: friends.friendId,
        friend: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        },
      })
      .from(friends)
      .innerJoin(users, eq(friends.friendId, users.id))
      .where(eq(friends.userId, userId));

    return friendsList;
  }),

  getPendingFriendRequests: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const pendingRequests = await db
      .select({
        id: friends.id,
        status: friends.status,
        createdAt: friends.createdAt,
        userId: friends.userId,
        friendId: friends.friendId,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        },
      })
      .from(friends)
      .innerJoin(users, eq(friends.userId, users.id))
      .where(and(eq(friends.friendId, userId), eq(friends.status, 'pending')));

    return pendingRequests;
  }),

  searchUsers: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Get existing friend relationships
      const existingFriends = await db
        .select({
          friendId: friends.friendId,
        })
        .from(friends)
        .where(or(eq(friends.userId, userId), eq(friends.friendId, userId)));

      const friendIds = existingFriends.map((f) => f.friendId);

      // Search for users
      const searchResults = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        })
        .from(users)
        .where(
          and(
            or(
              ilike(users.name || '', `%${input.query}%`),
              ilike(users.email || '', `%${input.query}%`)
            ),
            // Exclude current user and existing friends
            and(notInArray(users.id, [userId]), notInArray(users.id, friendIds))
          )
        )
        .limit(10);

      return searchResults;
    }),
});
