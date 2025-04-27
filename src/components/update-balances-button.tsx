"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
type UpdateResponse = {
  success: boolean;
  message: string;
};

export default function UpdateBalancesButton({ userId }: { userId: string }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleUpdateBalances = async () => {
    setIsUpdating(true);

    try {
      const response = await fetch("/api/plaid/update-balances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = (await response.json()) as UpdateResponse;

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Please sign in to update balances");
          return;
        }
        throw new Error(data.message || "Failed to update balances");
      }

      if (data.success) {
        router.refresh();
        toast.success(data.message);
      } else {
        toast.error(data.message || "Failed to update balances");
      }
    } catch (error) {
      console.error("Error updating balances:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred while updating balances");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Button
      onClick={handleUpdateBalances}
      disabled={isUpdating}
      variant="outline"
    >
      {isUpdating ? "Updating..." : "Update Balances"}
    </Button>
  );
}
