"use client";

import { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { Button } from "./ui/button";

const PlaidLinkButton = ({ userId }: { userId: string }) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);

  // Create link token
  useEffect(() => {
    const createLinkToken = async () => {
      try {
        const response = await fetch("/api/plaid/create-link-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ client_user_id: userId }),
        });
        const data = (await response.json()) as { link_token: string };
        setLinkToken(data.link_token);
      } catch (error) {
        console.error("Error creating link token", error);
      }
    };
    void createLinkToken();
  }, [userId]);

  // Exchange public token for access token and save to db
  const onSuccess = (public_token: string) => {
    void (async () => {
      try {
        const response = await fetch("/api/plaid/exchange-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ public_token, userId }),
        });
        const data = (await response.json()) as { access_token: string };
        console.log("Access Token:", data.access_token);
      } catch (error) {
        console.error("Error exchanging public token:", error);
      }
    })();
  };

  const { open, ready } = usePlaidLink({
    token: linkToken!,
    onSuccess,
  });

  return (
    <div>
      {linkToken && (
        <Button
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            (open as unknown as () => void)();
          }}
          disabled={!ready}
        >
          Link Account
        </Button>
      )}
    </div>
  );
};

export default PlaidLinkButton;
