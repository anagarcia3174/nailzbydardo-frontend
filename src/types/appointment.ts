import type { ClientSummary } from "./client";

export type AppointmentStatus = "booked" | "complete" | "no_show" | "cancelled";
export type PaymentMethod = "cash" | "zelle" | "cash_app" | "other";
export type DiscountType = "amount" | "percent";

export interface Appointment {
  id: string;
  client_id: string;
  appt_date: string;
  appt_status: AppointmentStatus;
  late_fee: number | null;
  payment_method: PaymentMethod | null;
  notes: string | null;
  receipt_url: string | null;
  loyalty_reward: boolean;
  tip: number | null;
  created_at: string;
}
export interface AppointmentWithClient {
  id: string;
  appt_date: string;
  appt_status: AppointmentStatus;
  client_name: string;
}
export interface DashboardAppointment {
  id: string;
  appt_date: string;
  client_name: string;
}

export interface AppointmentServiceSummary {
  id: string;
  service_name: string;
  service_price: number;
  design_price: number;
}

export interface AppointmentDiscountSummary {
  id: string;
  discount_name: string;
  discount_type: DiscountType;
  discount_value: number;
}

export interface AppointmentDetail {
  appointment: Appointment;
  appointment_services: AppointmentServiceSummary[];
  appointment_discounts: AppointmentDiscountSummary[];
  client_summary: ClientSummary;
  complete_appointments: number;
}

export interface AppointmentTotal {
  subtotal: number;
  discount_total: number;
  service_total: number;
  tip: number;
  grand_total: number;
}

export interface AppointmentService  {
	id:            string;    
	appointment_id: string;    
	service_name:   string;    
	service_price:  number;
	design_price:   number;
	created_at:     string;
}
export interface AppointmentDiscount  {
	id:            string;            
	appointment_id: string;            
	discount_name:  string;        
	discount_type:  DiscountType; 
	discount_value: number;             
	created_at:     string;         
}