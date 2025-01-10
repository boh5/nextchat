import { db } from '@/lib/db/drizzle';
import { friend, user } from '@/lib/db/schema';
import { TRPCError } from '@trpc/server';
import { and, eq, ilike, notInArray, or, sql } from 'drizzle-orm';
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
        .from(friend)
        .where(
          or(
            and(eq(friend.userId, userId), eq(friend.friendId, input.friendId)),
            and(eq(friend.userId, input.friendId), eq(friend.friendId, userId))
          )
        );

      if (existingRequest.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Friend request already exists',
        });
      }

      await db.insert(friend).values({
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
        .from(friend)
        .where(
          and(
            eq(friend.id, input.requestId),
            eq(friend.friendId, userId),
            eq(friend.status, 'pending')
          )
        );

      if (request.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Friend request not found',
        });
      }

      await db
        .update(friend)
        .set({ status: 'accepted', updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(eq(friend.id, input.requestId));

      return { success: true };
    }),

  rejectFriendRequest: protectedProcedure
    .input(z.object({ requestId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      await db
        .delete(friend)
        .where(
          and(
            eq(friend.id, input.requestId),
            eq(friend.friendId, userId),
            eq(friend.status, 'pending')
          )
        );

      return { success: true };
    }),

  removeFriend: protectedProcedure
    .input(z.object({ friendId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      await db
        .delete(friend)
        .where(
          or(
            and(eq(friend.userId, userId), eq(friend.friendId, input.friendId)),
            and(eq(friend.userId, input.friendId), eq(friend.friendId, userId))
          )
        );

      return { success: true };
    }),

  getFriendList: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const friendsList = await db
      .select({
        id: friend.id,
        status: friend.status,
        createdAt: friend.createdAt,
        userId: friend.userId,
        friendId: friend.friendId,
        friend: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(friend)
      .innerJoin(user, eq(friend.friendId, user.id))
      .where(eq(friend.userId, userId));

    return friendsList;
  }),

  getPendingFriendRequests: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const pendingRequests = await db
      .select({
        id: friend.id,
        status: friend.status,
        createdAt: friend.createdAt,
        userId: friend.userId,
        friendId: friend.friendId,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(friend)
      .innerJoin(user, eq(friend.userId, user.id))
      .where(and(eq(friend.friendId, userId), eq(friend.status, 'pending')));

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
          friendId: friend.friendId,
        })
        .from(friend)
        .where(or(eq(friend.userId, userId), eq(friend.friendId, userId)));

      const friendIds = existingFriends.map((f) => f.friendId);

      // Search for users
      const searchResults = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        })
        .from(user)
        .where(
          and(
            or(
              ilike(user.name || '', `%${input.query}%`),
              ilike(user.email || '', `%${input.query}%`)
            ),
            // Exclude current user and existing friends
            and(notInArray(user.id, [userId]), notInArray(user.id, friendIds))
          )
        )
        .limit(10);

      return searchResults;
    }),
});
