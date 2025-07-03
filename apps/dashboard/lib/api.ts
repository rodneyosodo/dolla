import {
  Budget,
  BudgetResponse,
  BudgetSummary,
  Expense,
  Income,
} from "@/types/schema";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9010";

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
  const response = await fetch(
    `${API_BASE_URL}/incomes?offset=${offset}&limit=${limit}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch incomes (${response.status}): ${errorText || response.statusText}`,
    );
  }

  const data = await response.json();
  return data;
}

export async function getExpenses(
  offset = 0,
  limit = 100,
): Promise<ExpenseResponse> {
  const response = await fetch(
    `${API_BASE_URL}/expenses?offset=${offset}&limit=${limit}`,
    {
      cache: "no-store",
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
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/transactions/${type}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload statement: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function createIncome(
  income: Omit<Income, "id">,
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/incomes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify([income]),
  });

  if (!response.ok) {
    throw new Error(`Failed to create income: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function createExpense(
  expense: Omit<Expense, "id">,
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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
  const response = await fetch(`${API_BASE_URL}/incomes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(income),
  });

  if (!response.ok) {
    throw new Error(`Failed to update income: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function deleteIncome(id: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/incomes/${id}`, {
    method: "DELETE",
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
  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expense),
  });

  if (!response.ok) {
    throw new Error(`Failed to update expense: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function deleteExpense(id: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "DELETE",
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
  const params = new URLSearchParams({
    offset: offset.toString(),
    limit: limit.toString(),
  });

  if (month) {
    params.append("month", month);
  }

  const response = await fetch(`${API_BASE_URL}/budgets?${params}`, {
    cache: "no-store",
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
    "id" | "spentAmount" | "remainingAmount" | "percentageUsed" | "isOverspent"
  >,
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/budgets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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
  const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(budget),
  });

  if (!response.ok) {
    throw new Error(`Failed to update budget: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function deleteBudget(id: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete budget: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function getBudgetSummary(month: string): Promise<BudgetSummary> {
  const response = await fetch(
    `${API_BASE_URL}/budgets/summary?month=${month}`,
    {
      cache: "no-store",
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
  const response = await fetch(
    `${API_BASE_URL}/budgets/calculate?month=${month}`,
    {
      method: "POST",
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
