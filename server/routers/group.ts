import { db } from '@/lib/db/drizzle';
import { group, groupMember } from '@/lib/db/schema';
import { and, eq, sql } from 'drizzle-orm';
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
      const [newGroup] = await db
        .insert(group)
        .values({
          name: input.name,
          description: input.description,
          avatar: input.avatar,
          creatorId: user.id,
        })
        .returning();

      // Add creator as admin
      await db.insert(groupMember).values({
        groupId: newGroup.id,
        userId: user.id,
        role: 'admin',
      });

      return { success: true, groupId: newGroup.id };
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
        .from(groupMember)
        .where(
          and(
            eq(groupMember.groupId, input.groupId),
            eq(groupMember.userId, user.id),
            eq(groupMember.role, 'admin')
          )
        );

      if (member.length === 0) {
        throw new Error('Unauthorized');
      }

      await db
        .update(group)
        .set({
          ...input.data,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(group.id, input.groupId));

      return { success: true };
    }),

  deleteGroup: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;

      // Check if user is creator
      const existingGroup = await db
        .select()
        .from(group)
        .where(and(eq(group.id, input.groupId), eq(group.creatorId, user.id)));

      if (existingGroup.length === 0) {
        throw new Error('Unauthorized');
      }

      await db.delete(group).where(eq(group.id, input.groupId));

      return { success: true };
    }),

  joinGroup: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;

      // Check if already a member
      const existingMember = await db
        .select()
        .from(groupMember)
        .where(
          and(
            eq(groupMember.groupId, input.groupId),
            eq(groupMember.userId, user.id)
          )
        );

      if (existingMember.length > 0) {
        throw new Error('Already a member');
      }

      await db.insert(groupMember).values({
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
      const existingGroup = await db
        .select()
        .from(group)
        .where(eq(group.id, input.groupId));

      if (existingGroup[0]?.creatorId === user.id) {
        throw new Error('Creator cannot leave group');
      }

      await db
        .delete(groupMember)
        .where(
          and(
            eq(groupMember.groupId, input.groupId),
            eq(groupMember.userId, user.id)
          )
        );

      return { success: true };
    }),

  getGroupMembers: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ input }) => {
      const members = await db
        .select()
        .from(groupMember)
        .where(eq(groupMember.groupId, input.groupId));

      return members;
    }),

  getUserGroups: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx;

    const userGroups = await db
      .select({
        group: group,
        role: groupMember.role,
      })
      .from(groupMember)
      .innerJoin(group, eq(group.id, groupMember.groupId))
      .where(eq(groupMember.userId, user.id));

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
        .from(groupMember)
        .where(
          and(
            eq(groupMember.groupId, input.groupId),
            eq(groupMember.userId, user.id),
            eq(groupMember.role, 'admin')
          )
        );

      if (admin.length === 0) {
        throw new Error('Unauthorized');
      }

      // Cannot remove creator
      const existingGroup = await db
        .select()
        .from(group)
        .where(eq(group.id, input.groupId));

      if (existingGroup[0]?.creatorId === input.memberId) {
        throw new Error('Cannot remove creator');
      }

      await db
        .delete(groupMember)
        .where(
          and(
            eq(groupMember.groupId, input.groupId),
            eq(groupMember.userId, input.memberId)
          )
        );

      return { success: true };
    }),
});
