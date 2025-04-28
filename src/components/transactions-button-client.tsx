'use client';

import { useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";

export interface ApiResponse {
  success: boolean;
  message: string;
  error?: string;
  numTransactions?: number;
}

export function TransactionsButtonClient({ action }: { action: () => Promise<ApiResponse> }) {
  const [isPending, setIsPending] = useState(false);
  const handleSubmit = async () => {
    setIsPending(true);
    try {
      const response = await action();
      if (response.success) {
        toast.success(response.message, {
          description: `${response.numTransactions} transactions fetched successfully`,
        });
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button onClick={handleSubmit} disabled={isPending}>
      {isPending ? "Fetching..." : "Get Transactions"}
    </Button>
  );
} 