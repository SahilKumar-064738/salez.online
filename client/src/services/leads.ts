import { apiUrl } from "@/lib/api";

export async function fetchLeads() {
  const res = await fetch(apiUrl("/api/leads"));
  if (!res.ok) throw new Error("Failed to fetch leads");
  return res.json();
}

export async function createLead(data: unknown) {
  const res = await fetch(apiUrl("/api/leads"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create lead");
  }

  return res.json();
}
