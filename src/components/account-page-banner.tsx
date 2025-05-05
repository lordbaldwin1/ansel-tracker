import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "./ui/card";
import type {
  PlaidAccount,
  PlaidItem,
  AccountBalance,
} from "~/server/db/schema";
import { PiggyBankIcon } from "lucide-react";
import { formatCurrency, formatDate } from "~/lib/utils";
import UpdateSingleBalanceButton from "~/components/single-balance-button";

type AccountInformation = PlaidAccount & {
  plaidItem: PlaidItem;
};

export function AccountPageBanner(props: {
  accountInformation: AccountInformation;
  balance: AccountBalance;
  userId: string;
}) {
  const { accountInformation, balance, userId } = props;

  return (
    <Card className="mb-6">
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {accountInformation.plaidItem.institutionLogo ? (
            <Image
              src={accountInformation.plaidItem.institutionLogo}
              alt={`Logo of ${accountInformation.plaidItem.institutionName}`}
              width={48}
              height={48}
              className="rounded-lg"
            />
          ) : (
            <PiggyBankIcon className="h-12 w-12 text-muted-foreground" />
          )}
          <div>
            <CardTitle className="text-xl">{accountInformation.name}</CardTitle>
            <CardDescription className="text-sm">
              {accountInformation.plaidItem.institutionName}
            </CardDescription>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 sm:gap-8">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Current Balance</span>
            <span className="text-xl font-semibold">
              {formatCurrency(balance.current)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Available</span>
            <span className="text-xl font-semibold">
              {formatCurrency(balance.available)}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t px-6 py-3">
        <span className="text-sm text-muted-foreground">
          Updated {formatDate(balance.date)}
        </span>
        <UpdateSingleBalanceButton
          plaidAccountId={balance.plaidAccountId}
          userId={userId}
        />
      </CardFooter>
    </Card>
  );
}
