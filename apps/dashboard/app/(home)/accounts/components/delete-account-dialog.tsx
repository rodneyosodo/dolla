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
import { useState } from "react";
import { toast } from "sonner";
import { deleteAccount } from "@/lib/api";
import { Account } from "@/types/schema";

interface DeleteAccountDialogProps {
  account: Account;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountDeleted?: () => void;
}

export function DeleteAccountDialog({
  account,
  open,
  onOpenChange,
  onAccountDeleted,
}: DeleteAccountDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await deleteAccount(account.id);

      toast("Account deleted", {
        description: "The account has been deleted successfully.",
      });

      onOpenChange(false);
      onAccountDeleted?.();
    } catch (error) {
      toast("Failed to delete account", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: account.currency || "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Account</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                Are you sure you want to delete the account "{account.name}"?
              </p>
              <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                <p className="text-sm">
                  <strong>Account Type:</strong> {account.accountType}
                </p>
                <p className="text-sm">
                  <strong>Current Balance:</strong>{" "}
                  {formatCurrency(account.balance)}
                </p>
                <p className="text-sm">
                  <strong>Currency:</strong> {account.currency || "KES"}
                </p>
              </div>
              <p className="text-sm text-destructive">
                <strong>Warning:</strong> This action cannot be undone. The
                account and its associated transaction history will be
                permanently removed from your records.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Deleting..." : "Delete Account"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
