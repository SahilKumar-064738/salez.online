import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { fetchLeads, createLead, updateLead, deleteLead } from "@/services/leads";

export function useLeads() {
  return useQuery({ queryKey: ["leads"], queryFn: fetchLeads });
}

export function useCreateLead() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: { name: string; phone: string; status?: string }) => createLead(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Lead Created", description: "New lead added successfully." });
    },
    onError: (e: Error) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; name?: string; phone?: string; status?: string }) => updateLead(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Lead Updated", description: "Changes saved." });
    },
    onError: (e: Error) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: number) => deleteLead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Lead Deleted", description: "Lead removed." });
    },
    onError: (e: Error) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });
}
