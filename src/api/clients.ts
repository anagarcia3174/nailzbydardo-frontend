import { api } from "./client";
import type { Client, ClientSummary } from "../types/client";
import type { Appointment } from "../types/appointment";

export interface CreateClientRequest {
  client_name: string;
  contact_method?: string | null;
  notes?: string | null;
  birthday?: string | null;
}

export type UpdateClientRequest = CreateClientRequest;

export const clientsApi = {
  list: () => api.get<ClientSummary[]>("/clients"),
  get: (id: string) => api.get<Client>(`/clients/${id}`),
  create: (data: CreateClientRequest) => api.post<Client>("/clients", data),
  update: (id: string, data: UpdateClientRequest) =>
    api.patch<Client>(`/clients/${id}`, data),
  delete: (id: string) => api.delete<void>(`/clients/${id}`),
  getAppointments: (id: string) =>
    api.get<Appointment[]>(`/clients/${id}/appointments`),
};