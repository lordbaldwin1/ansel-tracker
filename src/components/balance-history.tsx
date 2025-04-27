import type { HierarchicalPlaidItem } from "~/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { formatDate, formatCurrency } from "~/lib/utils";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { PiggyBank } from "lucide-react";

export default function BalanceHistory(props: {
  balanceHistory: HierarchicalPlaidItem[];
}) {
  const { balanceHistory } = props;

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Balance History</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion
            type="multiple"
            className="rounded-lg border px-4"
          >
            {balanceHistory.map((item) => (
              <AccordionItem key={String(item.id)} value={String(item.id)}>
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    {item.institutionLogo ? (
                      <Image
                        src={item.institutionLogo}
                        alt={item.institutionName ?? "Institution Logo"}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <PiggyBank className="h-32px w-32pxtext-muted-foreground mr-2" />
                    )}
                    <h2 className="text-xl">
                      {item.institutionName}
                    </h2>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-2">
                  <Accordion
                    type="multiple"
                    className="space-y-2 rounded-lg border px-4"
                  >
                    {item.accounts.map((account) => (
                      <AccordionItem
                        key={String(account.id)}
                        value={String(account.id)}
                      >
                        <AccordionTrigger>
                          <div className="flex w-full items-center justify-between">
                            <span className="text-lg">{account.name}</span>
                            {account.balances[0] && (
                              <span className="text-lg font-semibold text-green-700">
                                {formatCurrency(account.balances[0].current)}
                              </span>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 mx-8 border rounded-lg p-4">
                            {account.balances.map((balance) => (
                              <div
                                key={String(balance.id)}
                                className="flex items-center justify-between border-b pb-2 last:border-0"
                              >
                                <div className="flex flex-col">
                                  <span className="text-muted-foreground text-sm">
                                    {formatDate(balance.date)}
                                  </span>
                                  <span className="text-sm">
                                    Available:{" "}
                                    {formatCurrency(balance.available)}
                                  </span>
                                </div>
                                <span className="font-semibold">
                                  {formatCurrency(balance.current)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
