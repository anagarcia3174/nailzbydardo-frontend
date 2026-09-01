import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appointmentsApi, type AddDiscountRequest, type AddServiceRequest, type CreateAppointmentRequest, type UpdateAppointmentRequest } from "../api/appointments";
import { invalidateAppointmentRelated } from "../lib/invalidation";
import type { AppointmentDetail } from "../types/appointment";


export function useAppointments() {
    return useQuery({
        queryKey: ["appointments"],
        queryFn: appointmentsApi.list 
    })
}

export function useCreateAppointment() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateAppointmentRequest) => appointmentsApi.create(data),
        onSuccess: (_data, variables) => {invalidateAppointmentRelated(queryClient, { clientId: variables.client_id });
    }
    })
}

export function useAppointmentUpcoming() {
    return useQuery({
        queryKey: ["appointments", "upcoming"],
        queryFn: appointmentsApi.listUpcoming 
    })
}

export function useAppointment(id: string) {
    return useQuery({
        queryKey: ["appointments", id],
        queryFn: () => appointmentsApi.get(id),
        enabled: !!id,
    })
}

export function useUpdateAppointment(id: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: UpdateAppointmentRequest) => appointmentsApi.update(id, data),
        onSuccess: () => {
         const cached = queryClient.getQueryData<AppointmentDetail>(["appointments", id]);
      invalidateAppointmentRelated(queryClient, {
        appointmentId: id,
        clientId: cached?.appointment.client_id,
      });
        }
    })
}

export function useDeleteAppointment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => appointmentsApi.delete(id),
        onSuccess: (_data, id) => {
           const cached = queryClient.getQueryData<AppointmentDetail>(["appointments", id]);
      invalidateAppointmentRelated(queryClient, {
        appointmentId: id,
        clientId: cached?.appointment.client_id,
      });
        }
    })
}

export function useAppointmentTotal(id: string) {
    return useQuery({
        queryKey: ["appointments", id, "total"],
        queryFn: () => appointmentsApi.getTotal(id),
        enabled: !!id
    })
}

export function useAddService(appointmentId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: AddServiceRequest) =>
            appointmentsApi.addService(appointmentId, data),
        onSuccess: () =>  {
      const cached = queryClient.getQueryData<AppointmentDetail>(["appointments", appointmentId]);
      invalidateAppointmentRelated(queryClient, {
        appointmentId,
        clientId: cached?.appointment.client_id,
      });
    },
    });
}

export function useRemoveService(appointmentId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (serviceId: string) =>
            appointmentsApi.removeService(appointmentId, serviceId),
        onSuccess: () => {
      const cached = queryClient.getQueryData<AppointmentDetail>(["appointments", appointmentId]);
      invalidateAppointmentRelated(queryClient, {
        appointmentId,
        clientId: cached?.appointment.client_id,
      });
    },
    });
}

// --- Discounts ---

export function useAddDiscount(appointmentId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: AddDiscountRequest) =>
            appointmentsApi.addDiscount(appointmentId, data),
        onSuccess: () => {
      const cached = queryClient.getQueryData<AppointmentDetail>(["appointments", appointmentId]);
      invalidateAppointmentRelated(queryClient, {
        appointmentId,
        clientId: cached?.appointment.client_id,
      });
    },
    });
}

export function useRemoveDiscount(appointmentId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (discountId: string) =>
            appointmentsApi.removeDiscount(appointmentId, discountId),
       onSuccess: () => {
      const cached = queryClient.getQueryData<AppointmentDetail>(["appointments", appointmentId]);
      invalidateAppointmentRelated(queryClient, {
        appointmentId,
        clientId: cached?.appointment.client_id,
      });
    },

    });
}