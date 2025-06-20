import { z } from "zod";
import { expense, income } from "@/constants/categories";
import { paymentMethods } from "@/constants/payment-methods";

export const expenseSchema = z.object({
  id: z.string(),
  date: z.string(),
  merchant: z.string(),
  category: z.enum(expense as [string, ...string[]]),
  description: z.string(),
  payment_method: z.enum(paymentMethods as [string, ...string[]]),
  amount: z.number(),
  status: z.string(),
});

export type Expense = z.infer<typeof expenseSchema>;

export const incomeSchema = z.object({
  id: z.string(),
  date: z.string(),
  source: z.string(),
  category: z.enum(income as [string, ...string[]]),
  description: z.string(),
  payment_method: z.enum(paymentMethods as [string, ...string[]]),
  amount: z.number(),
  currency: z.enum(["KSH", "USD", "EUR", "GBP"]),
  is_recurring: z.boolean(),
  original_amount: z.number(),
  deductions: z
    .array(
      z.object({
        description: z.string(),
        amount: z.number(),
        currency: z.enum(["KSH", "USD", "EUR", "GBP"]),
      }),
    )
    .optional(),
});

export type Income = z.infer<typeof incomeSchema>;
