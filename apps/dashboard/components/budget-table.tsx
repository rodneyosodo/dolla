"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  AlertTriangle,
  CheckCircle,
  Edit,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  calculateBudgetProgress,
  deleteBudget,
  getBudgetSummary,
  getBudgets,
} from "@/lib/api";
import { Budget, BudgetSummary } from "@/types/schema";

interface BudgetTableProps {
  month: string;
  onBudgetDeleted?: () => void;
}

export function BudgetTable({ month, onBudgetDeleted }: BudgetTableProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await getBudgets(month);
      setBudgets(response.budgets);

      // Also fetch summary
      try {
        const summaryData = await getBudgetSummary(month);
        setSummary(summaryData);
      } catch (error) {
        console.log("No summary available for this month");
        setSummary(null);
      }
    } catch (error) {
      toast("Failed to fetch budgets", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while fetching budgets.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateProgress = async () => {
    setCalculating(true);
    try {
      await calculateBudgetProgress(month);
      toast("Budget progress updated", {
        description: "Budget spending calculations have been refreshed.",
      });
      fetchBudgets(); // Refresh data
    } catch (error) {
      toast("Calculation failed", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while calculating budget progress.",
      });
    } finally {
      setCalculating(false);
    }
  };

  const handleDeleteBudget = async (id: string, category: string) => {
    try {
      await deleteBudget(id);
      toast("Budget deleted", {
        description: `Budget for ${category} has been deleted.`,
      });
      fetchBudgets();
      onBudgetDeleted?.();
    } catch (error) {
      toast("Delete failed", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while deleting the budget.",
      });
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [month]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  const getStatusBadge = (budget: Budget) => {
    if (budget.isOverspent) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Overspent
        </Badge>
      );
    } else if (budget.percentageUsed >= 80) {
      return (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 bg-yellow-100 text-yellow-800"
        >
          <AlertTriangle className="h-3 w-3" />
          Warning
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 bg-green-100 text-green-800"
        >
          <CheckCircle className="h-3 w-3" />
          On Track
        </Badge>
      );
    }
  };

  const getProgressColor = (percentage: number, isOverspent: boolean) => {
    if (isOverspent) return "bg-red-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading budgets...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Budget</p>
            <p className="text-2xl font-bold">
              {formatCurrency(summary.totalBudget)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="text-2xl font-bold">
              {formatCurrency(summary.totalSpent)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className="text-2xl font-bold">
              {formatCurrency(summary.totalRemaining)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Progress</p>
            <p className="text-2xl font-bold">
              {summary.overallPercentageUsed.toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div>
          {summary && summary.categoriesOverspent > 0 && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {summary.categoriesOverspent} categor
                {summary.categoriesOverspent === 1 ? "y" : "ies"} overspent
              </span>
            </div>
          )}
        </div>
        <Button
          onClick={handleCalculateProgress}
          disabled={calculating}
          variant="outline"
          size="sm"
        >
          {calculating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Progress
            </>
          )}
        </Button>
      </div>

      {/* Budget Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Spent</TableHead>
              <TableHead>Remaining</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {budgets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-muted-foreground">
                    No budgets found for {month}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create your first budget to start tracking spending
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              budgets.map((budget) => (
                <TableRow key={budget.id}>
                  <TableCell className="font-medium">
                    {budget.category}
                  </TableCell>
                  <TableCell>{formatCurrency(budget.budgetAmount)}</TableCell>
                  <TableCell>{formatCurrency(budget.spentAmount)}</TableCell>
                  <TableCell>
                    {formatCurrency(budget.remainingAmount)}
                  </TableCell>
                  <TableCell className="w-[200px]">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{budget.percentageUsed.toFixed(1)}%</span>
                        <span className="text-muted-foreground">
                          {budget.isOverspent ? "Over" : "Used"}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(budget.percentageUsed, 100)}
                        className="h-2"
                        style={
                          {
                            "--progress-background": getProgressColor(
                              budget.percentageUsed,
                              budget.isOverspent,
                            ),
                          } as React.CSSProperties
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(budget)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDeleteBudget(budget.id, budget.category)
                        }
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
