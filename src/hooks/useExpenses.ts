import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  expensesApi,
  type CreateExpenseRequest,
} from "../api/expenses";
import { invalidateExpenseRelated } from "../lib/invalidation";

export function useExpenses() {
  return useQuery({
    queryKey: ["expenses"],
    queryFn: expensesApi.list,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseRequest) => expensesApi.create(data),
        onSuccess: () => invalidateExpenseRelated(queryClient),

  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expensesApi.delete(id),
        onSuccess: () => invalidateExpenseRelated(queryClient),

  });
}