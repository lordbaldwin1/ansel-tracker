import type { PlaidInformation } from "~/lib/types";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Image from "next/image";
import { formatCurrency, formatDate } from "~/lib/utils";
import { PiggyBank, LinkIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export default function AccountSummary(props: {
  recentPlaidItems: PlaidInformation[];
}) {
  const { recentPlaidItems } = props;

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle className="mb-4 text-2xl font-semibold">
            Accounts
          </CardTitle>
          <CardDescription>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {recentPlaidItems.map((item) => (
                <Card key={item.account_balance?.id} className="w-full">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {item.plaid_item.institutionLogo ? (
                        <Image
                          src={item.plaid_item.institutionLogo}
                          alt={
                            item.plaid_item.institutionName ??
                            "Institution Logo"
                          }
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <PiggyBank className="h-32px w-32pxtext-muted-foreground" />
                      )}
                      <CardTitle className="text-xl">
                        {item.plaid_item.institutionName}
                      </CardTitle>
                    </div>
                    <CardDescription className="mt-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-foreground font-medium">
                          {item.plaid_account?.name}
                        </span>
                        <div className="flex flex-row items-center justify-between gap-1">
                          <span className="text-lg font-semibold text-green-700">
                            {formatCurrency(item.account_balance?.current ?? 0)}
                          </span>
                          <span className="text-sm">
                            Available:{" "}
                            {formatCurrency(
                              item.account_balance?.available ?? 0,
                            )}
                          </span>
                        </div>
                        <span className="text-sm">
                          {item.account_balance?.date
                            ? formatDate(item.account_balance.date)
                            : "No date"}
                        </span>
                        <Link
                          className="mt-4 w-full"
                          href={`/account/${item.plaid_account?.id}`}
                          prefetch={true}
                        >
                          <Button variant="outline" className="w-full">
                            <LinkIcon className="h-4 w-4" />
                            View Account
                          </Button>
                        </Link>
                      </div>
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
