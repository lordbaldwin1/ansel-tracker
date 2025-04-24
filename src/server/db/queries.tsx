import { db } from "./index";
import { plaidItems, plaidAccounts, accountBalances } from "./schema";
import { eq, inArray, and, max, desc } from "drizzle-orm";

export async function getPlaidItem(userId: string) {
  const plaidItem = await db.query.plaidItems.findFirst({
    where: eq(plaidItems.accountId, userId),
  });
  return plaidItem;
}

export async function getPlaidAccounts(plaidItemId: string) {
  const accounts = await db
    .select()
    .from(plaidAccounts)
    .where(eq(plaidAccounts.plaidItemId, plaidItemId));
  return accounts;
}

export async function getAccountBalances(accountIds: string[]) {
  const balances = await db
    .select()
    .from(accountBalances)
    .where(inArray(accountBalances.plaidAccountId, accountIds));
  return balances;
}

export async function getAccountsJoinedWithBalances(plaidItemId: string) {
  const accounts = await db
    .select()
    .from(plaidAccounts)
    .where(eq(plaidAccounts.plaidItemId, plaidItemId))
    .leftJoin(
      accountBalances,
      eq(plaidAccounts.id, accountBalances.plaidAccountId),
    )
    .orderBy(desc(accountBalances.date));
  return accounts;
}

export async function getMostRecentAccountsAndBalances(plaidItemId: string) {
  const accounts = await db
    .select({ plaid_account: plaidAccounts, account_balance: accountBalances })
    .from(plaidAccounts)
    .leftJoin(
      accountBalances,
      and(
        eq(plaidAccounts.id, accountBalances.plaidAccountId),
        eq(
          accountBalances.date,
          db
            .select({ maxDate: max(accountBalances.date) })
            .from(accountBalances)
            .where(eq(accountBalances.plaidAccountId, plaidAccounts.id)),
        ),
      ),
    )
    .where(eq(plaidAccounts.plaidItemId, plaidItemId));
  return accounts;
}
