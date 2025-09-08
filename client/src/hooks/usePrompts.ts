import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { PromptRequest } from "@shared/schema";

export function usePrompts() {
  const queryClient = useQueryClient();
  
  const createPrompt = useMutation({
    mutationFn: async (promptData: PromptRequest) => {
      const response = await apiRequest('POST', '/api/prompts', promptData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/costs"] });
    }
  });

  return {
    createPrompt
  };
}
