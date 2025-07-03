import { z } from "zod";
import { expense, income } from "@/constants/categories";
import { paymentMethods } from "@/constants/payment-methods";

export const expenseSchema = z.object({
  id: z.string(),
  date: z.string(),
  merchant: z.string(),
  category: z.enum(expense as [string, ...string[]]),
  description: z.string(),
  paymentMethod: z.enum(paymentMethods as [string, ...string[]]),
  amount: z.number(),
  status: z.string(),
  dateCreated: z.string().optional(),
  createdBy: z.string().optional(),
  dateUpdated: z.string().optional(),
  updatedBy: z.string().optional(),
  active: z.boolean().optional(),
  meta: z.record(z.any()).optional(),
});

export type Expense = z.infer<typeof expenseSchema>;

export const incomeSchema = z.object({
  id: z.string(),
  date: z.string(),
  source: z.string(),
  category: z.enum(income as [string, ...string[]]),
  description: z.string(),
  paymentMethod: z.enum(paymentMethods as [string, ...string[]]),
  amount: z.number(),
  currency: z.enum(["KES", "USD", "EUR", "GBP"]),
  isRecurring: z.boolean(),
  originalAmount: z.number(),
  status: z.string(),
  dateCreated: z.string().optional(),
  createdBy: z.string().optional(),
  dateUpdated: z.string().optional(),
  updatedBy: z.string().optional(),
  active: z.boolean().optional(),
  meta: z.record(z.any()).optional(),
});

export type Income = z.infer<typeof incomeSchema>;
