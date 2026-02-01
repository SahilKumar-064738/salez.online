import { api, buildUrl } from "@shared/routes";
import { apiUrl } from "@/lib/api";

export async function fetchLeads() {
  const res = await fetch(apiUrl("/api/leads"));
  if (!res.ok) throw new Error("Failed to fetch leads");
  return res.json();
}

export async function getLeads() {
  const res = await fetch(
    API_BASE + buildUrl(api.leads.list.path),
    {
      credentials: "include", // future auth
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch leads");
  }

  return res.json();
}

export async function createLead(data: unknown) {
  const res = await fetch(
    API_BASE + buildUrl(api.leads.create.path),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to create lead");
  }

  return res.json();
}
