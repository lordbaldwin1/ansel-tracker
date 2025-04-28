import { plaidClient } from "~/lib/plaid";
import { NextResponse } from "next/server";
import { CountryCode, Products } from "plaid";

export async function POST(req: Request) {
  const { client_user_id } = (await req.json()) as { client_user_id: string };
  try {
    const request = {
      user: {
        client_user_id,
      },
      client_name: "Ansel Tracker",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
      transactions: {
        days_requested: 730, // 2 years
      },
    };

    const response = await plaidClient.linkTokenCreate(request);
    return NextResponse.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error("Error creating link token", error);
    return NextResponse.json({ error: "Failed to create link token" }, { status: 500 });
  }
}
