"use client";

import {
  IconTrendingDown,
  IconTrendingUp,
  IconWallet,
} from "@tabler/icons-react";
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
import { getAccounts } from "@/lib/api";
import { type Account } from "@/types/schema";

interface AccountSummaryData {
  totalAccounts: number;
  totalBalance: number;
  accountsWithPositiveBalance: number;
  accountsWithNegativeBalance: number;
  highestBalance: number;
  lowestBalance: number;
  accounts: Account[];
}

export function AccountsSummary() {
  const [accountsSummary, setAccountsSummary] =
    useState<AccountSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccountsSummary = async () => {
      try {
        setLoading(true);
        const response = await getAccounts(0, 1000); // Get all accounts
        const accounts = response.accounts;

        if (accounts.length === 0) {
          setAccountsSummary({
            totalAccounts: 0,
            totalBalance: 0,
            accountsWithPositiveBalance: 0,
            accountsWithNegativeBalance: 0,
            highestBalance: 0,
            lowestBalance: 0,
            accounts: [],
          });
          return;
        }

        const totalBalance = accounts.reduce(
          (sum, account) => sum + account.balance,
          0,
        );
        const accountsWithPositiveBalance = accounts.filter(
          (account) => account.balance > 0,
        ).length;
        const accountsWithNegativeBalance = accounts.filter(
          (account) => account.balance < 0,
        ).length;
        const balances = accounts.map((account) => account.balance);
        const highestBalance = Math.max(...balances);
        const lowestBalance = Math.min(...balances);

        setAccountsSummary({
          totalAccounts: accounts.length,
          totalBalance,
          accountsWithPositiveBalance,
          accountsWithNegativeBalance,
          highestBalance,
          lowestBalance,
          accounts,
        });
      } catch (error) {
        console.error("Failed to fetch accounts summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountsSummary();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="px-4 lg:px-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Accounts Summary</h2>
          <p className="text-sm text-muted-foreground">
            Overview of all your accounts
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="@container/card">
              <CardHeader>
                <CardDescription className="animate-pulse bg-gray-200 h-4 w-20 rounded"></CardDescription>
                <CardTitle className="animate-pulse bg-gray-200 h-8 w-24 rounded"></CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!accountsSummary) {
    return (
      <div className="px-4 lg:px-6">
        <div className="text-center p-8">
          <p className="text-muted-foreground">Failed to load accounts data</p>
        </div>
      </div>
    );
  }

  if (accountsSummary.totalAccounts === 0) {
    return (
      <div className="px-4 lg:px-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Accounts Summary</h2>
          <p className="text-sm text-muted-foreground">
            Overview of all your accounts
          </p>
        </div>
        <Card className="text-center p-8">
          <CardHeader>
            <IconWallet className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle className="mt-4">No Accounts Found</CardTitle>
            <CardDescription>
              You haven't created any accounts yet. Start by creating your first
              account to track your finances.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const summaryCards = [
    {
      description: "Total Accounts",
      title: accountsSummary.totalAccounts.toString(),
      subtitle: "Active accounts",
      icon: <IconWallet className="h-4 w-4" />,
    },
    {
      description: "Combined Balance",
      title: formatCurrency(accountsSummary.totalBalance),
      subtitle: "Across all accounts",
      trend:
        accountsSummary.totalBalance > 0
          ? "positive"
          : accountsSummary.totalBalance < 0
            ? "negative"
            : "neutral",
    },
    {
      description: "Positive Balance",
      title: accountsSummary.accountsWithPositiveBalance.toString(),
      subtitle: "Accounts with funds",
      trend:
        accountsSummary.accountsWithPositiveBalance > 0
          ? "positive"
          : "neutral",
    },
    {
      description: "Negative Balance",
      title: accountsSummary.accountsWithNegativeBalance.toString(),
      subtitle: "Accounts in deficit",
      trend:
        accountsSummary.accountsWithNegativeBalance > 0
          ? "negative"
          : "neutral",
    },
  ];

  const topAccounts = accountsSummary.accounts
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 3);

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Accounts Summary</h2>
        <p className="text-sm text-muted-foreground">
          Overview of all your accounts
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {summaryCards.map((item, index) => (
          <Card key={index} className="@container/card">
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                {item.icon}
                {item.description}
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {item.title}
              </CardTitle>
              {item.trend && (
                <CardAction>
                  <Badge variant="outline">
                    {item.trend === "positive" && (
                      <IconTrendingUp className="text-green-600" />
                    )}
                    {item.trend === "negative" && (
                      <IconTrendingDown className="text-red-600" />
                    )}
                    {item.trend === "positive" && "Healthy"}
                    {item.trend === "negative" && "Attention needed"}
                    {item.trend === "neutral" && "Balanced"}
                  </Badge>
                </CardAction>
              )}
            </CardHeader>
            <CardFooter>
              <div className="text-sm text-muted-foreground">
                {item.subtitle}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Top Accounts */}
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
        <Card className="@5xl/main:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Top Accounts by Balance</CardTitle>
            <CardDescription>
              Your accounts with the highest balances
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-0">
            <div className="w-full space-y-3">
              {topAccounts.map((account, index) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{account.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {account.accountType} • {account.currency}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-semibold ${account.balance >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {formatCurrency(account.balance)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {account.description || "No description"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
