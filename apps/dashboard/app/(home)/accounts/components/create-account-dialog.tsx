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
import { useState } from "react";
import { toast } from "sonner";
import { createAccount } from "@/lib/api";

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

interface CreateAccountDialogProps {
  onAccountCreated?: () => void;
}

export function CreateAccountDialog({
  onAccountCreated,
}: CreateAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    accountType: "",
    currency: "KES",
    description: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      accountType: "",
      currency: "KES",
      description: "",
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.accountType) {
      toast("Missing fields", {
        description: "Please fill in all required fields.",
      });
      return;
    }

    setIsCreating(true);
    try {
      const accountData = {
        name: formData.name,
        accountType: formData.accountType,
        currency: formData.currency as "KES" | "USD" | "EUR" | "GBP",
        description: formData.description || undefined,
      };

      await createAccount(accountData);
      toast("Account created", {
        description: "Your account has been created successfully.",
      });
      setOpen(false);
      resetForm();
      onAccountCreated?.();
    } catch (error) {
      toast("Creation failed", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while creating the account.",
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
          Create Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Account</DialogTitle>
          <DialogDescription>
            Add a new account to track your finances. You can create checking
            accounts, savings accounts, credit cards, and more.
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
                Create Account
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
