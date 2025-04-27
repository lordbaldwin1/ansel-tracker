import { Card, CardTitle, CardDescription, CardHeader } from "./ui/card";
import { formatCurrency } from "~/lib/utils";


export default function DashboardSummary(props: {
  totalBalance: number;
  totalAvailableBalance: number;
}
) {
  const { totalBalance, totalAvailableBalance } = props;
  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Total Balance</CardTitle>
            <CardDescription className="text-2xl font-semibold text-green-700">{formatCurrency(totalBalance)}</CardDescription>
          </CardHeader>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Total Available Balance</CardTitle>
            <CardDescription className="text-2xl font-semibold text-green-700">{formatCurrency(totalAvailableBalance)}</CardDescription>
          </CardHeader>
        </Card>
      </div>
  )
}