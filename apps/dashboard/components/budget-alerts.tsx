"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { AlertTriangle, Info, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { getBudgetSummary, getBudgets } from "@/lib/api";
import { Budget, BudgetSummary } from "@/types/schema";

interface BudgetAlertsProps {
  month: string;
}

export function BudgetAlerts({ month }: BudgetAlertsProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [budgetsResponse, summaryData] = await Promise.allSettled([
        getBudgets(month),
        getBudgetSummary(month),
      ]);

      if (budgetsResponse.status === "fulfilled") {
        setBudgets(budgetsResponse.value.budgets);
      } else {
        console.error("Failed to fetch budgets:", budgetsResponse.reason);
      }

      if (summaryData.status === "fulfilled") {
        setSummary(summaryData.value);
      } else {
        console.error("Failed to fetch budget summary:", summaryData.reason);
      }

      setLoading(false);
    };

    fetchData();
  }, [month]);

  if (loading || !summary) {
    return null;
  }

  const overspentBudgets = budgets.filter((b) => b.isOverspent);
  const warningBudgets = budgets.filter(
    (b) => !b.isOverspent && b.percentageUsed >= 80,
  );
  const highSpendingBudgets = budgets.filter(
    (b) => !b.isOverspent && b.percentageUsed >= 60 && b.percentageUsed < 80,
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Overspending Alerts */}
      {overspentBudgets.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Budget Overspent!</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1">
              {overspentBudgets.map((budget) => (
                <div
                  key={budget.id}
                  className="flex justify-between items-center"
                >
                  <span className="font-medium">{budget.category}</span>
                  <span>
                    {formatCurrency(budget.spentAmount)} /{" "}
                    {formatCurrency(budget.budgetAmount)}
                    <span className="ml-1 text-red-600 font-semibold">
                      (+{formatCurrency(Math.abs(budget.remainingAmount))})
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Warning Alerts */}
      {warningBudgets.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Budget Warning</AlertTitle>
          <AlertDescription className="text-yellow-700">
            <div className="mt-2 space-y-1">
              <p>You're close to exceeding your budget in:</p>
              {warningBudgets.map((budget) => (
                <div
                  key={budget.id}
                  className="flex justify-between items-center"
                >
                  <span className="font-medium">{budget.category}</span>
                  <span>
                    {budget.percentageUsed.toFixed(1)}% used
                    <span className="ml-1">
                      ({formatCurrency(budget.remainingAmount)} remaining)
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* High Spending Info */}
      {highSpendingBudgets.length > 0 &&
        overspentBudgets.length === 0 &&
        warningBudgets.length === 0 && (
          <Alert className="border-blue-200 bg-blue-50">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Spending Update</AlertTitle>
            <AlertDescription className="text-blue-700">
              <div className="mt-2 space-y-1">
                <p>You're making good progress on your budgets:</p>
                {highSpendingBudgets.slice(0, 3).map((budget) => (
                  <div
                    key={budget.id}
                    className="flex justify-between items-center"
                  >
                    <span className="font-medium">{budget.category}</span>
                    <span>{budget.percentageUsed.toFixed(1)}% used</span>
                  </div>
                ))}
                {highSpendingBudgets.length > 3 && (
                  <p className="text-sm">
                    +{highSpendingBudgets.length - 3} more categories
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

      {/* Overall Summary Alert */}
      {summary.overallPercentageUsed > 0 &&
        overspentBudgets.length === 0 &&
        warningBudgets.length === 0 &&
        highSpendingBudgets.length === 0 && (
          <Alert className="border-green-200 bg-green-50">
            <Info className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Budget Status</AlertTitle>
            <AlertDescription className="text-green-700">
              You've used {summary.overallPercentageUsed.toFixed(1)}% of your
              total budget for {month}. You have{" "}
              {formatCurrency(summary.totalRemaining)} remaining across all
              categories.
            </AlertDescription>
          </Alert>
        )}
    </div>
  );
}
