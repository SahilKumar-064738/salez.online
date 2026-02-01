import { useState } from "react";
import { useLocation, Link } from "wouter";
import {
  LayoutDashboard, MessageSquare, Bell, Settings, Users, LogOut,
  Plus, Search, MoreVertical, CheckCircle2, Clock, MessageCircle,
  ArrowLeft, Send, Trash2, FileText, Zap, Edit2, X, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { useAuth, useLogout } from "@/hooks/use-auth";
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead } from "@/hooks/use-leads";
import { useConversations, useConversation, useSendMessage } from "@/hooks/use-conversations";
import { useTemplates, useCreateTemplate, useDeleteTemplate, useRules, useCreateRule, useDeleteRule, useReminders, useCreateReminder, useDeleteReminder } from "@/hooks/use-automation";

// ─── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar() {
  const [location] = useLocation();
  const logout = useLogout();
  const links = [
    { href: "/dashboard",               label: "Overview",      icon: LayoutDashboard },
    { href: "/dashboard/leads",         label: "Leads",         icon: Users },
    { href: "/dashboard/conversations", label: "Conversations", icon: MessageSquare },
    { href: "/dashboard/automation",    label: "Automation",    icon: Zap },
    { href: "/dashboard/reminders",     label: "Reminders",     icon: Bell },
    { href: "/dashboard/settings",      label: "Settings",      icon: Settings },
  ];

  return (
    <div className="w-64 border-r bg-white h-full hidden md:flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
          <MessageCircle className="h-6 w-6 text-primary" />
          <span>AutoReply</span>
        </div>
      </div>
      <div className="flex-1 px-4 space-y-1">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              location === link.href ? "bg-green-50 text-primary" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}>
              <link.icon className="h-5 w-5" />
              {link.label}
            </div>
          </Link>
        ))}
      </div>
      <div className="p-4 border-t border-slate-100">
        <Button variant="ghost" onClick={() => logout.mutate()} className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
          <LogOut className="h-4 w-4 mr-2" /> Log out
        </Button>
      </div>
    </div>
  );
}

// ─── Status Badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800",
    interested: "bg-green-100 text-green-800",
    negotiation: "bg-yellow-100 text-yellow-800",
    paid: "bg-emerald-100 text-emerald-800",
    lost: "bg-red-100 text-red-800",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-slate-100 text-slate-800"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Add Lead Dialog ────────────────────────────────────────────────────────
