import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

import { env } from "~/env";

if (!env.PLAID_CLIENT_ID || !env.PLAID_SECRET) {
  throw new Error("PLAID_CLIENT_ID and PLAID_SECRET must be set");
}

const configuration = new Configuration({
  basePath: PlaidEnvironments[env.PLAID_ENV as keyof typeof PlaidEnvironments] ?? "sandbox",
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": env.PLAID_CLIENT_ID,
      "PLAID-SECRET": env.PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);


