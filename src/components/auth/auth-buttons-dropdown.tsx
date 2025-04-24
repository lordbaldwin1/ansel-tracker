"use client";

import { User } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import SignoutButton from "./signout-button";
import Image from "next/image";
import type { Session } from "~/lib/auth/auth-client";

export default function AuthButtonsDropdown(props: { session: Session | null, isPending: boolean }) {
  const { session, isPending } = props;
  if (isPending) return <div>Loading...</div>;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {session?.user?.image ? (
          <Image
            src={session.user.image}
            className="rounded-full hover:opacity-80"
            alt="User options"
            width={24}
            height={24}
          />
        ) : (
          <Button variant="ghost" size="icon">
            <User className="h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="flex flex-col items-center justify-center">
        {session ? (
          <>
            <DropdownMenuLabel className="border-b border-border">
              <p className="text-md font-normal">{session.user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuItem className="w-full flex justify-center mt-1">
              <SignoutButton />
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuLabel className="border-b border-border">
              <p className="text-md font-normal">You are not signed in. ☹️</p>
            </DropdownMenuLabel>
            <DropdownMenuItem className="w-full flex justify-center mt-1">
              <Link href="/sign-in">
                Sign In
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
