"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

export const description = "An interactive area chart";

const chartData = [
  { date: "2024-04-01", expenses: 222, income: 150 },
  { date: "2024-04-02", expenses: 97, income: 180 },
  { date: "2024-04-03", expenses: 167, income: 120 },
  { date: "2024-04-04", expenses: 242, income: 260 },
  { date: "2024-04-05", expenses: 373, income: 290 },
  { date: "2024-04-06", expenses: 301, income: 340 },
  { date: "2024-04-07", expenses: 245, income: 180 },
  { date: "2024-04-08", expenses: 409, income: 320 },
  { date: "2024-04-09", expenses: 59, income: 110 },
  { date: "2024-04-10", expenses: 261, income: 190 },
  { date: "2024-04-11", expenses: 327, income: 350 },
  { date: "2024-04-12", expenses: 292, income: 210 },
  { date: "2024-04-13", expenses: 342, income: 380 },
  { date: "2024-04-14", expenses: 137, income: 220 },
  { date: "2024-04-15", expenses: 120, income: 170 },
  { date: "2024-04-16", expenses: 138, income: 190 },
  { date: "2024-04-17", expenses: 446, income: 360 },
  { date: "2024-04-18", expenses: 364, income: 410 },
  { date: "2024-04-19", expenses: 243, income: 180 },
  { date: "2024-04-20", expenses: 89, income: 150 },
  { date: "2024-04-21", expenses: 137, income: 200 },
  { date: "2024-04-22", expenses: 224, income: 170 },
  { date: "2024-04-23", expenses: 138, income: 230 },
  { date: "2024-04-24", expenses: 387, income: 290 },
  { date: "2024-04-25", expenses: 215, income: 250 },
  { date: "2024-04-26", expenses: 75, income: 130 },
  { date: "2024-04-27", expenses: 383, income: 420 },
  { date: "2024-04-28", expenses: 122, income: 180 },
  { date: "2024-04-29", expenses: 315, income: 240 },
  { date: "2024-04-30", expenses: 454, income: 380 },
  { date: "2024-05-01", expenses: 165, income: 220 },
  { date: "2024-05-02", expenses: 293, income: 310 },
  { date: "2024-05-03", expenses: 247, income: 190 },
  { date: "2024-05-04", expenses: 385, income: 420 },
  { date: "2024-05-05", expenses: 481, income: 390 },
  { date: "2024-05-06", expenses: 498, income: 520 },
  { date: "2024-05-07", expenses: 388, income: 300 },
  { date: "2024-05-08", expenses: 149, income: 210 },
  { date: "2024-05-09", expenses: 227, income: 180 },
  { date: "2024-05-10", expenses: 293, income: 330 },
  { date: "2024-05-11", expenses: 335, income: 270 },
  { date: "2024-05-12", expenses: 197, income: 240 },
  { date: "2024-05-13", expenses: 197, income: 160 },
  { date: "2024-05-14", expenses: 448, income: 490 },
  { date: "2024-05-15", expenses: 473, income: 380 },
  { date: "2024-05-16", expenses: 338, income: 400 },
  { date: "2024-05-17", expenses: 499, income: 420 },
  { date: "2024-05-18", expenses: 315, income: 350 },
  { date: "2024-05-19", expenses: 235, income: 180 },
  { date: "2024-05-20", expenses: 177, income: 230 },
  { date: "2024-05-21", expenses: 82, income: 140 },
  { date: "2024-05-22", expenses: 81, income: 120 },
  { date: "2024-05-23", expenses: 252, income: 290 },
  { date: "2024-05-24", expenses: 294, income: 220 },
  { date: "2024-05-25", expenses: 201, income: 250 },
  { date: "2024-05-26", expenses: 213, income: 170 },
  { date: "2024-05-27", expenses: 420, income: 460 },
  { date: "2024-05-28", expenses: 233, income: 190 },
  { date: "2024-05-29", expenses: 78, income: 130 },
  { date: "2024-05-30", expenses: 340, income: 280 },
  { date: "2024-05-31", expenses: 178, income: 230 },
  { date: "2024-06-01", expenses: 178, income: 200 },
  { date: "2024-06-02", expenses: 470, income: 410 },
  { date: "2024-06-03", expenses: 103, income: 160 },
  { date: "2024-06-04", expenses: 439, income: 380 },
  { date: "2024-06-05", expenses: 88, income: 140 },
  { date: "2024-06-06", expenses: 294, income: 250 },
  { date: "2024-06-07", expenses: 323, income: 370 },
  { date: "2024-06-08", expenses: 385, income: 320 },
  { date: "2024-06-09", expenses: 438, income: 480 },
  { date: "2024-06-10", expenses: 155, income: 200 },
  { date: "2024-06-11", expenses: 92, income: 150 },
  { date: "2024-06-12", expenses: 492, income: 420 },
  { date: "2024-06-13", expenses: 81, income: 130 },
  { date: "2024-06-14", expenses: 426, income: 380 },
  { date: "2024-06-15", expenses: 307, income: 350 },
  { date: "2024-06-16", expenses: 371, income: 310 },
  { date: "2024-06-17", expenses: 475, income: 520 },
  { date: "2024-06-18", expenses: 107, income: 170 },
  { date: "2024-06-19", expenses: 341, income: 290 },
  { date: "2024-06-20", expenses: 408, income: 450 },
  { date: "2024-06-21", expenses: 169, income: 210 },
  { date: "2024-06-22", expenses: 317, income: 270 },
  { date: "2024-06-23", expenses: 480, income: 530 },
  { date: "2024-06-24", expenses: 132, income: 180 },
  { date: "2024-06-25", expenses: 141, income: 190 },
  { date: "2024-06-26", expenses: 434, income: 380 },
  { date: "2024-06-27", expenses: 448, income: 490 },
  { date: "2024-06-28", expenses: 149, income: 200 },
  { date: "2024-06-29", expenses: 103, income: 160 },
  { date: "2024-06-30", expenses: 446, income: 400 },
];

const chartConfig = {
  statistics: {
    label: "Statistics",
  },
  income: {
    label: "Total Income",
    color: "#2563eb",
  },
  expenses: {
    label: "Total Expenses",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Income vs Expenses</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-expenses)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-expenses)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-income)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-income)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              dataKey="income"
              type="natural"
              fill="url(#fillIncome)"
              stroke="var(--color-income)"
              stackId="a"
            />
            <Area
              dataKey="expenses"
              type="natural"
              fill="url(#fillExpenses)"
              stroke="var(--color-expenses)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
