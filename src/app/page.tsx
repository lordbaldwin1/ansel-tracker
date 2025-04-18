import SignIn from "~/components/sign-in";
import { redirect } from "next/navigation";
import { getUser } from "~/lib/getUser";

export default async function HomePage() {
  const session = await getUser();

  if (session) {
    redirect("/dashboard")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <SignIn />
    </main>
  );
}