function AddLeadDialog() {
  const [open, setOpen] = useState(false);
  const create = useCreateLead();
  const schema = z.object({ name: z.string().min(1), phone: z.string().min(1) });
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { name: "", phone: "" } });

  function onSubmit(v: z.infer<typeof schema>) {
    create.mutate({ ...v, status: "new" }, { onSuccess: () => { setOpen(false); form.reset(); } });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" /> Add Lead
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add New Lead</DialogTitle><DialogDescription>Enter lead details to start tracking.</DialogDescription></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="+1 234 567 8900" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="submit" disabled={create.isPending} className="w-full bg-primary text-white hover:bg-primary/90">
              {create.isPending ? "Adding…" : "Add Lead"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-PAGES
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Overview ───────────────────────────────────────────────────────────────
function OverviewPage() {
  const { data: leads } = useLeads();
  const { data: conversations } = useConversations();
  const total       = leads?.length || 0;
  const newLeads    = leads?.filter((l: any) => l.status === "new").length || 0;
  const interested  = leads?.filter((l: any) => l.status === "interested").length || 0;
  const convCount   = conversations?.length || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm">Overview of your automated follow-ups.</p>
        </div>
        <AddLeadDialog />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Leads",    value: total,     sub: "All time",           icon: Users, color: "text-blue-500" },
          { label: "New Leads",      value: newLeads,  sub: "Awaiting contact",  icon: Clock, color: "text-amber-500" },
          { label: "Interested",     value: interested,sub: "In pipeline",       icon: CheckCircle2, color: "text-green-500" },
          { label: "Conversations",  value: convCount, sub: "Active threads",    icon: MessageSquare, color: "text-purple-500" },
        ].map((s, i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{s.label}</CardTitle>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{s.value}</div>
              <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Leads */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Leads</CardTitle>
          <Link href="/dashboard/leads" className="text-xs text-primary hover:underline">View all →</Link>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b">
              <tr><th className="px-6 py-3">Name</th><th className="px-6 py-3">Phone</th><th className="px-6 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads?.slice(0, 5).map((l: any) => (
                <tr key={l.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-3 font-medium text-slate-900">{l.name}</td>
                  <td className="px-6 py-3 text-slate-500">{l.phone}</td>
                  <td className="px-6 py-3"><StatusBadge status={l.status} /></td>
                </tr>
              ))}
              {(!leads || leads.length === 0) && (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">No leads yet. Add your first lead above.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Leads Page ─────────────────────────────────────────────────────────────
function LeadsPage() {
  const { data: leads, isLoading } = useLeads();
  const update = useUpdateLead();
  const remove = useDeleteLead();
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState("");

  const filtered = leads?.filter((l: any) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.phone.includes(search)
  ) || [];

  if (isLoading) return <div className="text-center py-12 text-slate-400">Loading leads…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-slate-900">Leads</h1><p className="text-slate-500 text-sm">Manage all your sales leads.</p></div>
        <AddLeadDialog />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or phone…" className="pl-9 h-9 bg-slate-50 border-transparent focus:bg-white focus:border-primary/20" />
          </div>
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} lead{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Last Contact</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((lead: any) => (
              <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{lead.name}</td>
                <td className="px-6 py-4 text-slate-500">{lead.phone}</td>
                <td className="px-6 py-4">
                  {editId === lead.id ? (
                    <div className="flex items-center gap-2">
                      <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="text-xs border rounded px-2 py-1 bg-white">
                        {["new","interested","negotiation","paid","lost"].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button onClick={() => { update.mutate({ id: lead.id, status: editStatus }); setEditId(null); }} className="text-green-600 hover:text-green-800"><CheckCircle2 className="h-4 w-4" /></button>
                      <button onClick={() => setEditId(null)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setEditId(lead.id); setEditStatus(lead.status); }}>
                      <StatusBadge status={lead.status} />
                      <Edit2 className="h-3 w-3 text-slate-300" />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs">
                  {lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleDateString() : "Never"}
                </td>
                <td className="px-6 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditId(lead.id); setEditStatus(lead.status); }}>Edit Status</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => remove.mutate(lead.id)}>Delete Lead</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No leads found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Conversations Page ─────────────────────────────────────────────────────
function ConversationsPage() {
  const { data: convos, isLoading } = useConversations();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (isLoading) return <div className="text-center py-12 text-slate-400">Loading conversations…</div>;

  if (selectedId !== null) {
    return <ConversationDetail id={selectedId} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-slate-900">Conversations</h1><p className="text-slate-500 text-sm">All WhatsApp threads with your leads.</p></div>
      <div className="space-y-3">
        {convos?.map((c: any) => {
          const lastMsg = c.messages?.[c.messages.length - 1];
          return (
            <div key={c.id} onClick={() => setSelectedId(c.id)} className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">Lead #{c.leadId}</div>
                    <div className="text-xs text-slate-400 truncate max-w-[200px]">{lastMsg?.content || "No messages"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={c.status} />
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </div>
              </div>
            </div>
          );
        })}
        {(!convos || convos.length === 0) && (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">No conversations yet. They appear when leads message you via WhatsApp.</div>
        )}
      </div>
    </div>
  );
}

function ConversationDetail({ id, onBack }: { id: number; onBack: () => void }) {
  const { data: conv, isLoading } = useConversation(id);
  const send = useSendMessage(id);
  const [msg, setMsg] = useState("");

  if (isLoading) return <div className="text-center py-12 text-slate-400">Loading…</div>;
  if (!conv) return <div className="text-center py-12 text-slate-400">Not found</div>;

  function handleSend() {
    if (!msg.trim()) return;
    send.mutate(msg.trim());
    setMsg("");
  }

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-700"><ArrowLeft className="h-5 w-5" /></button>
        <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center"><MessageSquare className="h-4 w-4 text-primary" /></div>
        <div><div className="font-semibold text-slate-900">Lead #{conv.leadId}</div><div className="text-xs text-slate-400"><StatusBadge status={conv.status} /></div></div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto bg-[#f0f2f5] rounded-xl p-4 space-y-3 mb-3">
        {conv.messages?.map((m: any) => (
          <div key={m.id} className={`flex ${m.direction === "outgoing" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] text-sm px-4 py-2 rounded-lg shadow-sm ${m.direction === "outgoing" ? "bg-[#dcf8c6] rounded-tr-none" : "bg-white rounded-tl-none border border-slate-100"}`}>
              {m.content}
              <div className="text-[10px] text-gray-500 text-right mt-1">{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
            </div>
          </div>
        ))}
        {conv.messages?.length === 0 && <div className="text-center text-slate-400 text-sm py-8">No messages yet</div>}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} placeholder="Type a message…" className="flex-1 rounded-lg" />
        <Button onClick={handleSend} disabled={send.isPending || !msg.trim()} className="bg-primary text-white hover:bg-primary/90">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Automation Page ────────────────────────────────────────────────────────
function AutomationPage() {
  const { data: templates } = useTemplates();
  const { data: rules }     = useRules();
  const createTpl            = useCreateTemplate();
  const deleteTpl            = useDeleteTemplate();
  const createRule           = useCreateRule();
  const deleteRule           = useDeleteRule();
  const { data: user }       = useAuth();

  const [newTpl, setNewTpl] = useState({ name: "", content: "", category: "follow-up" });
  const [showTplForm, setShowTplForm] = useState(false);
  const [newRule, setNewRule] = useState({ delayHours: 24, templateId: 0 });
  const [showRuleForm, setShowRuleForm] = useState(false);

  function addTemplate() {
    if (!newTpl.name || !newTpl.content) return;
    createTpl.mutate({ userId: user?.id || 1, ...newTpl }, { onSuccess: () => { setNewTpl({ name: "", content: "", category: "follow-up" }); setShowTplForm(false); } });
  }

  function addRule() {
    if (!newRule.templateId) return;
    const order = (rules?.length || 0) + 1;
    createRule.mutate({ userId: user?.id || 1, delayHours: newRule.delayHours, templateId: newRule.templateId, order }, { onSuccess: () => { setNewRule({ delayHours: 24, templateId: 0 }); setShowRuleForm(false); } });
  }

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-slate-900">Automation</h1><p className="text-slate-500 text-sm">Templates & follow-up rules that run automatically.</p></div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Templates */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Templates</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowTplForm(!showTplForm)}><Plus className="h-3 w-3 mr-1" /> New</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {showTplForm && (
              <div className="border rounded-lg p-3 space-y-2 bg-slate-50">
                <Input value={newTpl.name} onChange={e => setNewTpl({ ...newTpl, name: e.target.value })} placeholder="Template name" className="text-sm" />
                <select value={newTpl.category} onChange={e => setNewTpl({ ...newTpl, category: e.target.value })} className="w-full text-sm border rounded px-2 py-1.5 bg-white">
                  <option value="follow-up">Follow-up</option><option value="reminder">Reminder</option><option value="payment">Payment</option>
                </select>
                <textarea value={newTpl.content} onChange={e => setNewTpl({ ...newTpl, content: e.target.value })} placeholder="Hi {{name}}, just following up…" rows={3} className="w-full text-sm border rounded px-2 py-1.5 resize-none" />
                <div className="flex gap-2">
                  <Button size="sm" onClick={addTemplate} disabled={createTpl.isPending} className="bg-primary text-white text-xs">Add</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowTplForm(false)} className="text-xs">Cancel</Button>
                </div>
              </div>
            )}
            {templates?.map((t: any) => (
              <div key={t.id} className="flex items-start justify-between p-3 bg-white border rounded-lg">
                <div>
                  <div className="font-semibold text-sm text-slate-900">{t.name}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${t.category === "follow-up" ? "bg-blue-50 text-blue-700" : t.category === "payment" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{t.category}</span>
                  <p className="text-xs text-slate-400 mt-1 truncate max-w-[200px]">{t.content}</p>
                </div>
                <button onClick={() => deleteTpl.mutate(t.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            {(!templates || templates.length === 0) && !showTplForm && <p className="text-sm text-slate-400 text-center py-4">No templates yet.</p>}
          </CardContent>
        </Card>

        {/* Rules */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-amber-500" /> Follow-up Rules</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowRuleForm(!showRuleForm)}><Plus className="h-3 w-3 mr-1" /> New</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {showRuleForm && (
              <div className="border rounded-lg p-3 space-y-2 bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Wait</span>
                  <input type="number" value={newRule.delayHours} onChange={e => setNewRule({ ...newRule, delayHours: +e.target.value })} className="w-16 text-sm border rounded px-2 py-1" />
                  <span className="text-xs text-slate-500">hours, then send:</span>
                </div>
                <select value={newRule.templateId} onChange={e => setNewRule({ ...newRule, templateId: +e.target.value })} className="w-full text-sm border rounded px-2 py-1.5 bg-white">
                  <option value={0}>— pick template —</option>
                  {templates?.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <div className="flex gap-2">
                  <Button size="sm" onClick={addRule} disabled={createRule.isPending || !newRule.templateId} className="bg-primary text-white text-xs">Add Rule</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowRuleForm(false)} className="text-xs">Cancel</Button>
                </div>
              </div>
            )}
            {rules?.map((r: any, i: number) => {
              const tpl = templates?.find((t: any) => t.id === r.templateId);
              return (
                <div key={r.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <div>
                      <div className="text-sm text-slate-900">Wait <strong>{r.delayHours}h</strong> → Send <strong>{tpl?.name || "…"}</strong></div>
                      <div className="text-xs text-slate-400">{tpl?.category || ""}</div>
                    </div>
                  </div>
                  <button onClick={() => deleteRule.mutate(r.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              );
            })}
            {(!rules || rules.length === 0) && !showRuleForm && <p className="text-sm text-slate-400 text-center py-4">No rules yet. Add a template first, then create rules.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Reminders Page ─────────────────────────────────────────────────────────
function RemindersPage() {
  const { data: reminders } = useReminders();
  const { data: leads }     = useLeads();
  const create               = useCreateReminder();
  const remove               = useDeleteReminder();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ leadId: 0, message: "", scheduledAt: "", type: "follow-up" });

  function addReminder() {
    if (!form.leadId || !form.message || !form.scheduledAt) return;
    create.mutate(form, { onSuccess: () => { setForm({ leadId: 0, message: "", scheduledAt: "", type: "follow-up" }); setShowForm(false); } });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-slate-900">Reminders</h1><p className="text-slate-500 text-sm">Scheduled messages for your leads.</p></div>
        <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" /> New Reminder
        </Button>
      </div>

      {showForm && (
        <Card className="shadow-sm mb-6">
          <CardContent className="pt-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500">Lead</label>
                <select value={form.leadId} onChange={e => setForm({ ...form, leadId: +e.target.value })} className="w-full text-sm border rounded px-2 py-1.5 mt-1 bg-white">
                  <option value={0}>— select lead —</option>
                  {leads?.map((l: any) => <option key={l.id} value={l.id}>{l.name} ({l.phone})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full text-sm border rounded px-2 py-1.5 mt-1 bg-white">
                  <option value="follow-up">Follow-up</option><option value="appointment">Appointment</option><option value="payment">Payment</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Scheduled At</label>
              <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })} className="w-full text-sm border rounded px-2 py-1.5 mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Message</label>
              <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Hi {{name}}, this is a reminder…" rows={2} className="w-full text-sm border rounded px-2 py-1.5 mt-1 resize-none" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={addReminder} disabled={create.isPending} className="bg-primary text-white">Schedule</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {reminders?.map((r: any) => {
          const lead = leads?.find((l: any) => l.id === r.leadId);
          return (
            <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${r.sent ? "bg-green-100" : "bg-amber-100"}`}>
                  <Bell className={`h-4 w-4 ${r.sent ? "text-green-600" : "text-amber-600"}`} />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">{lead?.name || `Lead #${r.leadId}`}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{r.message}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.type === "follow-up" ? "bg-blue-50 text-blue-700" : r.type === "payment" ? "bg-green-50 text-green-700" : "bg-purple-50 text-purple-700"}`}>{r.type}</span>
                    <span className="text-xs text-slate-400">📅 {new Date(r.scheduledAt).toLocaleString()}</span>
                    {r.sent && <span className="text-xs text-green-600 font-medium">✓ Sent</span>}
                  </div>
                </div>
              </div>
              <button onClick={() => remove.mutate(r.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
            </div>
          );
        })}
        {(!reminders || reminders.length === 0) && !showForm && (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">No reminders scheduled. Click "New Reminder" to create one.</div>
        )}
      </div>
    </div>
  );
}

// ─── Settings Page ──────────────────────────────────────────────────────────
function SettingsPage() {
  const { data: user } = useAuth();

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-slate-900">Settings</h1><p className="text-slate-500 text-sm">Manage your account and preferences.</p></div>

      <div className="space-y-6 max-w-2xl">
        {/* Profile Card */}
        <Card className="shadow-sm">
          <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                {user?.name?.charAt(0) || "?"}
              </div>
              <div>
                <div className="font-semibold text-slate-900">{user?.name || "—"}</div>
                <div className="text-sm text-slate-500">{user?.email || "—"}</div>
                <div className="text-xs text-slate-400">{user?.companyName || "—"}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Connection */}
        <Card className="shadow-sm">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><MessageCircle className="h-4 w-4 text-green-600" /> WhatsApp Connection</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-slate-700">Webhook URL</div>
                <code className="text-xs text-slate-500 mt-1 block">POST /webhook</code>
              </div>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Not connected</span>
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Point your WhatsApp Business API webhook to <code className="bg-slate-100 px-1 rounded">http://your-domain:3000/webhook</code> with a JSON body containing <code className="bg-slate-100 px-1 rounded">from</code> and <code className="bg-slate-100 px-1 rounded">message</code> fields.
            </p>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="shadow-sm border-red-100">
          <CardHeader><CardTitle className="text-base text-red-600">Danger Zone</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-3">Permanently delete your account and all associated data.</p>
            <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">Delete Account</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD SHELL — nested route dispatcher
// ═══════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const [location] = useLocation();

  function renderPage() {
    if (location === "/dashboard/leads")         return <LeadsPage />;
    if (location === "/dashboard/conversations") return <ConversationsPage />;
    if (location === "/dashboard/automation")    return <AutomationPage />;
    if (location === "/dashboard/reminders")     return <RemindersPage />;
    if (location === "/dashboard/settings")      return <SettingsPage />;
    return <OverviewPage />;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:hidden">
          <div className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" /> AutoReply
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
