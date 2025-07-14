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
import { Textarea } from "@workspace/ui/components/textarea";
import { CirclePlus, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { expense } from "@/constants/categories";
import { paymentMethods } from "@/constants/payment-methods";
import { createExpense, getAccounts } from "@/lib/api";
import { Account, Expense } from "@/types/schema";

interface CreateExpenseDialogProps {
  onExpenseCreated?: () => void;
}

export function CreateExpenseDialog({
  onExpenseCreated,
}: CreateExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    merchant: "",
    category: "",
    description: "",
    paymentMethod: "",
    amount: "",
    accountId: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      merchant: "",
      category: "",
      description: "",
      paymentMethod: "",
      amount: "",
      accountId: "",
    });
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setIsLoadingAccounts(true);
        const response = await getAccounts(0, 100);
        setAccounts(response.accounts);
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
      } finally {
        setIsLoadingAccounts(false);
      }
    };

    if (open) {
      fetchAccounts();
    }
  }, [open]);

  const handleSubmit = async () => {
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

    setIsCreating(true);
    try {
      const expense: Omit<Expense, "id" | "userId"> = {
        date: formData.date,
        merchant: formData.merchant,
        category: formData.category,
        description: formData.description,
        paymentMethod: formData.paymentMethod,
        amount: amount,
        status: "imported",
        accountId:
          formData.accountId === "none"
            ? undefined
            : formData.accountId || undefined,
      };

      await createExpense(expense);
      toast("Expense created", {
        description: "Your expense has been created successfully.",
      });
      setOpen(false);
      resetForm();
      onExpenseCreated?.();
    } catch (error) {
      toast("Creation failed", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while creating the expense.",
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
          Create New Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Expense</DialogTitle>
          <DialogDescription>
            Add a new expense transaction to track your spending.
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
                {expense
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
            <Label htmlFor="account" className="text-right">
              Account
            </Label>
            <Select
              value={formData.accountId}
              onValueChange={(value) => handleInputChange("accountId", value)}
              disabled={isLoadingAccounts}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue
                  placeholder={
                    isLoadingAccounts
                      ? "Loading accounts..."
                      : "Select account (optional)"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No account selected</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} ({account.accountType}) -{" "}
                    {new Intl.NumberFormat("en-KE", {
                      style: "currency",
                      currency: account.currency || "KES",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(account.balance)}
                  </SelectItem>
                ))}
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
                Create Expense
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
