import { sqliteTableCreator, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

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

// Define relations
export const plaidAccountRelations = relations(plaidAccounts, ({ one }) => ({
  plaidItem: one(plaidItems, {
    fields: [plaidAccounts.plaidItemId],
    references: [plaidItems.id],
  }),
}));

export const plaidItemRelations = relations(plaidItems, ({ many }) => ({
  plaidAccounts: many(plaidAccounts),
}));

export type PlaidAccount = typeof plaidAccounts.$inferSelect;

export const accountBalances = createTable("account_balance", {
  id: text('id').primaryKey(),
  plaidAccountId: text('plaid_account_id').notNull().references(() => plaidAccounts.id, { onDelete: 'cascade' }),
  current: real('current').notNull(),
  available: real('available').notNull(),
  limit: real('limit'),
  date: integer('date', { mode: 'timestamp' }).notNull(),
});

export type AccountBalance = typeof accountBalances.$inferSelect;

export const transactions = createTable("transaction", {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull().references(() => plaidAccounts.id, { onDelete: 'cascade' }),
  plaidTransactionId: text('plaid_transaction_id').notNull().unique(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  amount: real('amount').notNull(),
  name: text('name').notNull(),
  category: text('category'),
  merchantName: text('merchant_name'),
  pending: integer('pending', { mode: 'boolean' }).notNull().default(false),
  // security fields
  securityId: text('security_id'),
  tickerSymbol: text('ticker_symbol'),
  isin: text('isin'),
  cusip: text('cusip'),
  sedol: text('sedol'),
  institutionSecurityId: text('institution_security_id'),
  securityName: text('security_name'),
  securityType: text('security_type'),
  closePrice: real('close_price'),
  closePriceAsOf: integer('close_price_as_of', { mode: 'timestamp' }),
  isCashEquivalent: integer('is_cash_equivalent', { mode: 'boolean' }),
  type: text('type'),
  subtype: text('subtype'),
  isoCurrencyCode: text('iso_currency_code'),
  unofficialCurrencyCode: text('unofficial_currency_code'),
  marketIdentifierCode: text('market_identifier_code'),
  sector: text('sector'),
  industry: text('industry'),
  // regular transaction fields
  authorizedDate: integer('authorized_date', { mode: 'timestamp' }),
  authorizedDatetime: integer('authorized_datetime', { mode: 'timestamp' }),
  datetime: integer('datetime', { mode: 'timestamp' }),
  paymentChannel: text('payment_channel'),
  transactionCode: text('transaction_code'),
  personalFinanceCategory: text('personal_finance_category'),
  merchantEntityId: text('merchant_entity_id'),
  // location fields
  locationAddress: text('location_address'),
  locationCity: text('location_city'),
  locationRegion: text('location_region'),
  locationPostalCode: text('location_postal_code'),
  locationLatitude: real('location_latitude'),
  locationLongitude: real('location_longitude'),
  // payment metadata
  byOrderOf: text('by_order_of'),
  payee: text('payee'),
  payer: text('payer'),
  paymentMethod: text('payment_method'),
  paymentProcessor: text('payment_processor'),
  ppd_id: text('ppd_id'),
  reason: text('reason'),
  referenceNumber: text('reference_number'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export type Transaction = typeof transactions.$inferSelect;

export const transactionDownloadLogs = createTable("transaction_download_log", {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull().references(() => plaidAccounts.id, { onDelete: 'cascade' }),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
  numTransactions: integer('num_transactions').notNull(),
  status: text('status').notNull(),
  errorMessage: text('error_message'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type TransactionDownloadLog = typeof transactionDownloadLogs.$inferSelect;
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
