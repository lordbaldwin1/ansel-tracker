import type { PlaidAccount, AccountBalance, PlaidItem } from "~/server/db/schema";


export type PlaidInformation = {
  plaid_item: PlaidItem;
  plaid_account: PlaidAccount | null;
  account_balance: AccountBalance | null;
}

export type HierarchicalPlaidItem = {
  id: string;
  itemId: string;
  institutionId: string;
  institutionName: string | null;
  institutionLogo: string | null;
  accounts: Array<{
    id: string;
    plaidId: string;
    name: string;
    nickname: string | null;
    type: string;
    subtype: string | null;
    mask: string | null;
    balances: Array<{
      id: string;
      current: number;
      available: number;
      limit: number | null;
      date: Date;
    }>;
  }>;
};