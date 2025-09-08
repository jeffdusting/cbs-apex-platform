import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Provider } from "@shared/schema";

export function useProviders() {
  return useQuery<Provider[]>({
    queryKey: ["/api/providers"],
  });
}

export function useUpdateProvider() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Provider> }) => {
      const response = await apiRequest('PATCH', `/api/providers/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
    }
  });
}
