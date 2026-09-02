import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clientsApi,
  type CreateClientRequest,
  type UpdateClientRequest,
} from "../api/clients";
import { invalidateClientRelated } from "../lib/invalidation";

export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: clientsApi.list,
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ["clients", id],
    queryFn: () => clientsApi.get(id),
    enabled: !!id,
  });
}

export function useClientAppointments(id: string) {
  return useQuery({
    queryKey: ["clients", id, "appointments"],
    queryFn: () => clientsApi.getAppointments(id),
    enabled: !!id,
  });
}

export function useClientSpent(id: string) {
  return useQuery({
    queryKey: ["clients", id, "spent"],
    queryFn: () => clientsApi.getTotalSpent(id),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClientRequest) => clientsApi.create(data),
    onSuccess: () => invalidateClientRelated(queryClient),
  });
}

export function useUpdateClient(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateClientRequest) => clientsApi.update(id, data),
    onSuccess: () => invalidateClientRelated(queryClient, id),
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientsApi.delete(id),
    onSuccess: () => invalidateClientRelated(queryClient),
  });
}
