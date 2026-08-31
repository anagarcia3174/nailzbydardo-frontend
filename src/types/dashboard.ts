import type { Appointment } from "./appointment";

export interface DashboardSummary {
  upcoming_appointments: Appointment[];
  monthly_revenue: number;
  monthly_tips: number;
  monthly_appointment_count: number;
  monthly_expenses: number;
}

export interface FinancialsSummary {
  revenue: number;
  expenses: number;
  appointment_count: number;
  tips: number;
}