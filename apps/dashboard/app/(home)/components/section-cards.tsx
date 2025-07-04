"use client";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { useEffect, useState } from "react";
import { type DashboardTotals, getDashboardTotals } from "@/lib/api";

interface CardData {
  description: string;
  title: string;
  trendingPercent: number;
}

export function SectionCards() {
  const [dashboardTotals, setDashboardTotals] =
    useState<DashboardTotals | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardTotals = async () => {
      try {
        setLoading(true);
        const totals = await getDashboardTotals();
        setDashboardTotals(totals);
      } catch (error) {
        console.error("Failed to fetch dashboard totals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardTotals();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return Math.abs(percent).toFixed(1);
  };

  if (loading) {
    return (
      <div className="*:data-[slot=card]:from-primary/7 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="@container/card">
            <CardHeader>
              <CardDescription className="animate-pulse bg-gray-200 h-4 w-20 rounded"></CardDescription>
              <CardTitle className="animate-pulse bg-gray-200 h-8 w-24 rounded"></CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (!dashboardTotals) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
      </div>
    );
  }

  const data: CardData[] = [
    {
      description: "Total Balance",
      title: formatCurrency(dashboardTotals.totalBalance),
      trendingPercent: dashboardTotals.balanceChangePercent,
    },
    {
      description: "Total Income",
      title: formatCurrency(dashboardTotals.totalIncome),
      trendingPercent: dashboardTotals.incomeChangePercent,
    },
    {
      description: "Total Expenses",
      title: formatCurrency(dashboardTotals.totalExpenses),
      trendingPercent: dashboardTotals.expenseChangePercent,
    },
    {
      description: "Total Savings",
      title: formatCurrency(dashboardTotals.totalSavings),
      trendingPercent: dashboardTotals.savingsChangePercent,
    },
  ];

  return (
    <div className="*:data-[slot=card]:from-primary/7 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {data.map((item, index) => (
        <Card key={index} className="@container/card">
          <CardHeader>
            <CardDescription>{item.description}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-2xl">
              {item.title}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {item.trendingPercent > 0 && (
                  <IconTrendingUp className="text-green-600" />
                )}
                {item.trendingPercent < 0 && (
                  <IconTrendingDown className="text-red-600" />
                )}

                {item.trendingPercent > 0 &&
                  `+${formatPercent(item.trendingPercent)}%`}
                {item.trendingPercent < 0 &&
                  `-${formatPercent(item.trendingPercent)}%`}
                {item.trendingPercent === 0 && "no change"}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {item.trendingPercent > 0 &&
                `Trending up this month by ${formatPercent(item.trendingPercent)}%`}
              {item.trendingPercent < 0 &&
                `Trending down this month by ${formatPercent(item.trendingPercent)}%`}
              {item.trendingPercent === 0 && "No change this month"}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
