import { api } from "./api";
import type { Expense } from "@grocery/shared";

export function getFinanceSummary() {
  return api.get<{ totalIncome: number; totalExpenses: number; profit: number; orderCount: number }>("/finance/summary");
}

export function getExpenses() {
  return api.get<Expense[]>("/expenses");
}

export function createExpense(data: { description: string; amount: number }) {
  return api.post<Expense>("/expenses", data);
}
