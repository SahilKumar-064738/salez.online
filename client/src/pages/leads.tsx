import { useLeads } from "@/hooks/use-leads";

export default function LeadsPage() {
  const { data, isLoading, error } = useLeads();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading leads</div>;

  return (
    <div className="space-y-4">
      {data?.map((lead: any) => (
        <div key={lead.id} className="p-4 border rounded">
          <div>{lead.phone}</div>
          <div className="text-sm text-gray-500">{lead.status}</div>
        </div>
      ))}
    </div>
  );
}
