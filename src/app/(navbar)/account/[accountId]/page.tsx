import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getSession } from "~/lib/auth/getSession";
import { db } from "~/server/db";
import { accounts, plaidItems, plaidAccounts } from "~/server/db/schema";
import {
  getAccountBalances,
  getMostRecentAccountBalance,
  getTransactions,
} from "~/server/db/queries";
import { formatCurrency, formatDate } from "~/lib/utils";
import TransactionsButton from "~/components/transactions-button";
import { CategoryBreakdownCard } from "~/components/category-breakdown-cart";
import { Suspense } from "react";
import { BalanceHistoryChart } from "~/components/balance-history-graph";
import { AccountPageBanner } from "~/components/account-page-banner";

export default async function AccountPage(props: {
  params: Promise<{ accountId: string }>;
}) {
  // INSANITY AUTH CHECKING
  const session = await getSession();
  if (!session?.user) {
    return notFound();
  }
  const authAccount = await db.query.accounts.findFirst({
    where: eq(accounts.userId, session.user.id),
  });
  if (!authAccount) {
    return notFound();
  }
  const items = await db.query.plaidItems.findMany({
    where: eq(plaidItems.accountId, authAccount.id),
  });
  if (!items) {
    return notFound();
  }
  const { accountId: accountParam } = await props.params;
  const urlDecodedAccountId = decodeURIComponent(accountParam);

  // OMG WHY GOD WHY!?
  const userPlaidItems = await db.query.plaidItems.findMany({
    where: eq(plaidItems.accountId, authAccount.id),
  });

  const plaidAccount = await db.query.plaidAccounts.findFirst({
    where: eq(plaidAccounts.id, urlDecodedAccountId),
  });

  if (
    !plaidAccount ||
    !userPlaidItems.some((item) => item.id === plaidAccount.plaidItemId)
  ) {
    return notFound();
  }

  const accountInformation = await db.query.plaidAccounts.findFirst({
    where: eq(plaidAccounts.id, urlDecodedAccountId),
    with: {
      plaidItem: true,
    },
  });

  if (!accountInformation) {
    return notFound();
  }

  const [mostRecentBalance, transactions, balanceHistory] = await Promise.all([
    getMostRecentAccountBalance(urlDecodedAccountId),
    getTransactions(urlDecodedAccountId),
    getAccountBalances(urlDecodedAccountId),
  ]);

  if (!mostRecentBalance || !transactions || !balanceHistory) {
    return notFound();
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <AccountPageBanner
        accountInformation={accountInformation}
        balance={mostRecentBalance}
        userId={authAccount.userId}
      />
      <Suspense fallback={<div>Loading...</div>}>
        <BalanceHistoryChart accountBalances={balanceHistory} />
      </Suspense>
      <Suspense fallback={<div>Loading...</div>}>
        <CategoryBreakdownCard chartData={transactions} />
      </Suspense>

      {transactions.length > 0 && (
        <div className="rounded-lg shadow">
          <div className="flex flex-row justify-between border-b p-6">
            <h2 className="text-lg font-semibold">Transaction History</h2>
            <TransactionsButton
              accountId={urlDecodedAccountId}
              userId={authAccount.userId}
            />
          </div>
          <div className="divide-y">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="hover:bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{transaction.name}</p>
                    <p className="text-muted-foreground">
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                  {/* -amount means account is gaining money, +amount means account is losing money */}
                  <p
                    className={`font-medium ${transaction.amount < 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {transaction.amount < 0
                      ? `+${formatCurrency(Math.abs(transaction.amount))}`
                      : `-${formatCurrency(Math.abs(transaction.amount))}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
