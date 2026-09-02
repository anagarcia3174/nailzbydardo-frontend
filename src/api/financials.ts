import type { FinancialsSummary } from "../types/dashboard";
import { api } from "./client";

export const financialsApi = {
  get: (start: string, end: string) =>
    api.get<FinancialsSummary>(
      `/financials?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
    ),
};
