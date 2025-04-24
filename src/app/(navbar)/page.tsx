import { getSession } from "~/lib/auth/getSession";
import {
  getPlaidItem,
  getAccountsJoinedWithBalances,
  getMostRecentAccountsAndBalances,
} from "~/server/db/queries";
import { db } from "~/server/db";
import { accounts } from "~/server/db/schema";
import { eq } from "drizzle-orm";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default async function Page() {
  const session = await getSession();
  if (!session) {
    return <div>No session found</div>;
  }

  const userId = await db.query.accounts.findFirst({
    where: eq(accounts.userId, session.user.id),
  });
  if (!userId) {
    return <div>No user id found</div>;
  }
  const plaidItem = await getPlaidItem(userId.id);
  if (!plaidItem) {
    return <div>No plaid item found</div>;
  }
  const plaidAccounts = await getAccountsJoinedWithBalances(plaidItem.id);
  const mostRecentAccounts = await getMostRecentAccountsAndBalances(
    plaidItem.id,
  );

  return (
    <div className="flex h-screen flex-col items-center">
      <h1>Most Recent Balances</h1>
      {mostRecentAccounts.map((account) => (
        <div key={account.account_balance?.id}>
          <h1>{`${account.plaid_account.name} - ${formatCurrency(account.account_balance?.current ?? 0)} - ${account.account_balance?.date ? formatDate(account.account_balance.date) : "No date"}`}</h1>
        </div>
      ))}
      <h1>Balance History</h1>
      {plaidAccounts.map((account) => (
        <div key={account.account_balance?.id}>
          <h1>{`${account.plaid_account.name} - ${formatCurrency(account.account_balance?.current ?? 0)} - ${account.account_balance?.date ? formatDate(account.account_balance.date) : "No date"}`}</h1>
        </div>
      ))}
    </div>
  );
}
