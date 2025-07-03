"use client";

import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
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
import { income as incomeCategories } from "@/constants/categories";
import { paymentMethods } from "@/constants/payment-methods";
import { updateIncome } from "@/lib/api";
import { Income } from "@/types/schema";

interface EditIncomeDialogProps {
  income: Income | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIncomeUpdated?: () => void;
}

export function EditIncomeDialog({
  income,
  open,
  onOpenChange,
  onIncomeUpdated,
}: EditIncomeDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    source: "",
    category: "",
    description: "",
    paymentMethod: "",
    amount: "",
    originalAmount: "",
    currency: "KES",
    isRecurring: false,
    status: "imported",
  });

  useEffect(() => {
    if (income && open) {
      setFormData({
        date: income.date,
        source: income.source,
        category: income.category,
        description: income.description,
        paymentMethod: income.paymentMethod,
        amount: income.amount.toString(),
        originalAmount: income.originalAmount?.toString() || "",
        currency: income.currency || "KES",
        isRecurring: income.isRecurring || false,
        status: income.status,
      });
    }
  }, [income, open]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!income) return;

    // Validation
    if (
      !formData.date ||
      !formData.source ||
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
    const originalAmount = formData.originalAmount
      ? parseFloat(formData.originalAmount)
      : amount;

    if (isNaN(amount) || amount <= 0) {
      toast("Invalid amount", {
        description: "Please enter a valid amount greater than 0.",
      });
      return;
    }

    if (
      formData.originalAmount &&
      (isNaN(originalAmount) || originalAmount <= 0)
    ) {
      toast("Invalid original amount", {
        description: "Please enter a valid original amount greater than 0.",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const updatedIncome: Partial<Income> = {
        date: formData.date,
        source: formData.source,
        category: formData.category as any,
        description: formData.description,
        paymentMethod: formData.paymentMethod as any,
        amount: amount,
        currency: formData.currency as any,
        isRecurring: formData.isRecurring,
        originalAmount: originalAmount,
        status: formData.status as any,
      };

      await updateIncome(income.id, updatedIncome);
      toast("Income updated", {
        description: "Your income has been updated successfully.",
      });
      onOpenChange(false);
      onIncomeUpdated?.();
    } catch (error) {
      toast("Update failed", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while updating the income.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReconcile = async () => {
    if (!income) return;

    setIsUpdating(true);
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
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Income</DialogTitle>
          <DialogDescription>
            Update the income transaction details.
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
            <Label htmlFor="source" className="text-right">
              Source *
            </Label>
            <Input
              id="source"
              placeholder="e.g., Company Name, Client"
              value={formData.source}
              onChange={(e) => handleInputChange("source", e.target.value)}
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
                {incomeCategories.map((category) => (
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
            <Label htmlFor="original-amount" className="text-right">
              Original Amount
            </Label>
            <Input
              id="original-amount"
              type="number"
              placeholder="0.00 (optional)"
              step="0.01"
              min="0"
              value={formData.originalAmount}
              onChange={(e) =>
                handleInputChange("originalAmount", e.target.value)
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="currency" className="text-right">
              Currency
            </Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => handleInputChange("currency", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KES">KES</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
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
              placeholder="Description of the income..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="col-span-3"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="recurring" className="text-right">
              Recurring
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) =>
                  handleInputChange("isRecurring", !!checked)
                }
              />
              <Label htmlFor="recurring" className="text-sm">
                This is a recurring income
              </Label>
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleReconcile}
            disabled={isUpdating}
          >
            {income?.status === "reconciled" ? "Unreconcile" : "Reconcile"}
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
                Update Income
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
