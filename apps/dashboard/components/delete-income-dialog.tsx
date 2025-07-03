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
import { deleteIncome } from "@/lib/api";
import { Income } from "@/types/schema";

interface DeleteIncomeDialogProps {
  income: Income | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIncomeDeleted?: () => void;
}

export function DeleteIncomeDialog({
  income,
  open,
  onOpenChange,
  onIncomeDeleted,
}: DeleteIncomeDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!income) return;

    setIsDeleting(true);
    try {
      await deleteIncome(income.id);
      toast("Income deleted", {
        description: "The income has been permanently deleted.",
      });
      onOpenChange(false);
      onIncomeDeleted?.();
    } catch (error) {
      toast("Delete failed", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while deleting the income.",
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
            income transaction{income ? ` from "${income.source}"` : ""} and
            remove it from our servers.
            {income && (
              <div className="mt-2 p-2 bg-muted rounded text-sm">
                <strong>Income Details:</strong>
                <br />
                Source: {income.source}
                <br />
                Amount:{" "}
                {new Intl.NumberFormat("en-KE", {
                  style: "currency",
                  currency: "KES",
                }).format(income.amount)}
                <br />
                Date: {income.date}
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
              "Delete Income"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
