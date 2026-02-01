import { apiUrl } from "@/lib/api";

export async function fetchConversations() {
  const res = await fetch(apiUrl("/api/conversations"));
  if (!res.ok) throw new Error("Failed to fetch conversations");
  return res.json();
}

export async function fetchConversation(id: string) {
  const res = await fetch(apiUrl(`/api/conversations/${id}`));
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

export async function sendMessage(id: string, content: string) {
  const res = await fetch(apiUrl(`/api/conversations/${id}/messages`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  return res.json();
}
