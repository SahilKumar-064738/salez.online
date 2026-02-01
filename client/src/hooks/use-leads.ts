import { api, buildUrl, type InsertLead } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { getLeads } from "@/services/leads";
import { useQuery } from "@tanstack/react-query";
import { fetchLeads } from "@/services/leads";
import { useQueryClient } from "@tanstack/react-query";

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
           const error = api.leads.create.responses[400].parse(await res.json());
           throw new Error(error.message);
        }
        throw new Error("Failed to create lead");
      }
      return api.leads.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.leads.list.path] });
      toast({
        title: "Lead Created",
        description: "Successfully added new lead to the system.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });
}
