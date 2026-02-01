import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { fetchConversations, fetchConversation, sendMessage } from "@/services/conversations";

export function useConversations() {
  return useQuery({ queryKey: ["conversations"], queryFn: fetchConversations });
}

export function useConversation(id: number | undefined) {
  return useQuery({
    queryKey: ["conversations", id],
    queryFn: () => fetchConversation(id!),
    enabled: id !== undefined,
  });
}

export function useSendMessage(conversationId: number) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (content: string) => sendMessage(conversationId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations", conversationId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (e: Error) => toast({ variant: "destructive", title: "Send failed", description: e.message }),
  });
}
