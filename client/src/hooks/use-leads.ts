import { z } from "zod";
import { insertLeadSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { fetchLeads, createLead } from "@/services/leads";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

type InsertLead = z.infer<typeof insertLeadSchema>;

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
    mutationFn: (data: InsertLead) => createLead(data),

    onSuccess: () => {
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
