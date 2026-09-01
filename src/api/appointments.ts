import { type AppointmentStatus, type PaymentMethod, type Appointment, type DiscountType, type AppointmentDiscount, type AppointmentDetail, type AppointmentTotal, type AppointmentService } from "../types/appointment";
import { api } from "./client";

export interface CreateAppointmentRequest {
    client_id: string;
  appt_date: string;
    notes?: string | null;
}

export interface UpdateAppointmentRequest {
      appt_date: string;
      appt_status: AppointmentStatus;
      late_fee?: number | null;
      payment_method?: PaymentMethod | null;
      notes?: string | null;
      receipt_url?: string | null;
      loyalty_reward: boolean;
      tip?: number | null;
}

export interface AddServiceRequest {
  service_name: string;
  service_price: number;
  design_price: number;
}

export interface AddDiscountRequest {
  discount_name: string;
  discount_type: DiscountType;
  discount_value: number;
}

export const appointmentsApi = {
list: () => api.get<Appointment[]>("/appointments"),
create: (data: CreateAppointmentRequest) => api.post<Appointment>("/appointments", data),
listUpcoming: () => api.get<Appointment[]>("/appointments/upcoming"),
get: (id: string) => api.get<AppointmentDetail>(`"/appointments/${id}`),
update: (id: string, data: UpdateAppointmentRequest) => api.patch<Appointment>(`/appointments/${id}`, data),
delete: (id: string) => api.delete<void>(`/appointments/${id}`),
getTotal: (id: string) => api.get<AppointmentTotal>(`/appointments/${id}/total`),
addService: (id: string, data: AddServiceRequest) => api.post<AppointmentService>(`/appointments/${id}/services`, data),
 removeService: (id: string, serviceId: string) => api.delete<void>(`/appointments/${id}/services/${serviceId}`),
  addDiscount: (id: string, data: AddDiscountRequest) =>
    api.post<AppointmentDiscount>(`/appointments/${id}/discounts`, data),
  removeDiscount: (id: string, discountId: string) =>
    api.delete<void>(`/appointments/${id}/discounts/${discountId}`),
}

/*

				r.Post("/services", h.Appointment.AddService)
				r.Delete("/services/{serviceId}", h.Appointment.RemoveService)

				r.Post("/discounts", h.Appointment.AddDiscount)
				r.Delete("/discounts/{discountId}", h.Appointment.RemoveDiscount)
			})
		})
            */