import type { Service } from "../types/service";
import { api } from "./client";

export interface CreateServiceRequest {
  service_name: string;
  service_price: number;
}

export type UpdateServiceRequest = CreateServiceRequest;

export const servicesApi = {
  list: () => api.get<Service[]>("/services"),
  create: (data: CreateServiceRequest) =>
    api.post<Service>("/services", data),
  update: (id: string, data: UpdateServiceRequest) =>
    api.patch<Service>(`/services/${id}`, data),
  delete: (id: string) => api.delete<void>(`/services/${id}`),
};