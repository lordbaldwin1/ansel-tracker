import { type NextRequest, NextResponse } from "next/server";
import { plaidClient } from "~/lib/plaid";
import { getSession } from "~/lib/auth/getSession";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { accountBalances, accounts, plaidAccounts, plaidItems } from "~/server/db/schema";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({
      success: false,
      message: "Unauthorized",
    }, { status: 401 });
  }

  try {
    const { userId } = (await req.json()) as { userId: string };
    if (userId !== session.user.id) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized",
      }, { status: 401 });
    }

    const authAccount = await db.query.accounts.findFirst({
      where: eq(accounts.userId, userId),
    });
    if (!authAccount) {
      return NextResponse.json({
        success: false,
        message: "Account not found",
      }, { status: 401 });
    }

    const items = await db
      .select()
      .from(plaidItems)
      .where(eq(plaidItems.accountId, authAccount.id));

    let updatedCount = 0;

    for (const item of items) {
      try {
        const accounts = await db
          .select()
          .from(plaidAccounts)
          .where(eq(plaidAccounts.plaidItemId, item.id));

        const accountsResponse = await plaidClient.accountsBalanceGet({
          access_token: item.accessToken,
        });

        for (const plaidAccount of accountsResponse.data.accounts) {
          const existingAccount = accounts.find(
            (a) => a.plaidId === plaidAccount.account_id,
          );

          if (existingAccount) {
            await db
              .insert(accountBalances)
              .values({
                id: crypto.randomUUID(),
                plaidAccountId: existingAccount.id,
                current: plaidAccount.balances.current ?? 0,
                available: plaidAccount.balances.available ?? 0,
                limit: plaidAccount.balances.limit ?? undefined,
                date: new Date(),
              });

            updatedCount++;
          }
        }
      } catch (error) {
        console.error("Error updating balances:", error);
        return NextResponse.json({
          success: false,
          message: "Error updating balances",
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated balances for ${updatedCount} accounts`,
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating balances:", error);
    return NextResponse.json({
      success: false,
      message: "Error updating balances",
    }, { status: 500 });
  }
}
