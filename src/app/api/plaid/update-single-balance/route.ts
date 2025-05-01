import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "~/lib/auth/getSession";
import { plaidClient } from "~/lib/plaid";
import { db } from "~/server/db";
import {
  accountBalances,
  accounts,
  plaidAccounts,
} from "~/server/db/schema";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
        error: "UNAUTHORIZED",
      },
      { status: 401 },
    );
  }

  try {
    const { userId, plaidAccountId } = (await req.json()) as {
      userId: string;
      plaidAccountId: string;
    };
    if (userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
          error: "UNAUTHORIZED",
        },
        { status: 401 },
      );
    }

    const authAccount = await db.query.accounts.findFirst({
      where: eq(accounts.userId, userId),
    });
    if (!authAccount) {
      return NextResponse.json(
        {
          success: false,
          message: "Account not found",
          error: "ACCOUNT_NOT_FOUND",
        },
        { status: 401 },
      );
    }

    const plaidAccount = await db.query.plaidAccounts.findFirst({
      where: eq(plaidAccounts.id, plaidAccountId),
      with: {
        plaidItem: true,
      },
    });

    if (!plaidAccount) {
      return NextResponse.json(
        {
          success: false,
          message: "Account not found",
          error: "ACCOUNT_NOT_FOUND",
        },
        { status: 404 },
      );
    }

    const accountResponse = await plaidClient.accountsBalanceGet({
      access_token: plaidAccount.plaidItem.accessToken,
    });

    const account = accountResponse.data.accounts.find(
      (a) => a.account_id === plaidAccount.id,
    );

    if (!account) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to find account in Plaid response",
          error: "PLAID_FAILED_PARSE",
        },
        { status: 401 },
      );
    }

    await db.insert(accountBalances).values({
      id: crypto.randomUUID(),
      plaidAccountId: account.account_id,
      current: account.balances.current ?? 0,
      available: account.balances.available ?? 0,
      limit: account.balances.limit ?? undefined,
      date: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Updated balance for the account`,
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating balance:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error updating balance",
      },
      { status: 500 },
    );
  }
}
