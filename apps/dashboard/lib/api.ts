"use server";

import { auth } from "@clerk/nextjs/server";
import {
  Budget,
  BudgetResponse,
  BudgetSummary,
  Expense,
  Income,
} from "@/types/schema";

const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:9010";

async function getAuthHeaders() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }
  return {
    "X-User-Id": userId,
    "Content-Type": "application/json",
  };
}

export interface ApiResponse<T> {
  offset: number;
  limit: number;
  total: number;
  incomes?: T[];
  expenses?: T[];
}

export interface ExpenseResponse extends ApiResponse<Expense> {
  expenses: Expense[];
}

export interface IncomeResponse extends ApiResponse<Income> {
  incomes: Income[];
}

export async function getIncomes(
  offset = 0,
  limit = 100,
): Promise<IncomeResponse> {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/incomes?offset=${offset}&limit=${limit}`,
    {
      cache: "no-store",
      headers,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch incomes (${response.status}): ${
        errorText || response.statusText
      }`,
    );
  }

  const data = await response.json();
  return data;
}

export async function getExpenses(
  offset = 0,
  limit = 100,
): Promise<ExpenseResponse> {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/expenses?offset=${offset}&limit=${limit}`,
    {
      cache: "no-store",
      headers,
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch expenses: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function uploadStatement(
  file: File,
  type: "mpesa" | "imbank" = "mpesa",
): Promise<{ message: string }> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/transactions/${type}`, {
    method: "POST",
    headers: {
      "X-User-Id": userId,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload statement: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function createIncome(
  income: Omit<Income, "id" | "userId">,
): Promise<{ message: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/incomes`, {
    method: "POST",
    headers,
    body: JSON.stringify([income]),
  });

  if (!response.ok) {
    throw new Error(`Failed to create income: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function createExpense(
  expense: Omit<Expense, "id" | "userId">,
): Promise<{ message: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/expenses`, {
    method: "POST",
    headers,
    body: JSON.stringify([expense]),
  });

  if (!response.ok) {
    throw new Error(`Failed to create expense: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function updateIncome(
  id: string,
  income: Partial<Income>,
): Promise<{ message: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/incomes/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(income),
  });

  if (!response.ok) {
    throw new Error(`Failed to update income: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function deleteIncome(id: string): Promise<{ message: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/incomes/${id}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to delete income: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function updateExpense(
  id: string,
  expense: Partial<Expense>,
): Promise<{ message: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(expense),
  });

  if (!response.ok) {
    throw new Error(`Failed to update expense: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function deleteExpense(id: string): Promise<{ message: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to delete expense: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

// Budget API Functions
export async function getBudgets(
  month?: string,
  offset = 0,
  limit = 100,
): Promise<BudgetResponse> {
  const headers = await getAuthHeaders();
  const params = new URLSearchParams({
    offset: offset.toString(),
    limit: limit.toString(),
  });

  if (month) {
    params.append("month", month);
  }

  const response = await fetch(`${API_BASE_URL}/budgets?${params}`, {
    cache: "no-store",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch budgets: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function createBudget(
  budget: Omit<
    Budget,
    | "id"
    | "userId"
    | "spentAmount"
    | "remainingAmount"
    | "percentageUsed"
    | "isOverspent"
  >,
): Promise<{ message: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/budgets`, {
    method: "POST",
    headers,
    body: JSON.stringify([budget]),
  });

  if (!response.ok) {
    throw new Error(`Failed to create budget: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function updateBudget(
  id: string,
  budget: Partial<Budget>,
): Promise<{ message: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(budget),
  });

  if (!response.ok) {
    throw new Error(`Failed to update budget: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function deleteBudget(id: string): Promise<{ message: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to delete budget: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function getBudgetSummary(month: string): Promise<BudgetSummary> {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/budgets/summary?month=${month}`,
    {
      cache: "no-store",
      headers,
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch budget summary: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function calculateBudgetProgress(
  month: string,
): Promise<{ message: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/budgets/calculate?month=${month}`,
    {
      method: "POST",
      headers,
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to calculate budget progress: ${response.statusText}`,
    );
  }

  const data = await response.json();
  return data;
}

// Dashboard Totals API Functions
export interface DashboardTotals {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  incomeChangePercent: number;
  expenseChangePercent: number;
  balanceChangePercent: number;
  savingsChangePercent: number;
}

export async function getDashboardTotals(): Promise<DashboardTotals> {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7);
    const previousMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1,
    )
      .toISOString()
      .slice(0, 7);

    const [currentIncomes, currentExpenses, previousIncomes, previousExpenses] =
      await Promise.all([
        getIncomes(0, 10000),
        getExpenses(0, 10000),
        getIncomes(0, 10000),
        getExpenses(0, 10000),
      ]);

    // Calculate totals for all time
    const totalIncome = currentIncomes.incomes.reduce(
      (sum, income) => sum + income.amount,
      0,
    );
    const totalExpenses = currentExpenses.expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );
    const totalBalance = totalIncome - totalExpenses;
    const totalSavings = totalBalance > 0 ? totalBalance : 0;

    // Calculate current month totals
    const currentMonthIncomeList = currentIncomes.incomes.filter((income) =>
      income.date.startsWith(currentMonth),
    );
    const currentMonthExpenseList = currentExpenses.expenses.filter((expense) =>
      expense.date.startsWith(currentMonth),
    );

    // Calculate previous month totals
    const previousMonthIncomeList = previousIncomes.incomes.filter((income) =>
      income.date.startsWith(previousMonth),
    );
    const previousMonthExpenseList = previousExpenses.expenses.filter(
      (expense) => expense.date.startsWith(previousMonth),
    );

    const currentMonthIncome = currentMonthIncomeList.reduce(
      (sum, income) => sum + income.amount,
      0,
    );
    const currentMonthExpenseTotal = currentMonthExpenseList.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );
    const currentMonthBalance = currentMonthIncome - currentMonthExpenseTotal;
    const currentMonthSavings =
      currentMonthBalance > 0 ? currentMonthBalance : 0;

    const previousMonthIncome = previousMonthIncomeList.reduce(
      (sum, income) => sum + income.amount,
      0,
    );
    const previousMonthExpenseTotal = previousMonthExpenseList.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );
    const previousMonthBalance =
      previousMonthIncome - previousMonthExpenseTotal;
    const previousMonthSavings =
      previousMonthBalance > 0 ? previousMonthBalance : 0;

    // Calculate percentage changes
    const incomeChangePercent =
      previousMonthIncome > 0
        ? ((currentMonthIncome - previousMonthIncome) / previousMonthIncome) *
          100
        : 0;
    const expenseChangePercent =
      previousMonthExpenseTotal > 0
        ? ((currentMonthExpenseTotal - previousMonthExpenseTotal) /
            previousMonthExpenseTotal) *
          100
        : 0;
    const balanceChangePercent =
      previousMonthBalance !== 0
        ? ((currentMonthBalance - previousMonthBalance) /
            Math.abs(previousMonthBalance)) *
          100
        : 0;
    const savingsChangePercent =
      previousMonthSavings > 0
        ? ((currentMonthSavings - previousMonthSavings) /
            previousMonthSavings) *
          100
        : 0;

    return {
      totalBalance,
      totalIncome,
      totalExpenses,
      totalSavings,
      incomeChangePercent,
      expenseChangePercent,
      balanceChangePercent,
      savingsChangePercent,
    };
  } catch (error) {
    console.error("Failed to fetch dashboard totals:", error);
    return {
      totalBalance: 0,
      totalIncome: 0,
      totalExpenses: 0,
      totalSavings: 0,
      incomeChangePercent: 0,
      expenseChangePercent: 0,
      balanceChangePercent: 0,
      savingsChangePercent: 0,
    };
  }
}

// Recent Transactions API Functions
export interface RecentTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
}

export async function getRecentTransactions(
  limit = 10,
): Promise<RecentTransaction[]> {
  try {
    const [incomes, expenses] = await Promise.all([
      getIncomes(0, limit),
      getExpenses(0, limit),
    ]);

    const transactions: RecentTransaction[] = [
      ...incomes.incomes.map((income) => ({
        id: income.id,
        date: income.date,
        description: income.description || income.source,
        amount: income.amount,
        type: "income" as const,
        category: income.category,
      })),
      ...expenses.expenses.map((expense) => ({
        id: expense.id,
        date: expense.date,
        description: expense.description || expense.merchant,
        amount: expense.amount,
        type: "expense" as const,
        category: expense.category,
      })),
    ];

    // Sort by date (newest first) and limit
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error("Failed to fetch recent transactions:", error);
    return [];
  }
}

// Onboarding API Functions
export async function completeOnboarding(
  clerkUserId: string,
  data: any,
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/onboarding/${clerkUserId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to complete onboarding");
  }

  const result = await response.json();
  return result;
}

export async function getProfile(clerkUserId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/profile/${clerkUserId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.status === 404) {
    throw new Error("Profile not found");
  }

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to get profile");
  }

  const result = await response.json();
  return result;
}
