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
import { DeleteIncomeDialog } from "@/components/delete-income-dialog";
import { EditIncomeDialog } from "@/components/edit-income-dialog";
import { updateIncome } from "@/lib/api";
import { Income, incomeSchema } from "@/types/schema";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  onIncomeUpdated?: () => void;
}

export function DataTableRowActions<TData>({
  row,
  onIncomeUpdated,
}: DataTableRowActionsProps<TData>) {
  const income = incomeSchema.parse(row.original) as Income;
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);

  const handleReconcile = async () => {
    setIsReconciling(true);
    try {
      const newStatus =
        income.status === "reconciled" ? "imported" : "reconciled";
      await updateIncome(income.id, { status: newStatus });

      toast(
        income.status === "reconciled"
          ? "Income marked as unreconciled"
          : "Income reconciled",
        {
          description:
            income.status === "reconciled"
              ? "Income has been marked as unreconciled."
              : "Income has been marked as reconciled.",
        },
      );
      onIncomeUpdated?.();
    } catch (error) {
      toast("Reconcile failed", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while updating the income status.",
      });
    } finally {
      setIsReconciling(false);
    }
  };

  const handleExport = () => {
    // Simple CSV export for the single income
    const csvData = [
      [
        "Date",
        "Source",
        "Category",
        "Description",
        "Payment Method",
        "Amount",
        "Currency",
        "Status",
      ],
      [
        income.date,
        income.source,
        income.category,
        income.description,
        income.paymentMethod,
        income.amount.toString(),
        income.currency || "KES",
        income.status,
      ],
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `income-${income.source}-${income.date}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast("Export successful", {
      description: "Income has been exported to CSV file.",
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
            {income.status === "reconciled" ? (
              <CircleX className="text-orange-600" />
            ) : (
              <CircleCheck className="text-green-600" />
            )}
            {income.status === "reconciled" ? "Unreconcile" : "Reconcile"}
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

      <EditIncomeDialog
        income={income}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onIncomeUpdated={onIncomeUpdated}
      />

      <DeleteIncomeDialog
        income={income}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onIncomeDeleted={onIncomeUpdated}
      />
    </>
  );
}
