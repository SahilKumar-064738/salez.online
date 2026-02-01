import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  
  fetchRules, createRule, deleteRule,
  fetchReminders, createReminder, deleteReminder,
} from "@/services/automation";
import {fetchTemplates, createTemplate, updateTemplate, deleteTemplate,} from "@/services/templates";
// ─── Templates ──────────────────────────────────────────────────────────────
export function useTemplates() {
  return useQuery({ queryKey: ["templates"], queryFn: fetchTemplates });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (d: { userId: number; name: string; content: string; category: string }) => createTemplate(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["templates"] }); toast({ title: "Template Created" }); },
    onError: (e: Error) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; name?: string; content?: string; category?: string }) => updateTemplate(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["templates"] }); toast({ title: "Template Updated" }); },
    onError: (e: Error) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: number) => deleteTemplate(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["templates"] }); toast({ title: "Template Deleted" }); },
    onError: (e: Error) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });
}

// ─── Rules ──────────────────────────────────────────────────────────────────
export function useRules() {
  return useQuery({ queryKey: ["rules"], queryFn: fetchRules });
}

export function useCreateRule() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (d: { userId: number; delayHours: number; templateId: number; order: number }) => createRule(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rules"] }); toast({ title: "Rule Added" }); },
    onError: (e: Error) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });
}

export function useDeleteRule() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: number) => deleteRule(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rules"] }); toast({ title: "Rule Deleted" }); },
    onError: (e: Error) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });
}

// ─── Reminders ──────────────────────────────────────────────────────────────
export function useReminders() {
  return useQuery({ queryKey: ["reminders"], queryFn: fetchReminders });
}

export function useCreateReminder() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (d: { leadId: number; message: string; scheduledAt: string; type?: string }) => createReminder(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reminders"] }); toast({ title: "Reminder Set" }); },
    onError: (e: Error) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });
}

export function useDeleteReminder() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: number) => deleteReminder(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reminders"] }); toast({ title: "Reminder Deleted" }); },
    onError: (e: Error) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });
}
