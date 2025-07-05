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
  DialogTrigger,
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
import { CirclePlus, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { income } from "@/constants/categories";
import { paymentMethods } from "@/constants/payment-methods";
import { createIncome } from "@/lib/api";
import { Income } from "@/types/schema";

interface CreateIncomeDialogProps {
  onIncomeCreated?: () => void;
}

export function CreateIncomeDialog({
  onIncomeCreated,
}: CreateIncomeDialogProps) {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    source: "",
    category: "",
    description: "",
    paymentMethod: "",
    amount: "",
    originalAmount: "",
    currency: "KES",
    isRecurring: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      source: "",
      category: "",
      description: "",
      paymentMethod: "",
      amount: "",
      originalAmount: "",
      currency: "KES",
      isRecurring: false,
    });
  };

  const handleSubmit = async () => {
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

    setIsCreating(true);
    try {
      const income: Omit<Income, "id" | "userId"> = {
        date: formData.date,
        source: formData.source,
        category: formData.category as any,
        description: formData.description,
        paymentMethod: formData.paymentMethod as any,
        amount: amount,
        currency: formData.currency as any,
        isRecurring: formData.isRecurring,
        originalAmount: originalAmount,
        status: "imported",
      };

      await createIncome(income);
      toast("Income created", {
        description: "Your income has been created successfully.",
      });
      setOpen(false);
      resetForm();
      onIncomeCreated?.();
    } catch (error) {
      toast("Creation failed", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while creating the income.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <CirclePlus className="h-4 w-4 mr-2" />
          Create New Income
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Income</DialogTitle>
          <DialogDescription>
            Add a new income transaction to track your earnings.
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
                {income.map((category) => (
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
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CirclePlus className="mr-2 h-4 w-4" />
                Create Income
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
