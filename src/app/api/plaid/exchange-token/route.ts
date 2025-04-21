import { type NextRequest, NextResponse } from "next/server";
import { plaidClient } from "~/lib/plaid";
import type { PlaidAccount } from "~/server/db/schema";
import { CountryCode, type AccountBase } from "plaid";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { accountBalances, plaidAccounts, plaidItems, accounts } from "~/server/db/schema";
import { institutionLogos } from "~/lib/institutionLogos";

function formatLogoUrl(
  logo: string | null | undefined,
  institutionId: string,
): string | null {
  // First try the Plaid-provided logo
  if (logo) {
    // Check if it's already a data URL or regular URL
    if (logo.startsWith("data:") || logo.startsWith("http")) {
      return logo;
    }
    // Otherwise, assume it's a base64 string and format it as a data URL
    return `data:image/png;base64,${logo}`;
  }

  // If no Plaid logo, try the fallback logo
  return institutionLogos[institutionId] ?? null;
}

function findMatchingAccount(
  account: AccountBase,
  existingAccounts: PlaidAccount[],
) {
  return existingAccounts.find(
    (existing) =>
      account.mask &&
      existing.mask === account.mask &&
      String(existing.type) === String(account.type) &&
      ((!account.subtype && !existing.subtype) ||
        String(existing.subtype) === String(account.subtype)),
  );
}

export async function POST(req: NextRequest) {
  try {
    // Get the public token and user ID from the request body
    const { public_token, userId } = (await req.json()) as {
      public_token: string;
      userId: string;
    };

    // Exchange the public token for an access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });
    const { access_token, item_id } = exchangeResponse.data;

    // Get the item details
    const itemResponse = await plaidClient.itemGet({
      access_token,
    });

    // Get the institution ID from the item details
    const institutionId = itemResponse.data.item.institution_id;
    if (!institutionId) {
      throw new Error("Institution ID not found");
    }

    // Get the institution details
    const institutionResponse = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: [CountryCode.Us],
      options: {
        include_optional_metadata: true,
      },
    });
    const institution = institutionResponse.data.institution;

    // First get the Plaid item
    const existingItem = await db.query.plaidItems.findFirst({
      where: eq(plaidItems.institutionId, institutionId),
    });

    // Then get the related accounts
    const existingAccounts = existingItem 
      ? await db.query.plaidAccounts.findMany({
          where: eq(plaidAccounts.plaidItemId, existingItem.id),
        })
      : [];

    // Get the accounts from Plaid
    const accountsResponse = await plaidClient.accountsGet({
      access_token,
    });

    if (existingItem) {
      console.log("Found existing institution", institutionId);

      // Update the existing Plaid Item
      const [updatedItem] = await db
        .update(plaidItems)
        .set({
          itemId: item_id,
          accessToken: access_token,
          institutionName: institution.name,
          institutionLogo: formatLogoUrl(institution.logo, institutionId),
          updatedAt: new Date(),
        })
        .where(eq(plaidItems.id, existingItem.id))
        .returning();

      if (!updatedItem) {
        throw new Error("Failed to update item");
      }

      const processedAccountIds = new Set<string>();

      // Process accounts
      for (const account of accountsResponse.data.accounts) {
        const existingAccount = findMatchingAccount(
          account,
          existingAccounts,
        );

        if (existingAccount) {
          console.log(
            `Updating existing account: ${existingAccount.id} (${existingAccount.name})`,
          );
          processedAccountIds.add(existingAccount.id);

          // Update existing account
          await db
            .update(plaidAccounts)
            .set({
              plaidId: account.account_id,
              name: account.name,
              type: account.type,
              subtype: account.subtype ?? null,
              mask: account.mask ?? null,
            })
            .where(eq(plaidAccounts.id, existingAccount.id));

          // Add new balance
          await db.insert(accountBalances).values({
            id: crypto.randomUUID(),
            plaidAccountId: existingAccount.id,
            current: account.balances.current ?? 0,
            available: account.balances.available ?? 0,
            limit: account.balances.limit ?? undefined,
            date: new Date(),
          });
        } else {
          console.log(
            `Creating new account: ${account.name} (${account.mask})`,
          );

          const newAccountData = {
            id: crypto.randomUUID(),
            plaidId: account.account_id,
            name: account.name,
            type: account.type,
            subtype: account.subtype ?? null,
            mask: account.mask ?? null,
            plaidItemId: updatedItem.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Create new account
          const [newAccount] = await db
            .insert(plaidAccounts)
            .values(newAccountData)
            .returning();

          if (!newAccount) {
            throw new Error("Failed to create new account");
          }

          // Create initial balance
          await db.insert(accountBalances).values({
            id: crypto.randomUUID(),
            plaidAccountId: newAccount.id,
            current: account.balances.current ?? 0,
            available: account.balances.available ?? 0,
            limit: account.balances.limit ?? undefined,
            date: new Date(),
          });
        }
      }

      // Handle deleted accounts
      const deletedAccounts = (existingAccounts as PlaidAccount[]).filter(
        (account) => !processedAccountIds.has(account.id),
      );

      if (deletedAccounts.length > 0) {
        console.log(
          `Found ${deletedAccounts.length} accounts no longer available at institution`,
        );
        await db
          .update(plaidAccounts)
          .set({ hidden: true })
          .where(eq(plaidAccounts.id, deletedAccounts[0]?.id ?? ""));
      }

      return NextResponse.json({
        success: true,
        message: "Updated existing institution",
        institution: institution.name,
      });
    } else {
      console.log("Creating new institution and accounts...");
      const authAccount = await db.query.accounts.findFirst({
        where: eq(accounts.userId, userId),
      });
      if (!authAccount) {
        throw new Error("Auth account not found");
      }
      // Create new Plaid Item
      const newItemData = {
        id: crypto.randomUUID(),
        itemId: item_id,
        accessToken: access_token,
        institutionId,
        institutionName: institution.name,
        institutionLogo: formatLogoUrl(institution.logo, institutionId),
        accountId: authAccount.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const [newItem] = await db
        .insert(plaidItems)
        .values(newItemData)
        .returning();

      if (!newItem) {
        throw new Error("Failed to create new item");
      }

      // Create accounts and initial balances
      for (const account of accountsResponse.data.accounts) {
        console.log(`Creating new account: ${account.name} (${account.mask})`);

        // Create new account
        const newAccountData = {
          id: crypto.randomUUID(),
          plaidId: account.account_id,
          name: account.name,
          type: account.type,
          subtype: account.subtype ? String(account.subtype) : undefined,
          mask: account.mask ?? null,
          plaidItemId: newItem.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const [newAccount] = await db
          .insert(plaidAccounts)
          .values(newAccountData)
          .returning();

        if (!newAccount) {
          throw new Error("Failed to create new account");
        }

        // Create initial balance
        await db.insert(accountBalances).values({
          id: crypto.randomUUID(),
          plaidAccountId: newAccount.id,
          current: account.balances.current ?? 0,
          available: account.balances.available ?? 0,
          limit: account.balances.limit ?? undefined,
          date: new Date(),
        });
      }

      return NextResponse.json({
        success: true,
        message: "Created new institution and accounts",
        institution: institution.name,
      });
    }
  } catch (error) {
    console.error("Error exchanging token:", error);
    return NextResponse.json(
      { error: "Failed to exchange token" },
      { status: 500 },
    );
  }
}
