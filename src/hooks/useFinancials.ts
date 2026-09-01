import { useQuery } from "@tanstack/react-query";
import { financialsApi } from "../api/financials";

export function useFinancials(start: Date | null, end: Date | null) {
  const startISO = start ? start.toISOString() : null;
  const endISO = end ? end.toISOString() : null;

  return useQuery({
    queryKey: ["financials", startISO, endISO],
    queryFn: () => financialsApi.get(startISO!, endISO!),
    enabled: !!startISO && !!endISO,
  });
}