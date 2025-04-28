import { db } from "./index";
import { plaidItems, plaidAccounts, accountBalances, transactions } from "./schema";
import { eq, and, max, desc } from "drizzle-orm";
import type { HierarchicalPlaidItem } from "~/lib/types";

export async function getRecentPlaidItemsWithAccountsAndBalances(
  userId: string,
) {
  const items = await db
    .select({
      plaid_item: plaidItems,
      plaid_account: plaidAccounts,
      account_balance: accountBalances,
    })
    .from(plaidItems)
    .leftJoin(plaidAccounts, eq(plaidItems.id, plaidAccounts.plaidItemId))
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
    .where(eq(plaidItems.accountId, userId))
    .orderBy(plaidItems.institutionName, plaidAccounts.name);
  return items;
}

export async function getPlaidItemsWithAccountsAndBalances(userId: string) {
  const items = await db
    .select({
      plaid_item: plaidItems,
      plaid_account: plaidAccounts,
      account_balance: accountBalances,
    })
    .from(plaidItems)
    .leftJoin(plaidAccounts, eq(plaidItems.id, plaidAccounts.plaidItemId))
    .leftJoin(
      accountBalances,
      eq(plaidAccounts.id, accountBalances.plaidAccountId),
    )
    .where(eq(plaidItems.accountId, userId))
    .orderBy(plaidItems.institutionName, plaidAccounts.name, desc(accountBalances.date));
  return items;
}

export async function getBalanceHistoryGroupedByInstitution(
  userId: string,
): Promise<HierarchicalPlaidItem[]> {
  const items = await db
    .select({
      plaid_item: plaidItems,
      plaid_account: plaidAccounts,
      account_balance: accountBalances,
    })
    .from(plaidItems)
    .leftJoin(plaidAccounts, eq(plaidItems.id, plaidAccounts.plaidItemId))
    .leftJoin(
      accountBalances,
      eq(plaidAccounts.id, accountBalances.plaidAccountId),
    )
    .where(eq(plaidItems.accountId, userId))
    .orderBy(plaidItems.institutionName, plaidAccounts.name, desc(accountBalances.date));

  const groupedItems = items.reduce((acc, item) => {
    const institutionId = item.plaid_item.id;
    
    acc[institutionId] ??= {
      id: item.plaid_item.id,
      itemId: item.plaid_item.itemId,
      institutionId: item.plaid_item.institutionId,
      institutionName: item.plaid_item.institutionName,
      institutionLogo: item.plaid_item.institutionLogo,
      accounts: [],
    };

    if (item.plaid_account) {
      const existingAccount = acc[institutionId].accounts.find(
        acc => acc.id === item.plaid_account!.id
      );

      if (existingAccount) {
        if (item.account_balance) {
          existingAccount.balances.push({
            id: item.account_balance.id,
            current: item.account_balance.current,
            available: item.account_balance.available,
            limit: item.account_balance.limit,
            date: item.account_balance.date,
          });
        }
      } else {
        acc[institutionId].accounts.push({
          id: item.plaid_account.id,
          plaidId: item.plaid_account.plaidId,
          name: item.plaid_account.name,
          nickname: item.plaid_account.nickname,
          type: item.plaid_account.type,
          subtype: item.plaid_account.subtype,
          mask: item.plaid_account.mask,
          balances: item.account_balance ? [{
            id: item.account_balance.id,
            current: item.account_balance.current,
            available: item.account_balance.available,
            limit: item.account_balance.limit,
            date: item.account_balance.date,
          }] : [],
        });
      }
    }

    return acc;
  }, {} as Record<string, HierarchicalPlaidItem>);

  return Object.values(groupedItems);
}

export async function getAccountBalances(accountId: string) {
  const balances = await db.query.accountBalances.findMany({
    where: eq(accountBalances.plaidAccountId, accountId),
  });
  return balances;
}

export async function getMostRecentAccountBalance(accountId: string) {
  const balance = await db.query.accountBalances.findFirst({
    where: eq(accountBalances.plaidAccountId, accountId),
    orderBy: desc(accountBalances.date),
  });
  return balance;
}

export async function getTransactions(accountId: string) {
  const trans = await db.query.transactions.findMany({
    where: eq(transactions.accountId, accountId),
  });
  return trans;
}

