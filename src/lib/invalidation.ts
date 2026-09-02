import type { QueryClient } from "@tanstack/react-query";

/**
 * Call this after any mutation that could change appointment data —
 * creating/updating/deleting an appointment, or adding/removing a
 * service or discount on one. Appointments feed into: the appointment
 * list, a specific appointment's detail + total, the client's
 * appointment history + spend, and both dashboard/financials summaries.
 *
 * appointmentId / clientId are optional because not every caller has
 * both on hand (e.g. create only has clientId from the request body,
 * not an appointmentId yet).
 */
export function invalidateAppointmentRelated(
  queryClient: QueryClient,
  opts: { appointmentId?: string; clientId?: string } = {},
) {
  queryClient.invalidateQueries({ queryKey: ["appointments"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  queryClient.invalidateQueries({ queryKey: ["financials"] });

  if (opts.appointmentId) {
    queryClient.invalidateQueries({
      queryKey: ["appointments", opts.appointmentId],
    });
    queryClient.invalidateQueries({
      queryKey: ["appointments", opts.appointmentId, "total"],
    });
  }

  if (opts.clientId) {
    queryClient.invalidateQueries({
      queryKey: ["clients", opts.clientId, "appointments"],
    });
    queryClient.invalidateQueries({
      queryKey: ["clients", opts.clientId, "spent"],
    });
  }
}

/** Call after creating/deleting an expense — feeds dashboard + financials. */
export function invalidateExpenseRelated(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["expenses"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  queryClient.invalidateQueries({ queryKey: ["financials"] });
}

/** Call after create/update/delete on a client. */
export function invalidateClientRelated(
  queryClient: QueryClient,
  clientId?: string,
) {
  queryClient.invalidateQueries({ queryKey: ["clients"] });
  if (clientId) {
    queryClient.invalidateQueries({ queryKey: ["clients", clientId] });
  }
}
