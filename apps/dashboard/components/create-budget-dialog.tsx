"use client";

import { Button } from "@workspace/ui/components/button";
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
import { CirclePlus, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { expense } from "@/constants/categories";
import { createBudget } from "@/lib/api";
import { Budget } from "@/types/schema";

interface CreateBudgetDialogProps {
  onBudgetCreated?: () => void;
}

export function CreateBudgetDialog({
  onBudgetCreated,
}: CreateBudgetDialogProps) {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    month: new Date().toISOString().slice(0, 7), // YYYY-MM format
    category: "",
    budgetAmount: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      month: new Date().toISOString().slice(0, 7),
      category: "",
      budgetAmount: "",
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.month || !formData.category || !formData.budgetAmount) {
      toast("Missing fields", {
        description: "Please fill in all required fields.",
      });
      return;
    }

    const budgetAmount = parseFloat(formData.budgetAmount);
    if (isNaN(budgetAmount) || budgetAmount <= 0) {
      toast("Invalid budget amount", {
        description: "Please enter a valid budget amount greater than 0.",
      });
      return;
    }

    setIsCreating(true);
    try {
      const budget: Omit<
        Budget,
        | "id"
        | "userId"
        | "spentAmount"
        | "remainingAmount"
        | "percentageUsed"
        | "isOverspent"
      > = {
        month: formData.month,
        category: formData.category,
        budgetAmount: budgetAmount,
      };

      await createBudget(budget);
      toast("Budget created", {
        description: "Your budget has been created successfully.",
      });
      setOpen(false);
      resetForm();
      onBudgetCreated?.();
    } catch (error) {
      toast("Creation failed", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while creating the budget.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Filter expense categories (remove income-related categories)
  // Define income categories to exclude
  const incomeCategories = new Set([
    "sales",
    "salary",
    "freelance",
    "rental income",
    "dividends",
    "interest",
    "consulting",
    "commissions",
    "grants",
    "loan repayment received",
    "gifts",
  ]);

  const expenseCategories = expense.filter(
    (cat) => !incomeCategories.has(cat.toLowerCase()),
  );

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
          Create New Budget Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Budget</DialogTitle>
          <DialogDescription>
            Set a monthly budget for a specific category to track your spending.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="month" className="text-right">
              Month *
            </Label>
            <Input
              id="month"
              type="month"
              value={formData.month}
              onChange={(e) => handleInputChange("month", e.target.value)}
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
                {expenseCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="budgetAmount" className="text-right">
              Budget Amount *
            </Label>
            <Input
              id="budgetAmount"
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={formData.budgetAmount}
              onChange={(e) =>
                handleInputChange("budgetAmount", e.target.value)
              }
              className="col-span-3"
            />
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
                Create Budget
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
