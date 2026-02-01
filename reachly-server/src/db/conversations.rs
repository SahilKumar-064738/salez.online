import { api, type InsertLead } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { fetchLeads } from "@/services/leads";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

export function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: fetchLeads,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertLead) => {
      const res = await fetch(api.leads.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.leads.create.responses[400].parse(
            await res.json()
          );
          throw new Error(error.message);
        }
        throw new Error("Failed to create lead");
      }

      return api.leads.create.responses[201].parse(await res.json());
    },

    onSuccess: () => {
      // ✅ must match ["leads"]
      queryClient.invalidateQueries({ queryKey: ["leads"] });

      toast({
        title: "Lead Created",
        description: "Successfully added new lead.",
      });
    },

    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });
}
