import { boolean, timestamp, pgTable, text, primaryKey, integer } from 'drizzle-orm/pg-core'
import type { AdapterAccountType } from 'next-auth/adapters'
import { relations } from 'drizzle-orm'

export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
})

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  authenticators: many(authenticators),
  friends: many(friends),
  groupMembers: many(groupMembers),
  messages: many(messages),
}))

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  account => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  verificationToken => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
)

export const authenticators = pgTable(
  'authenticator',
  {
    credentialID: text('credentialID').notNull().unique(),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    providerAccountId: text('providerAccountId').notNull(),
    credentialPublicKey: text('credentialPublicKey').notNull(),
    counter: integer('counter').notNull(),
    credentialDeviceType: text('credentialDeviceType').notNull(),
    credentialBackedUp: boolean('credentialBackedUp').notNull(),
    transports: text('transports'),
  },
  authenticator => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  })
)

export const messages = pgTable('message', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  content: text('content').notNull(),
  senderId: text('sender_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  receiverId: text('receiver_id').notNull(),
  type: text('type', { enum: ['private', 'group'] }).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
})

export const messageStatus = pgTable('message_status', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  targetId: text('target_id').notNull(),
  type: text('type', { enum: ['private', 'group'] }).notNull(),
  lastReadMessageId: text('last_read_message_id').references(() => messages.id),
  unreadCount: integer('unread_count').notNull().default(0),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
})

export const friends = pgTable('friend', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  friendId: text('friend_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['pending', 'accepted', 'blocked'] }).notNull(),
  lastMessageId: text('last_message_id').references(() => messages.id),
  unreadCount: integer('unread_count').notNull().default(0),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
})

export const groups = pgTable('group', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
  avatar: text('avatar'),
  creatorId: text('creator_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  lastMessageId: text('last_message_id').references(() => messages.id),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
})

export const groupMembers = pgTable('group_member', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  groupId: text('group_id')
    .notNull()
    .references(() => groups.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['admin', 'member'] })
    .notNull()
    .default('member'),
  unreadCount: integer('unread_count').notNull().default(0),
  joinedAt: timestamp('joined_at', { mode: 'date' }).notNull().defaultNow(),
})

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}))

export const messageStatusRelations = relations(messageStatus, ({ one }) => ({
  user: one(users, {
    fields: [messageStatus.userId],
    references: [users.id],
  }),
  lastReadMessage: one(messages, {
    fields: [messageStatus.lastReadMessageId],
    references: [messages.id],
  }),
}))

export const friendsRelations = relations(friends, ({ one }) => ({
  user: one(users, {
    fields: [friends.userId],
    references: [users.id],
  }),
  friend: one(users, {
    fields: [friends.friendId],
    references: [users.id],
  }),
  lastMessage: one(messages, {
    fields: [friends.lastMessageId],
    references: [messages.id],
  }),
}))

export const groupsRelations = relations(groups, ({ one, many }) => ({
  creator: one(users, {
    fields: [groups.creatorId],
    references: [users.id],
  }),
  members: many(groupMembers),
  lastMessage: one(messages, {
    fields: [groups.lastMessageId],
    references: [messages.id],
  }),
}))

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
}))
