import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { user } from './better-auth';

export const message = sqliteTable('message', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  content: text('content').notNull(),
  senderId: text('sender_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  receiverId: text('receiver_id').notNull(),
  type: text('type', { enum: ['private', 'group'] }).notNull(),
  createdAt: integer('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const messageStatus = sqliteTable('message_status', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  targetId: text('target_id').notNull(),
  type: text('type', { enum: ['private', 'group'] }).notNull(),
  lastReadMessageId: text('last_read_message_id').references(() => message.id),
  unreadCount: integer('unread_count').notNull().default(0),
  updatedAt: integer('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const friend = sqliteTable('friend', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  friendId: text('friend_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  status: text('status', {
    enum: ['pending', 'accepted', 'blocked'],
  }).notNull(),
  lastMessageId: text('last_message_id').references(() => message.id),
  unreadCount: integer('unread_count').notNull().default(0),
  createdAt: integer('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const group = sqliteTable('group', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name').notNull(),
  description: text('description'),
  avatar: text('avatar'),
  creatorId: text('creator_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  lastMessageId: text('last_message_id').references(() => message.id),
  createdAt: integer('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const groupMember = sqliteTable('group_member', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  groupId: text('group_id')
    .notNull()
    .references(() => group.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['admin', 'member'] })
    .notNull()
    .default('member'),
  unreadCount: integer('unread_count').notNull().default(0),
  joinedAt: integer('joined_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const messageRelations = relations(message, ({ one }) => ({
  sender: one(user, {
    fields: [message.senderId],
    references: [user.id],
  }),
}));

export const messageStatusRelations = relations(messageStatus, ({ one }) => ({
  user: one(user, {
    fields: [messageStatus.userId],
    references: [user.id],
  }),
  lastReadMessage: one(message, {
    fields: [messageStatus.lastReadMessageId],
    references: [message.id],
  }),
}));

export const friendRelations = relations(friend, ({ one }) => ({
  user: one(user, {
    fields: [friend.userId],
    references: [user.id],
  }),
  friend: one(user, {
    fields: [friend.friendId],
    references: [user.id],
  }),
  lastMessage: one(message, {
    fields: [friend.lastMessageId],
    references: [message.id],
  }),
}));

export const groupRelations = relations(group, ({ one, many }) => ({
  creator: one(user, {
    fields: [group.creatorId],
    references: [user.id],
  }),
  members: many(groupMember),
  lastMessage: one(message, {
    fields: [group.lastMessageId],
    references: [message.id],
  }),
}));

export const groupMemberRelations = relations(groupMember, ({ one }) => ({
  group: one(group, {
    fields: [groupMember.groupId],
    references: [group.id],
  }),
  user: one(user, {
    fields: [groupMember.userId],
    references: [user.id],
  }),
}));
