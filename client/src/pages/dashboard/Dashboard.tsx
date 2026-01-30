import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Bell, 
  Settings, 
  Users, 
  LogOut, 
  Plus,
  Search,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLeadSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLeads, useCreateLead } from "@/hooks/use-leads";
import { useState } from "react";

// Sidebar Component
function Sidebar() {
  const [location] = useLocation();
  const links = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/leads", label: "Leads", icon: Users },
    { href: "/dashboard/reminders", label: "Reminders", icon: Bell },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="w-64 border-r bg-white h-full hidden md:flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
          <MessageSquare className="h-6 w-6 text-primary" />
          <span>AutoReply</span>
        </div>
      </div>
      <div className="flex-1 px-4 space-y-1">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              location === link.href 
                ? "bg-green-50 text-primary" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}>
              <link.icon className="h-5 w-5" />
              {link.label}
            </div>
          </Link>
        ))}
      </div>
      <div className="p-4 border-t border-slate-100">
        <Link href="/auth/login">
          <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </Button>
        </Link>
      </div>
    </div>
  );
}

// Add Lead Dialog
function AddLeadDialog() {
  const [open, setOpen] = useState(false);
  const createLead = useCreateLead();
  
  const form = useForm<z.infer<typeof insertLeadSchema>>({
    resolver: zodResolver(insertLeadSchema),
    defaultValues: {
      name: "",
      phone: "",
      status: "new",
    },
  });

  function onSubmit(values: z.infer<typeof insertLeadSchema>) {
    createLead.mutate(values, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>Enter the lead details to start automation.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 234 567 8900" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={createLead.isPending} className="w-full bg-primary text-white hover:bg-primary/90">
              {createLead.isPending ? "Adding..." : "Add Lead"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Stats Cards
function StatsCards() {
  const { data: leads } = useLeads();
  
  const total = leads?.length || 0;
  const interested = leads?.filter(l => l.status === 'interested').length || 0;
  const newLeads = leads?.filter(l => l.status === 'new').length || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">Total Leads</CardTitle>
          <Users className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{total}</div>
          <p className="text-xs text-green-600 mt-1 flex items-center">
            <span className="bg-green-100 px-1 rounded mr-1">↑ 12%</span> from last month
          </p>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">Active Follow-ups</CardTitle>
          <Clock className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{newLeads}</div>
          <p className="text-xs text-slate-400 mt-1">Pending response</p>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">Converted</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{interested}</div>
          <p className="text-xs text-slate-400 mt-1">Marked as interested</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Leads Table
function LeadsTable() {
  const { data: leads, isLoading } = useLeads();

  if (isLoading) return <div className="text-center py-12 text-slate-400">Loading leads...</div>;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Recent Activity</h3>
        <div className="relative w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
           <Input placeholder="Search leads..." className="pl-9 h-9 bg-slate-50 border-transparent focus:bg-white focus:border-primary/20" />
        </div>
      </div>
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
          <tr>
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Last Contact</th>
            <th className="px-6 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {leads?.map((lead) => (
            <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 font-medium text-slate-900">
                <div className="flex flex-col">
                  <span>{lead.name}</span>
                  <span className="text-xs text-slate-400 font-normal">{lead.phone}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                  lead.status === 'interested' ? 'bg-green-100 text-green-800' :
                  lead.status === 'lost' ? 'bg-red-100 text-red-800' :
                  'bg-slate-100 text-slate-800'
                }`}>
                  {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-500">
                {lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleDateString() : 'Never'}
              </td>
              <td className="px-6 py-4 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Pause Automation</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
          {leads?.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                No leads found. Add your first lead to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:hidden">
          <div className="font-bold text-xl text-slate-900">AutoReply</div>
          <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-slate-500 text-sm">Overview of your automated follow-ups.</p>
            </div>
            <AddLeadDialog />
          </div>

          <StatsCards />
          <LeadsTable />
        </main>
      </div>
    </div>
  );
}
