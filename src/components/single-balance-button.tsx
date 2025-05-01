import { revalidatePath } from "next/cache";
import { env } from "~/env";
import { UpdateSingleBalanceButtonClient } from "./single-balance-button-client";

export default async function UpdateSingleBalanceButton(props: {
  userId: string;
  plaidAccountId: string;
}) {
  const userId = props.userId;
  const plaidAccountId = props.plaidAccountId;

  async function updateBalance() {
    "use server";
    const response = await fetch(
      `${env.NEXT_PUBLIC_BASE_URL}/api/plaid/update-single-balance`,
      {
        method: "POST",
        body: JSON.stringify({
          userId: userId,
          plaidAccountId: plaidAccountId,
        }),
      },
    );
    revalidatePath(`/account/${plaidAccountId}`);
    return response.json() as Promise<{
      success: boolean;
      message: string;
      error?: string;
    }>;
  }

  return <UpdateSingleBalanceButtonClient action={updateBalance} />;
}
