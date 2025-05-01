"use client";

import { Label, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "./ui/chart";
import { type Transaction } from "~/server/db/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { TrendingUp } from "lucide-react";

const chartConfig = {
  INCOME: {
    label: "Income",
    color: "#22c55e", // green-500
  },
  TRANSFER_IN: {
    label: "Transfers In",
    color: "#3b82f6", // blue-500
  },
  TRANSFER_OUT: {
    label: "Transfers Out",
    color: "#6366f1", // indigo-500
  },
  LOAN_PAYMENTS: {
    label: "Loan Payments",
    color: "#f43f5e", // rose-500
  },
  BANK_FEES: {
    label: "Bank Fees",
    color: "#f97316", // orange-500
  },
  ENTERTAINMENT: {
    label: "Entertainment",
    color: "#ec4899", // pink-500
  },
  FOOD_AND_DRINK: {
    label: "Food & Drink",
    color: "#8b5cf6", // violet-500
  },
  GENERAL_MERCHANDISE: {
    label: "General Merchandise",
    color: "#0ea5e9", // sky-500
  },
  HOME_IMPROVEMENT: {
    label: "Home Improvement",
    color: "#10b981", // emerald-500
  },
  MEDICAL: {
    label: "Medical",
    color: "#ef4444", // red-500
  },
  PERSONAL_CARE: {
    label: "Personal Care",
    color: "#f59e0b", // amber-500
  },
  GENERAL_SERVICES: {
    label: "General Services",
    color: "#14b8a6", // teal-500
  },
  GOVERNMENT_AND_NON_PROFIT: {
    label: "Government & Non-Profit",
    color: "#64748b", // slate-500
  },
  TRANSPORTATION: {
    label: "Transportation",
    color: "#06b6d4", // cyan-500
  },
  TRAVEL: {
    label: "Travel",
    color: "#d946ef", // fuchsia-500
  },
  RENT_AND_UTILITIES: {
    label: "Rent & Utilities",
    color: "#84cc16", // lime-500
  },
} satisfies ChartConfig;

type PieData = {
  category: string;
  amount: number;
  fill: string;
};

const CategoryBreakdownChart = (props: {
  pieData: PieData[];
  timeRange: string;
}) => {
  const totalAmount = props.pieData.reduce((acc, item) => acc + item.amount, 0);

  return (
    <Card className="flex flex-col w-full md:w-[400px]">
      <CardHeader className="items-center pb-0">
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>{props.timeRange}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[325px]"
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <ChartLegend
              content={
                <ChartLegendContent className="flex flex-wrap justify-center gap-x-8 gap-y-2" />
              }
            />
            <Pie
              data={props.pieData}
              dataKey="amount"
              nameKey="category"
              innerRadius={100}
              outerRadius={120}
              paddingAngle={2}
              strokeWidth={5}
            >
              {props.pieData.map((entry, index) => (
                <Pie
                  key={`pie-${index}`}
                  data={[entry]}
                  dataKey="amount"
                  nameKey="category"
                  fill={entry.fill}
                />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          ${totalAmount.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          <TrendingUp className="h-4 w-4" />
          Spending Overview
        </div>
        <div className="text-muted-foreground leading-none">
          Showing spending distribution by category
        </div>
      </CardFooter>
    </Card>
  );
};

export const CategoryBreakdownChartAllTime = (props: {
  chartData: Transaction[];
}) => {
  const pieData = props.chartData.reduce<PieData[]>((acc, transaction) => {
    if (transaction.amount < 0) return acc;
    const category = transaction.personalFinanceCategory ?? "UNKNOWN";
    const amount = Math.abs(transaction.amount);

    const existingCategory = acc.find((item) => item.category === category);
    if (existingCategory) {
      existingCategory.amount += amount;
    } else {
      acc.push({
        category: category,
        amount: amount,
        fill: chartConfig[category as keyof typeof chartConfig]?.color ?? "#10293C",
      });
    }
    return acc;
  }, []);

  return <CategoryBreakdownChart pieData={pieData} timeRange="All time" />;
};

export const CategoryBreakdownChartLast30Days = (props: {
  chartData: Transaction[];
}) => {
  const pieData = props.chartData.reduce<PieData[]>((acc, transaction) => {
    if (transaction.amount < 0) return acc;
    const category = transaction.personalFinanceCategory ?? "UNKNOWN";
    const amount = Math.abs(transaction.amount);
    const date = new Date(transaction.date);
    const isWithinLast30Days =
      date.getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000;

    if (!isWithinLast30Days) return acc;

    const existingCategory = acc.find((item) => item.category === category);
    if (existingCategory) {
      existingCategory.amount += amount;
    } else {
      acc.push({
        category: category,
        amount: amount,
        fill: chartConfig[category as keyof typeof chartConfig]?.color ?? "#10293C",
      });
    }
    return acc;
  }, []);

  return <CategoryBreakdownChart pieData={pieData} timeRange="Last 30 days" />;
};

export const CategoryBreakdownChartLast7Days = (props: {
  chartData: Transaction[];
}) => {
  const pieData = props.chartData.reduce<PieData[]>((acc, transaction) => {
    if (transaction.amount < 0) return acc;
    const category = transaction.personalFinanceCategory ?? "UNKNOWN";
    const amount = Math.abs(transaction.amount);
    const date = new Date(transaction.date);
    const isWithinLast7Days =
      date.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;

    if (!isWithinLast7Days) return acc;

    const existingCategory = acc.find((item) => item.category === category);
    if (existingCategory) {
      existingCategory.amount += amount;
    } else {
      acc.push({
        category: category,
        amount: amount,
        fill: chartConfig[category as keyof typeof chartConfig]?.color ?? "#10293C",
      });
    }
    return acc;
  }, []);

  return <CategoryBreakdownChart pieData={pieData} timeRange="Last 7 days" />;
};

// TODO: Maybe make a time frame selector!!!
export const CategoryBreakdownCard = (props: {
  chartData: Transaction[];
}) => {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>View your spending patterns over different time periods</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-1 lg:grid-cols-2">
        <CategoryBreakdownChartAllTime chartData={props.chartData} />
        <CategoryBreakdownChartLast30Days chartData={props.chartData} />
        {/* <CategoryBreakdownChartLast7Days chartData={props.chartData} /> */}
      </CardContent>
    </Card>
  )
};
