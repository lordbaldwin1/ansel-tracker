import { sqliteTableCreator, text, integer, real } from "drizzle-orm/sqlite-core";

export const createTable = sqliteTableCreator(
  (name) => `ansel-tracker_${name}`,
);

// Plaid specific tables
export const plaidItems = createTable("plaid_item", {
  id: text('id').primaryKey(),
  itemId: text('item_id').notNull().unique(),
  accessToken: text('access_token').notNull(),
  institutionId: text('institution_id').notNull(),
  institutionName: text('institution_name'),
  institutionLogo: text('institution_logo'),
  accountId: text('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export type PlaidItem = typeof plaidItems.$inferSelect;

export const plaidAccounts = createTable("plaid_account", {
  id: text('id').primaryKey(),
  plaidId: text('plaid_id').notNull().unique(),
  name: text('name').notNull(),
  nickname: text('nickname'),
  type: text('type').notNull(),
  subtype: text('subtype'),
  mask: text('mask'),
  hidden: integer('hidden', { mode: 'boolean' }).default(false),
  plaidItemId: text('plaid_item_id').notNull().references(() => plaidItems.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export type PlaidAccount = typeof plaidAccounts.$inferSelect;

export const accountBalances = createTable("account_balance", {
  id: text('id').primaryKey(),
  plaidAccountId: text('plaid_account_id').notNull().references(() => plaidAccounts.id, { onDelete: 'cascade' }),
  current: real('current').notNull(),
  available: real('available').notNull(),
  limit: real('limit'),
  date: integer('date', { mode: 'timestamp' }).notNull(),
});

// Auth tables
export const users = createTable("user", {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull(),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const sessions = createTable("session", {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' })
});

export const accounts = createTable("account", {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const verifications = createTable("verification", {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
});

export const authSchema = {
  users,
  sessions,
  accounts,
  verifications
}
