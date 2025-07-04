"use client";

import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { ArrowDownIcon, ArrowUpIcon, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { getRecentTransactions, type RecentTransaction } from "@/lib/api";

export function RecentTransactionsTable() {
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await getRecentTransactions(10);
        setTransactions(data);
      } catch (error) {
        console.error("Failed to fetch recent transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTransactionIcon = (type: string) => {
    if (type === "income") {
      return <ArrowUpIcon className="h-4 w-4 text-green-600" />;
    }
    return <ArrowDownIcon className="h-4 w-4 text-red-600" />;
  };

  const getTransactionBadge = (type: string) => {
    if (type === "income") {
      return (
        <Badge
          variant="outline"
          className="text-green-600 border-green-200 bg-green-50"
        >
          Income
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="text-red-600 border-red-200 bg-red-50"
      >
        Expense
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Loading transactions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-3 rounded-lg"
              >
                <div className="animate-pulse bg-gray-200 h-8 w-8 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-3 w-24 rounded"></div>
                </div>
                <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>No recent transactions found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No transactions available</p>
            <p className="text-sm">Start tracking your income and expenses</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest financial activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-3 py-2 text-sm font-medium text-muted-foreground border-b">
            <div className="col-span-1"></div>
            <div className="col-span-4">Description</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-1 text-right">Amount</div>
          </div>

          {/* Table Body */}
          <div className="space-y-1">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="grid grid-cols-12 gap-4 items-center p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* Icon */}
                <div className="col-span-1 flex justify-center">
                  {getTransactionIcon(transaction.type)}
                </div>

                {/* Description */}
                <div className="col-span-4">
                  <div className="font-medium text-sm truncate">
                    {transaction.description || "No description"}
                  </div>
                </div>

                {/* Category */}
                <div className="col-span-2">
                  <span className="text-sm text-muted-foreground capitalize">
                    {transaction.category || "Uncategorized"}
                  </span>
                </div>

                {/* Type Badge */}
                <div className="col-span-2">
                  {getTransactionBadge(transaction.type)}
                </div>

                {/* Date */}
                <div className="col-span-2">
                  <span className="text-sm text-muted-foreground">
                    {formatDate(transaction.date)}
                  </span>
                </div>

                {/* Amount */}
                <div className="col-span-1 text-right">
                  <span
                    className={`font-semibold text-sm ${
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* View All Link */}
          <div className="pt-4 border-t">
            <button className="text-sm text-primary hover:underline font-medium">
              View all transactions →
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
