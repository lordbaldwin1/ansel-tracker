import { plaidClient } from "~/lib/plaid";
import type { Transaction as PlaidTransaction } from "plaid";
import {
  type PlaidAccount,
  plaidAccounts,
  type PlaidItem,
  transactionDownloadLogs,
  transactions,
} from "~/server/db/schema";
import { db } from "~/server/db";
import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

async function handleTransactions(
  account: PlaidAccount & { plaidItem: PlaidItem },
) {
  let allTransactions: PlaidTransaction[] = [];
  let hasMore = true;
  let cursor: string | undefined = undefined;

  console.log(`Downloading transactions for account: ${account.id}`);

  while (hasMore) {
    console.log(`Fetching transactions with cursor: ${cursor}`);

    const response = await plaidClient.transactionsSync({
      access_token: account.plaidItem.accessToken,
      cursor,
      count: 500,
      options: {
        include_original_description: true,
        account_id: account.plaidId,
      },
    });

    console.log("Plaid API Response:", {
      added: response.data.added.length,
      modified: response.data.modified.length,
      removed: response.data.removed.length,
      has_more: response.data.has_more,
    });

    const addedTransactions = response.data.added.filter(
      (tx) => tx.account_id === account.plaidId,
    );
    const modifiedTransactions = response.data.modified.filter(
      (tx) => tx.account_id === account.plaidId,
    );
    const removedTransactions = response.data.removed.filter(
      (tx) => tx.account_id === account.plaidId,
    );

    allTransactions = [...allTransactions, ...addedTransactions];

    for (const modifiedTx of modifiedTransactions) {
      await db
        .update(transactions)
        .set({
          amount: modifiedTx.amount,
          date: new Date(modifiedTx.date),
          name: modifiedTx.name,
          category: modifiedTx.personal_finance_category?.primary ?? null,
          merchantName: modifiedTx.merchant_name,
          pending: modifiedTx.pending,
        })
        .where(eq(transactions.plaidTransactionId, modifiedTx.transaction_id));
    }

    if (removedTransactions.length > 0) {
      console.log(
        `Removing ${removedTransactions.length} transactions for account: ${account.id}`,
      );
      await db.delete(transactions).where(
        inArray(
          transactions.plaidTransactionId,
          removedTransactions.map((tx) => tx.transaction_id),
        ),
      );
    }

    if (addedTransactions.length > 0) {
      const dates = addedTransactions.map((tx) => new Date(tx.date));
      const oldestDate = new Date(Math.min(...dates.map((d) => d.getTime())));
      const newestDate = new Date(Math.max(...dates.map((d) => d.getTime())));

      console.log("Received transactions date range:", {
        oldest: oldestDate.toISOString().split("T")[0],
        newest: newestDate.toISOString().split("T")[0],
        count: addedTransactions.length,
      });
    }

    cursor = response.data.next_cursor;
    hasMore = response.data.has_more;
  }

  const transactionDates = allTransactions.map((t) => new Date(t.date));
  const oldestDate =
    allTransactions.length > 0
      ? new Date(Math.min(...transactionDates.map((d) => d.getTime())))
      : new Date();
  const newestDate =
    allTransactions.length > 0
      ? new Date(Math.max(...transactionDates.map((d) => d.getTime())))
      : new Date();

  const downloadLog = await db.insert(transactionDownloadLogs).values({
    id: crypto.randomUUID(),
    accountId: account.id,
    startDate: oldestDate,
    endDate: newestDate,
    numTransactions: allTransactions.length,
    status: "success",
    createdAt: new Date(),
  });

  if (allTransactions.length > 0) {
    const values = allTransactions.map((tx) => ({
      id: crypto.randomUUID(),
      accountId: account.id,
      plaidTransactionId: tx.transaction_id,
      date: new Date(tx.date),
      name: tx.name,
      amount: tx.amount,
      category: tx.category?.[0] ?? null,
      merchantName: tx.merchant_name,
      pending: tx.pending,
      isoCurrencyCode: tx.iso_currency_code,
      unofficialCurrencyCode: tx.unofficial_currency_code,
      authorizedDate: tx.authorized_date ? new Date(tx.authorized_date) : null,
      authorizedDatetime: tx.authorized_datetime
        ? new Date(tx.authorized_datetime)
        : null,
      datetime: tx.datetime ? new Date(tx.datetime) : null,
      paymentChannel: tx.payment_channel,
      transactionCode: tx.transaction_code,
      personalFinanceCategory: tx.personal_finance_category?.primary ?? null,
      merchantEntityId: tx.merchant_entity_id,
      locationAddress: tx.location?.address,
      locationCity: tx.location?.city,
      locationRegion: tx.location?.region,
      locationPostalCode: tx.location?.postal_code,
      locationLatitude: tx.location?.lat ?? null,
      locationLongitude: tx.location?.lon ?? null,
      byOrderOf: tx.payment_meta?.by_order_of,
      payee: tx.payment_meta?.payee,
      payer: tx.payment_meta?.payer,
      paymentMethod: tx.payment_meta?.payment_method,
      paymentProcessor: tx.payment_meta?.payment_processor,
      ppd_id: tx.payment_meta?.ppd_id,
      reason: tx.payment_meta?.reason,
      referenceNumber: tx.payment_meta?.reference_number,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await db.transaction(async (tx) => {
      await tx.insert(transactions).values(values).onConflictDoNothing();
    });
  }

  return {
    message: "Transactions downloaded successfully",
    downloadLog,
    numTransactions: allTransactions.length,
  };
}

interface RequestBody {
  userId: string;
  plaidAccountId: string;
}

export async function POST(req: Request) {
  const { plaidAccountId } = await req.json() as RequestBody;

  const account = await db.query.plaidAccounts.findFirst({
    where: eq(plaidAccounts.id, plaidAccountId),
    with: {
      plaidItem: true,
    },
  });

  if (!account) {
    return NextResponse.json({ 
      success: false, 
      message: "Account not found",
      error: "ACCOUNT_NOT_FOUND" 
    }, { status: 404 });
  }

  if (!account.plaidItem) {
    return NextResponse.json({ 
      success: false, 
      message: "Plaid item not found",
      error: "PLAID_ITEM_NOT_FOUND" 
    }, { status: 404 });
  }

  try {
    const result = await handleTransactions(account);
    return NextResponse.json({ 
      success: true, 
      message: result.message,
      numTransactions: result.numTransactions
    }, { status: 200 });
  } catch (error) {
    console.error("Error downloading transactions:", error);

    await db.insert(transactionDownloadLogs).values({
      id: crypto.randomUUID(),
      accountId: account.id,
      startDate: new Date(),
      endDate: new Date(),
      status: "error",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      numTransactions: 0,
      createdAt: new Date(),
    });
    return NextResponse.json({ 
      success: false, 
      message: "Error downloading transactions",
      error: "DOWNLOAD_ERROR"
    }, { status: 500 });
  }
}
