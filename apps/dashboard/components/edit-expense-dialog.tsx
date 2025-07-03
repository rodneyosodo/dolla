"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Textarea } from "@workspace/ui/components/textarea";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { expense as allExpenseCategories } from "@/constants/categories";
import { paymentMethods } from "@/constants/payment-methods";
import { updateExpense } from "@/lib/api";
import { Expense } from "@/types/schema";

interface EditExpenseDialogProps {
  expense: Expense;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExpenseUpdated?: () => void;
}

export function EditExpenseDialog({
  expense,
  open,
  onOpenChange,
  onExpenseUpdated,
}: EditExpenseDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    merchant: "",
    category: "",
    description: "",
    paymentMethod: "",
    amount: "",
    status: "imported",
  });

  useEffect(() => {
    if (expense && open) {
      setFormData({
        date: expense.date,
        merchant: expense.merchant,
        category: expense.category,
        description: expense.description,
        paymentMethod: expense.paymentMethod,
        amount: expense.amount.toString(),
        status: expense.status,
      });
    }
  }, [expense, open]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!expense) return;

    // Validation
    if (
      !formData.date ||
      !formData.merchant ||
      !formData.category ||
      !formData.description ||
      !formData.paymentMethod ||
      !formData.amount
    ) {
      toast("Missing fields", {
        description: "Please fill in all required fields.",
      });
      return;
    }

    const amount = parseFloat(formData.amount);

    if (isNaN(amount) || amount <= 0) {
      toast("Invalid amount", {
        description: "Please enter a valid amount greater than 0.",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const updatedExpense: Partial<Expense> = {
        date: formData.date,
        merchant: formData.merchant,
        category: formData.category as any,
        description: formData.description,
        paymentMethod: formData.paymentMethod as any,
        amount: amount,
        status: formData.status as any,
      };

      await updateExpense(expense.id, updatedExpense);
      toast("Expense updated", {
        description: "Your expense has been updated successfully.",
      });
      onOpenChange(false);
      onExpenseUpdated?.();
    } catch (error) {
      toast("Update failed", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while updating the expense.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReconcile = async () => {
    if (!expense) return;

    setIsUpdating(true);
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
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
          <DialogDescription>
            Update the expense transaction details.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date *
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="merchant" className="text-right">
              Merchant *
            </Label>
            <Input
              id="merchant"
              placeholder="e.g., Safaricom, Naivas"
              value={formData.merchant}
              onChange={(e) => handleInputChange("merchant", e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category *
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange("category", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {allExpenseCategories
                  .filter(
                    (cat) =>
                      !cat.includes("sales") &&
                      !cat.includes("salary") &&
                      !cat.includes("freelance") &&
                      !cat.includes("rental income") &&
                      !cat.includes("dividends") &&
                      !cat.includes("interest") &&
                      !cat.includes("consulting") &&
                      !cat.includes("commissions") &&
                      !cat.includes("grants") &&
                      !cat.includes("loan repayment received") &&
                      !cat.includes("gifts"),
                  )
                  .map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment-method" className="text-right">
              Payment *
            </Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) =>
                handleInputChange("paymentMethod", value)
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount *
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="imported">Imported</SelectItem>
                <SelectItem value="reconciled">Reconciled</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Description of the expense..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="col-span-3"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleReconcile}
            disabled={isUpdating}
          >
            {expense?.status === "reconciled" ? "Unreconcile" : "Reconcile"}
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Expense
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
