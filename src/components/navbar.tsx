"use client";

import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import AuthButtonsDropdown from "./auth/auth-buttons-dropdown";

export default function Navbar() {
  // TODO: Add hamburger menu
  return (
    <div className="my-4 w-full">
      <div className="mx-4 flex items-center justify-between lg:mx-24">
        <div className="items-baseline justify-center gap-8 md:flex lg:flex">
          <Link prefetch={true} className="text-2xl font-bold" href="/">
          💰 Ansel Tracker 🗡️
          </Link>
        </div>

        <div className="flex items-center justify-end gap-4">
          <ModeToggle />
          <AuthButtonsDropdown />
        </div>
      </div>
    </div>
  );
}
