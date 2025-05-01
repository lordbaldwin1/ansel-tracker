import { eq } from "drizzle-orm";
import { PiggyBank } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getSession } from "~/lib/auth/getSession";
import { db } from "~/server/db";
import { accounts, plaidItems, plaidAccounts } from "~/server/db/schema";
import {
  getMostRecentAccountBalance,
  getTransactions,
} from "~/server/db/queries";
import { formatCurrency, formatDate } from "~/lib/utils";
import TransactionsButton from "~/components/transactions-button";
import { CategoryBreakdownCard } from "~/components/category-breakdown-cart";
import { Suspense } from "react";
import UpdateSingleBalanceButton from "~/components/single-balance-button";
import { BalanceHistoryChart } from "~/components/balance-history-graph";

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

  const [mostRecentBalance, transactions] = await Promise.all([
    getMostRecentAccountBalance(urlDecodedAccountId),
    getTransactions(urlDecodedAccountId),
  ]);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8 flex items-center justify-center gap-4">
        {accountInformation.plaidItem.institutionLogo ? (
          <Image
            src={accountInformation.plaidItem.institutionLogo}
            alt="Institution Logo"
            width={64}
            height={64}
            className="rounded-lg"
          />
        ) : (
          <PiggyBank className="h-16 w-16" />
        )}
        <div>
          <h1 className="text-2xl font-bold">{accountInformation.name}</h1>
          <p>{accountInformation.plaidItem.institutionName}</p>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">Account Details</h2>
            <div className="space-y-2">
              <p className="text-muted-foreground">
                <span className="text-foreground">Type:</span>{" "}
                {accountInformation.type}
              </p>
              <p className="text-muted-foreground">
                <span className="text-foreground">Subtype:</span>{" "}
                {accountInformation.subtype}
              </p>
            </div>
          </div>

          <div className="rounded-lg p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">Current Balance</h2>
            <div className="space-y-2">
              <p>
                <span>Current:</span>{" "}
                {formatCurrency(mostRecentBalance?.current ?? 0)}
              </p>
              <p>
                <span>Available:</span>{" "}
                {formatCurrency(mostRecentBalance?.available ?? 0)}
              </p>
              {mostRecentBalance?.limit && (
                <p>
                  <span>Limit:</span> {formatCurrency(mostRecentBalance.limit)}
                </p>
              )}
              {mostRecentBalance?.date && (
                <p className="text-muted-foreground">
                  As of {formatDate(mostRecentBalance.date)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 flex items-center justify-center gap-4">
        <TransactionsButton
          accountId={urlDecodedAccountId}
          userId={authAccount.userId}
        />
        <UpdateSingleBalanceButton
          plaidAccountId={urlDecodedAccountId}
          userId={authAccount.userId}
        />
        {/* <Button>Update Both (TODO)</Button> */}
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <BalanceHistoryChart />
      </Suspense>
      <Suspense fallback={<div>Loading...</div>}>
        <CategoryBreakdownCard chartData={transactions} />
      </Suspense>

      {transactions.length > 0 && (
        <div className="rounded-lg shadow">
          <div className="border-b p-6">
            <h2 className="text-lg font-semibold">Transaction History</h2>
          </div>
          <div className="divide-y">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="hover:bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {transaction.name}
                    </p>
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
