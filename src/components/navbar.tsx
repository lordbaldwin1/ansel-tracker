"use client";

import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import AuthButtonsDropdown from "./auth/auth-buttons-dropdown";
import { authClient } from "~/lib/auth/auth-client";
import PlaidLinkButton from "./plaid-link-button";
import UpdateBalancesButton from "./update-balances-button";
import { Button } from "./ui/button";
import { Suspense } from "react";

export default function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  return (
    <div className="my-4 w-full">
      <div className="mx-4 flex items-center justify-between lg:mx-24">
        <div className="items-baseline justify-center gap-8 md:flex lg:flex">
          <Link prefetch={true} className="text-2xl font-bold" href="/">
            💰 Ansel Tracker 🗡️
          </Link>
          {session?.user.id ? (
            <>
              <Suspense fallback={<Button variant="default">Loading...</Button>}>
                <PlaidLinkButton userId={session.user.id} />
              </Suspense>
              <Suspense fallback={<Button variant="default">Loading...</Button>}>
                <UpdateBalancesButton userId={session.user.id} />
              </Suspense>
            </>
          ) : (
            <Link className="text-muted-foreground" href="/sign-in">
              <Button className="hover:cursor-pointer" variant="outline">
                {isPending ? "Loading..." : "Sign in to link your bank"}
              </Button>
            </Link>
          )}
        </div>

        <div className="flex items-center justify-end gap-4">
          <ModeToggle />
          <AuthButtonsDropdown session={session} isPending={isPending} />
        </div>
      </div>
    </div>
  );
}
