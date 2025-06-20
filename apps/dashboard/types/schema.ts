import { z } from "zod";
import { categories } from "@/constants/categories";
import { paymentMethods } from "@/constants/payment-methods";

export const expenseSchema = z.object({
  date: z.string(),
  merchant: z.string(),
  category: z.enum(categories as [string, ...string[]]),
  description: z.string(),
  payment_method: z.enum(paymentMethods as [string, ...string[]]),
  amount: z.number(),
  status: z.string(),
});

export type Expense = z.infer<typeof expenseSchema>;
