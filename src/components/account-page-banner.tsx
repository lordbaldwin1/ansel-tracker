import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import type { PlaidAccount, PlaidItem } from "~/server/db/schema";
import { PiggyBankIcon } from "lucide-react";

type AccountInformation = PlaidAccount & {
  plaidItem: PlaidItem;
};

export function AccountPageBanner(props: {
  accountInformation: AccountInformation;
}) {
  const { accountInformation } = props;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        {accountInformation.plaidItem.institutionLogo ? (
          <Image
            src={accountInformation.plaidItem.institutionLogo}
            alt={`Logo of ${accountInformation.plaidItem.institutionName}`}
            width={60}
            height={60}
          ></Image>
        ) : (
          <PiggyBankIcon className="h-10 w-10" />
        )}
        <CardTitle>{accountInformation.name}</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
          <CardFooter>
            <p>Card Footer</p>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
          <CardFooter>
            <p>Card Footer</p>
          </CardFooter>
        </Card>
      </CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
  );
}
