import type { Expense } from "../types/expense";
import { api } from "./client";

export interface CreateExpenseRequest {
  expense_name: string;
  price: number;
  date_purchased: string;
  receipt_url?: string | null;
}

export const expensesApi = {
  list: () => api.get<Expense[]>("/expenses"),
  create: (data: CreateExpenseRequest) =>
    api.post<Expense>("/expenses", data),
  delete: (id: string) => api.delete<void>(`/expenses/${id}`),
};