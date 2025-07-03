"use client";

import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { SidebarInset } from "@workspace/ui/components/sidebar";
import { useCallback, useState } from "react";
import { BudgetAlerts } from "@/components/budget-alerts";
import { BudgetTable } from "@/components/budget-table";
import { CreateBudgetDialog } from "@/components/create-budget-dialog";
import NavHeader from "@/components/nav-header";

export default function Page() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return new Date().toISOString().slice(0, 7); // Current month in YYYY-MM format
  });

  const handleBudgetChanged = useCallback(() => {
    // This will be called when budgets are created or deleted
    // The BudgetTable and BudgetAlerts components will refresh automatically
  }, []);

  return (
    <SidebarInset>
      <NavHeader parent={{ title: "Budget", url: "/budget" }} />
      <div className="flex flex-col gap-6 mx-auto p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Monthly Budget
            </h2>
            <p className="text-muted-foreground">
              Track your spending by category and get alerts when you're
              approaching your limits.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="month-select" className="text-sm font-medium">
                Month:
              </Label>
              <Input
                id="month-select"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-40"
              />
            </div>
            <CreateBudgetDialog onBudgetCreated={handleBudgetChanged} />
          </div>
        </div>

        <div className="px-4">
          <BudgetAlerts month={selectedMonth} />
        </div>

        <div className="px-4">
          <BudgetTable
            month={selectedMonth}
            onBudgetDeleted={handleBudgetChanged}
          />
        </div>
      </div>
    </SidebarInset>
  );
}
