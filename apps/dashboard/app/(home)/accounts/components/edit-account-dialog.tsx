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
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { updateAccount } from "@/lib/api";
import { Account } from "@/types/schema";

const accountTypes = [
  "Checking",
  "Savings",
  "Credit Card",
  "Investment",
  "Loan",
  "Cash",
  "Other",
];

const currencies = ["KES", "USD", "EUR", "GBP"];

interface EditAccountDialogProps {
  account: Account;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountUpdated?: () => void;
}

export function EditAccountDialog({
  account,
  open,
  onOpenChange,
  onAccountUpdated,
}: EditAccountDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: account.name,
    accountType: account.accountType,
    currency: account.currency || "KES",
    description: account.description || "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: account.name,
      accountType: account.accountType,
      currency: account.currency || "KES",
      description: account.description || "",
    });
  };

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        accountType: account.accountType,
        currency: account.currency || "KES",
        description: account.description || "",
      });
    }
  }, [account]);

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.accountType) {
      toast("Missing fields", {
        description: "Please fill in all required fields.",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const accountData = {
        name: formData.name,
        accountType: formData.accountType,
        currency: formData.currency as "KES" | "USD" | "EUR" | "GBP",
        description: formData.description || undefined,
      };

      await updateAccount(account.id, accountData);
      toast("Account updated", {
        description: "Your account has been updated successfully.",
      });
      onOpenChange(false);
      onAccountUpdated?.();
    } catch (error) {
      toast("Update failed", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while updating the account.",
      });
    } finally {
      setIsUpdating(false);
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
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        onOpenChange(newOpen);
        if (!newOpen) resetForm();
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
          <DialogDescription>
            Update your account information. Note: Balance changes are managed
            automatically through transactions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Account Name *
            </Label>
            <Input
              id="name"
              placeholder="e.g., Main Checking, Emergency Savings"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="account-type" className="text-right">
              Account Type *
            </Label>
            <Select
              value={formData.accountType}
              onValueChange={(value) => handleInputChange("accountType", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                {accountTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                {currencies.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Optional description for this account..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="col-span-3"
              rows={3}
            />
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Current Balance:</strong>{" "}
              {formatCurrency(account.balance)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Balance is updated automatically when you add income or expenses
              to this account.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Account"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
