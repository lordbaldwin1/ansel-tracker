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
import { useMediaQuery } from "~/hooks/use-media-query";

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

type ChartSizeConfig = {
  innerRadius: number;
  outerRadius: number;
  strokeWidth: number;
  maxHeight: number;
  textSize: string;
  totalTextSize: string;
  legendGap: number;
};

const sizeConfig: Record<string, ChartSizeConfig> = {
  mobile: {
    innerRadius: 40,
    outerRadius: 60,
    strokeWidth: 2,
    maxHeight: 200,
    textSize: "text-lg",
    totalTextSize: "text-sm",
    legendGap: 2,
  },
  tablet: {
    innerRadius: 60,
    outerRadius: 80,
    strokeWidth: 3,
    maxHeight: 250,
    textSize: "text-xl",
    totalTextSize: "text-base",
    legendGap: 4,
  },
  desktop: {
    innerRadius: 100,
    outerRadius: 120,
    strokeWidth: 5,
    maxHeight: 325,
    textSize: "text-2xl",
    totalTextSize: "text-xl",
    legendGap: 8,
  },
};

const CategoryPieChart = (props: {
  pieData: PieData[];
  timeRange: string;
}) => {
  const totalAmount = props.pieData.reduce((acc, item) => acc + item.amount, 0);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  const currentConfig = (() => {
    if (isMobile) return sizeConfig.mobile;
    if (isTablet) return sizeConfig.tablet;
    return sizeConfig.desktop;
  })()!;

  return (
    <Card className="flex flex-col justify-center w-full">
      <CardHeader className="items-center pb-0">
        <CardTitle className={currentConfig.textSize}>{props.timeRange}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className={`mx-auto aspect-square max-h-[${currentConfig.maxHeight}px]`}
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <ChartLegend
              content={
                <ChartLegendContent
                  className={`flex flex-wrap justify-center gap-x-${currentConfig.legendGap} gap-y-2 text-xs sm:text-sm`}
                />
              }
            />
            <Pie
              data={props.pieData}
              dataKey="amount"
              nameKey="category"
              innerRadius={currentConfig.innerRadius}
              outerRadius={currentConfig.outerRadius}
              paddingAngle={2}
              strokeWidth={currentConfig.strokeWidth}
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
                          className={`fill-foreground ${currentConfig.totalTextSize} font-bold`}
                        >
                          ${totalAmount.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + (isMobile ? 16 : 24)}
                          className="fill-muted-foreground text-xs sm:text-sm"
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
      <CardFooter className="flex-col gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
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

  return <CategoryPieChart pieData={pieData} timeRange="All time" />;
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

  return <CategoryPieChart pieData={pieData} timeRange="Last 30 days" />;
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

  return <CategoryPieChart pieData={pieData} timeRange="Last 7 days" />;
};

// TODO: Maybe make a time frame selector!!!
export const CategoryBreakdownCard = (props: {
  chartData: Transaction[];
}) => {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions by Category</CardTitle>
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
