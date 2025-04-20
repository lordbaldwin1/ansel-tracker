"use client";

import { useRouter } from "next/navigation";
import { authClient } from "~/lib/auth/auth-client";

export default function SignoutButton() {
	const router = useRouter();

	const handleSignOut = async () => {
		try {
			await authClient.signOut({
				fetchOptions: {
					onSuccess: () => {
						router.push("/");
						router.refresh();
					},
				},
			});
		} catch (error) {
			console.error("Error signing out:", error);
		}
	};

	return (
		<p 
			className="text-sm font-medium hover:text-red-500"
			onClick={handleSignOut}
		>
			Sign Out
		</p>
	);
}