import { useQuery } from "@tanstack/react-query";
import type { Folder } from "@shared/schema";

export function useFolders() {
  return useQuery<Folder[]>({
    queryKey: ["/api/folders"],
  });
}