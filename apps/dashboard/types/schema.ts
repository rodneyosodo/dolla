import { z } from "zod";
import { expense, income } from "@/constants/categories";
import { paymentMethods } from "@/constants/payment-methods";

export const expenseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  accountId: z.string().optional(),
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
  userId: z.string(),
  accountId: z.string().optional(),
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

export const budgetSchema = z.object({
  id: z.string(),
  userId: z.string(),
  month: z.string(), // YYYY-MM format
  category: z.enum(expense as [string, ...string[]]),
  budgetAmount: z.number(),
  spentAmount: z.number().default(0),
  remainingAmount: z.number().default(0),
  percentageUsed: z.number().default(0),
  isOverspent: z.boolean().default(false),
  dateCreated: z.string().optional(),
  createdBy: z.string().optional(),
  dateUpdated: z.string().optional(),
  updatedBy: z.string().optional(),
  active: z.boolean().optional(),
  meta: z.record(z.any()).optional(),
});

export type Budget = z.infer<typeof budgetSchema>;

export interface BudgetResponse {
  offset: number;
  limit: number;
  total: number;
  budgets: Budget[];
}

export interface BudgetSummary {
  month: string;
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  overallPercentageUsed: number;
  categoriesOverspent: number;
  totalCategories: number;
}

export const accountSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  accountType: z.string(),
  balance: z.number(),
  currency: z.enum(["KES", "USD", "EUR", "GBP"]).default("KES"),
  description: z.string().optional(),
  dateCreated: z.string().optional(),
  createdBy: z.string().optional(),
  dateUpdated: z.string().optional(),
  updatedBy: z.string().optional(),
  active: z.boolean().optional(),
  meta: z.record(z.any()).optional(),
});

export type Account = z.infer<typeof accountSchema>;

export interface AccountResponse {
  offset: number;
  limit: number;
  total: number;
  accounts: Account[];
}
