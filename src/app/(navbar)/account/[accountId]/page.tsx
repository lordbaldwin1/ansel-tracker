import { eq } from "drizzle-orm";
import { PiggyBank } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getSession } from "~/lib/auth/getSession";
import { db } from "~/server/db";
import { accounts, plaidItems, plaidAccounts } from "~/server/db/schema";
import { getMostRecentAccountBalance, getTransactions } from "~/server/db/queries";
import { formatCurrency, formatDate } from "~/lib/utils";
import TransactionsButton from "~/components/transactions-button";

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
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        {accountInformation.plaidItem.institutionLogo ? (
          <Image
            src={accountInformation.plaidItem.institutionLogo}
            alt="Institution Logo"
            width={64}
            height={64}
            className="rounded-lg"
          />
        ) : (
          <PiggyBank className="h-16 w-16 text-gray-400" />
        )}
        <div>
          <h1 className="text-2xl font-bold">{accountInformation.name}</h1>
          <p className="text-gray-600">{accountInformation.plaidItem.institutionName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Account Details</h2>
          <div className="space-y-2">
            <p><span className="text-gray-600">Type:</span> {accountInformation.type}</p>
            <p><span className="text-gray-600">Subtype:</span> {accountInformation.subtype}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Current Balance</h2>
          <div className="space-y-2">
            <p><span className="text-gray-600">Current:</span> {formatCurrency(mostRecentBalance?.current ?? 0)}</p>
            <p><span className="text-gray-600">Available:</span> {formatCurrency(mostRecentBalance?.available ?? 0)}</p>
            {mostRecentBalance?.limit && (
              <p><span className="text-gray-600">Limit:</span> {formatCurrency(mostRecentBalance.limit)}</p>
            )}
            {mostRecentBalance?.date && (
              <p className="text-sm text-gray-500">As of {formatDate(mostRecentBalance.date)}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <TransactionsButton accountId={urlDecodedAccountId} userId={authAccount.userId} />
      </div>

      {transactions.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
          </div>
          <div className="divide-y">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{transaction.name}</p>
                    <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                  </div>
                  <p className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(transaction.amount)}
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
