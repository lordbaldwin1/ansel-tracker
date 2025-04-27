import { getSession } from "~/lib/auth/getSession";
import {
  getRecentPlaidItemsWithAccountsAndBalances,
  getPlaidItemsWithAccountsAndBalances,
  getBalanceHistoryGroupedByInstitution,
} from "~/server/db/queries";
import { db } from "~/server/db";
import { accounts } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import DashboardSummary from "~/components/dashboard-summary";
import AccountSummary from "~/components/account-summary";
import BalanceHistory from "~/components/balance-history";
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
  const [recentPlaidItems, allPlaidItems, balanceHistory] = await Promise.all([
    getRecentPlaidItemsWithAccountsAndBalances(userId.id),
    getPlaidItemsWithAccountsAndBalances(userId.id),
    getBalanceHistoryGroupedByInstitution(userId.id),
  ]);

  const totalBalance = recentPlaidItems.reduce((acc, item) => acc + (item.account_balance?.current ?? 0), 0);
  const totalAvailableBalance = recentPlaidItems.reduce((acc, item) => acc + (item.account_balance?.available ?? 0), 0);

  if (!recentPlaidItems || !allPlaidItems) {
    return <div>No plaid items found</div>;
  }

  return (
    <div className="flex h-screen flex-col">
      <DashboardSummary totalBalance={totalBalance} totalAvailableBalance={totalAvailableBalance} />
      <AccountSummary recentPlaidItems={recentPlaidItems} />
      <BalanceHistory balanceHistory={balanceHistory} />
      </div>
  );
}
