import type { DashboardSummary } from "../types/dashboard";
import { api } from "./client";

export const dashboardApi = {
  get: () => api.get<DashboardSummary>("/dashboard"),
};
