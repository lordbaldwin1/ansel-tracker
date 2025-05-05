import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import AuthButtonsDropdown from "./auth/auth-buttons-dropdown";
import { authClient } from "~/lib/auth/auth-client";

export default function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link 
          prefetch={true} 
          className="flex items-center gap-2 text-xl font-bold transition-colors hover:text-primary" 
          href="/"
        >
          💰 Ansel Tracker 🗡️
        </Link>

        <div className="flex items-center gap-4">
          <ModeToggle />
          <AuthButtonsDropdown session={session} isPending={isPending} />
        </div>
      </div>
    </nav>
  );
}
