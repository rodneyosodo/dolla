"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { deleteExpense } from "@/lib/api";
import { Expense } from "@/types/schema";

interface DeleteExpenseDialogProps {
  expense: Expense | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExpenseDeleted?: () => void;
}

export function DeleteExpenseDialog({
  expense,
  open,
  onOpenChange,
  onExpenseDeleted,
}: DeleteExpenseDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!expense) return;

    setIsDeleting(true);
    try {
      await deleteExpense(expense.id);
      toast("Expense deleted", {
        description: "The expense has been permanently deleted.",
      });
      onOpenChange(false);
      onExpenseDeleted?.();
    } catch (error) {
      toast("Delete failed", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while deleting the expense.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            expense transaction{expense ? ` to "${expense.merchant}"` : ""} and
            remove it from our servers.
            {expense && (
              <div className="mt-2 p-2 bg-muted rounded text-sm">
                <strong>Expense Details:</strong>
                <br />
                Merchant: {expense.merchant}
                <br />
                Amount:{" "}
                {new Intl.NumberFormat("en-KE", {
                  style: "currency",
                  currency: "KES",
                }).format(expense.amount)}
                <br />
                Date: {expense.date}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Expense"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
