'use server'

import { db } from '@/lib/db/drizzle'
import { groups, groupMembers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth/auth'

export async function createGroup(data: { name: string; description?: string; avatar?: string }) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const userId = session.user.id

  // Create group
  const [group] = await db
    .insert(groups)
    .values({
      name: data.name,
      description: data.description,
      avatar: data.avatar,
      creatorId: userId,
    })
    .returning()

  // Add creator as admin
  await db.insert(groupMembers).values({
    groupId: group.id,
    userId: userId,
    role: 'admin',
  })

  revalidatePath('/groups')
  return { success: true, groupId: group.id }
}

export async function updateGroup(
  groupId: string,
  data: {
    name?: string
    description?: string
    avatar?: string
  }
) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const userId = session.user.id

  // Check if user is admin
  const member = await db
    .select()
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId),
        eq(groupMembers.role, 'admin')
      )
    )

  if (member.length === 0) {
    throw new Error('Unauthorized')
  }

  await db
    .update(groups)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(groups.id, groupId))

  revalidatePath('/groups')
  return { success: true }
}

export async function deleteGroup(groupId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const userId = session.user.id

  // Check if user is creator
  const group = await db
    .select()
    .from(groups)
    .where(and(eq(groups.id, groupId), eq(groups.creatorId, userId)))

  if (group.length === 0) {
    throw new Error('Unauthorized')
  }

  await db.delete(groups).where(eq(groups.id, groupId))

  revalidatePath('/groups')
  return { success: true }
}

export async function joinGroup(groupId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const userId = session.user.id

  // Check if already a member
  const existingMember = await db
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))

  if (existingMember.length > 0) {
    throw new Error('Already a member')
  }

  await db.insert(groupMembers).values({
    groupId,
    userId,
    role: 'member',
  })

  revalidatePath('/groups')
  return { success: true }
}

export async function leaveGroup(groupId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const userId = session.user.id

  // Check if user is not the creator
  const group = await db.select().from(groups).where(eq(groups.id, groupId))

  if (group[0]?.creatorId === userId) {
    throw new Error('Creator cannot leave group')
  }

  await db
    .delete(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))

  revalidatePath('/groups')
  return { success: true }
}

export async function getGroupMembers(groupId: string) {
  const members = await db.select().from(groupMembers).where(eq(groupMembers.groupId, groupId))

  return members
}

export async function getUserGroups() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const userId = session.user.id

  const userGroups = await db
    .select({
      group: groups,
      role: groupMembers.role,
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groups.id, groupMembers.groupId))
    .where(eq(groupMembers.userId, userId))

  return userGroups
}

export async function removeMember(groupId: string, memberId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const userId = session.user.id

  // Check if user is admin
  const admin = await db
    .select()
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId),
        eq(groupMembers.role, 'admin')
      )
    )

  if (admin.length === 0) {
    throw new Error('Unauthorized')
  }

  // Cannot remove creator
  const group = await db.select().from(groups).where(eq(groups.id, groupId))

  if (group[0]?.creatorId === memberId) {
    throw new Error('Cannot remove creator')
  }

  await db
    .delete(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, memberId)))

  revalidatePath('/groups')
  return { success: true }
}
