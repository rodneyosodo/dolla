"use client";

import { Row } from "@tanstack/react-table";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  CircleCheck,
  CircleX,
  Download,
  MoreHorizontal,
  Pen,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DeleteExpenseDialog } from "@/components/delete-expense-dialog";
import { EditExpenseDialog } from "@/components/edit-expense-dialog";
import { updateExpense } from "@/lib/api";
import { Expense, expenseSchema } from "@/types/schema";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  onExpenseUpdated?: () => void;
}

export function DataTableRowActions<TData>({
  row,
  onExpenseUpdated,
}: DataTableRowActionsProps<TData>) {
  const expense = expenseSchema.parse(row.original) as Expense;
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);

  const handleReconcile = async () => {
    setIsReconciling(true);
    try {
      const newStatus =
        expense.status === "reconciled" ? "imported" : "reconciled";
      await updateExpense(expense.id, { status: newStatus });

      toast(
        expense.status === "reconciled"
          ? "Expense marked as unreconciled"
          : "Expense reconciled",
        {
          description:
            expense.status === "reconciled"
              ? "Expense has been marked as unreconciled."
              : "Expense has been marked as reconciled.",
        },
      );
      onExpenseUpdated?.();
    } catch (error) {
      toast("Reconcile failed", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while updating the expense status.",
      });
    } finally {
      setIsReconciling(false);
    }
  };

  const handleExport = () => {
    // Simple CSV export for the single expense
    const csvData = [
      [
        "Date",
        "Merchant",
        "Category",
        "Description",
        "Payment Method",
        "Amount",
        "Status",
      ],
      [
        expense.date,
        expense.merchant,
        expense.category,
        expense.description,
        expense.paymentMethod,
        expense.amount.toString(),
        expense.status,
      ],
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `expense-${expense.merchant}-${expense.date}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast("Export successful", {
      description: "Expense has been exported to CSV file.",
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            className="text-green-600 hover:bg-green-50"
            onClick={handleReconcile}
            disabled={isReconciling}
          >
            {expense.status === "reconciled" ? (
              <CircleX className="text-orange-600" />
            ) : (
              <CircleCheck className="text-green-600" />
            )}
            {expense.status === "reconciled" ? "Unreconcile" : "Reconcile"}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-blue-600 hover:bg-blue-50"
            onClick={() => setEditDialogOpen(true)}
          >
            <Pen className="text-blue-600" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-indigo-600 hover:bg-indigo-50"
            onClick={handleExport}
          >
            <Download className="text-indigo-600" />
            Export
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 hover:bg-red-50"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="text-red-600" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditExpenseDialog
        expense={expense}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onExpenseUpdated={onExpenseUpdated}
      />

      <DeleteExpenseDialog
        expense={expense}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onExpenseDeleted={onExpenseUpdated}
      />
    </>
  );
}
