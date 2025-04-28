import { getSession } from "~/lib/auth/getSession";
import { notFound } from "next/navigation";
import { env } from "~/env";
import { TransactionsButtonClient } from "./transactions-button-client";
import { revalidatePath } from "next/cache";

export default async function TransactionsButton(props: {
  accountId: string, userId: string;
}) {
  const accountId = props.accountId;
  const userId = props.userId;
  const session = await getSession();
  if (!session?.user) {
    return notFound();
  }

  async function getTransactions() {
    'use server';
    const response = await fetch(`${env.NEXT_PUBLIC_BASE_URL}/api/plaid/get-transactions`, {
      method: "POST",
      body: JSON.stringify({ userId: userId, plaidAccountId: accountId }),
    });
    revalidatePath(`/account/${accountId}`);
    return response.json() as Promise<{ success: boolean; message: string; error?: string; numTransactions?: number }>;
  }

  return <TransactionsButtonClient action={getTransactions} />;
}

