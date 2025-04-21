import { getSession } from "~/lib/auth/getSession";
import { redirect } from "next/navigation";

export default async function FinancePage() {
  const session = await getSession();

  if (!session?.user?.id) {
    return redirect("/sign-in?redirect=/finance");
  } else {
    return redirect(`/finance/${session.user.id}`);
  }
}

