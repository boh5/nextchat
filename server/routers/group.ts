import { db } from '@/lib/db/drizzle';
import { groupMembers, groups } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

export const groupRouter = router({
  createGroup: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        avatar: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;

      // Create group
      const [group] = await db
        .insert(groups)
        .values({
          name: input.name,
          description: input.description,
          avatar: input.avatar,
          creatorId: user.id,
        })
        .returning();

      // Add creator as admin
      await db.insert(groupMembers).values({
        groupId: group.id,
        userId: user.id,
        role: 'admin',
      });

      return { success: true, groupId: group.id };
    }),

  updateGroup: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        data: z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          avatar: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;

      // Check if user is admin
      const member = await db
        .select()
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, input.groupId),
            eq(groupMembers.userId, user.id),
            eq(groupMembers.role, 'admin')
          )
        );

      if (member.length === 0) {
        throw new Error('Unauthorized');
      }

      await db
        .update(groups)
        .set({
          ...input.data,
          updatedAt: new Date(),
        })
        .where(eq(groups.id, input.groupId));

      return { success: true };
    }),

  deleteGroup: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;

      // Check if user is creator
      const group = await db
        .select()
        .from(groups)
        .where(
          and(eq(groups.id, input.groupId), eq(groups.creatorId, user.id))
        );

      if (group.length === 0) {
        throw new Error('Unauthorized');
      }

      await db.delete(groups).where(eq(groups.id, input.groupId));

      return { success: true };
    }),

  joinGroup: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;

      // Check if already a member
      const existingMember = await db
        .select()
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, input.groupId),
            eq(groupMembers.userId, user.id)
          )
        );

      if (existingMember.length > 0) {
        throw new Error('Already a member');
      }

      await db.insert(groupMembers).values({
        groupId: input.groupId,
        userId: user.id,
        role: 'member',
      });

      return { success: true };
    }),

  leaveGroup: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;

      // Check if user is not the creator
      const group = await db
        .select()
        .from(groups)
        .where(eq(groups.id, input.groupId));

      if (group[0]?.creatorId === user.id) {
        throw new Error('Creator cannot leave group');
      }

      await db
        .delete(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, input.groupId),
            eq(groupMembers.userId, user.id)
          )
        );

      return { success: true };
    }),

  getGroupMembers: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ input }) => {
      const members = await db
        .select()
        .from(groupMembers)
        .where(eq(groupMembers.groupId, input.groupId));

      return members;
    }),

  getUserGroups: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx;

    const userGroups = await db
      .select({
        group: groups,
        role: groupMembers.role,
      })
      .from(groupMembers)
      .innerJoin(groups, eq(groups.id, groupMembers.groupId))
      .where(eq(groupMembers.userId, user.id));

    return userGroups;
  }),

  removeMember: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        memberId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;

      // Check if user is admin
      const admin = await db
        .select()
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, input.groupId),
            eq(groupMembers.userId, user.id),
            eq(groupMembers.role, 'admin')
          )
        );

      if (admin.length === 0) {
        throw new Error('Unauthorized');
      }

      // Cannot remove creator
      const group = await db
        .select()
        .from(groups)
        .where(eq(groups.id, input.groupId));

      if (group[0]?.creatorId === input.memberId) {
        throw new Error('Cannot remove creator');
      }

      await db
        .delete(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, input.groupId),
            eq(groupMembers.userId, input.memberId)
          )
        );

      return { success: true };
    }),
});
