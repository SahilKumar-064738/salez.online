import { z } from 'zod';
import {
  insertLeadSchema,
  insertReminderSchema,
  insertTemplateSchema,
  insertFollowUpRuleSchema,
} from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound:   z.object({ message: z.string() }),
  internal:   z.object({ message: z.string() }),
  auth:       z.object({ message: z.string() }),
};

export const api = {
  auth: {
    login:  { method: 'POST' as const, path: '/api/auth/login',  input: z.object({ email: z.string().email(), password: z.string().min(6) }) },
    signup: { method: 'POST' as const, path: '/api/auth/signup', input: z.object({ name: z.string().min(2), companyName: z.string().min(2), email: z.string().email(), password: z.string().min(6) }) },
    me:     { method: 'GET'  as const, path: '/api/auth/me' },
    logout: { method: 'POST' as const, path: '/api/auth/logout' },
  },
  leads: {
    list:   { method: 'GET'    as const, path: '/api/leads' },
    create: { method: 'POST'   as const, path: '/api/leads',     input: insertLeadSchema },
    get:    { method: 'GET'    as const, path: '/api/leads/:id' },
    update: { method: 'PATCH'  as const, path: '/api/leads/:id', input: z.object({ name: z.string().optional(), phone: z.string().optional(), status: z.string().optional() }) },
    delete: { method: 'DELETE' as const, path: '/api/leads/:id' },
  },
  conversations: {
    list:        { method: 'GET'  as const, path: '/api/conversations' },
    get:         { method: 'GET'  as const, path: '/api/conversations/:id' },
    sendMessage: { method: 'POST' as const, path: '/api/conversations/:id/messages', input: z.object({ content: z.string() }) },
  },
  templates: {
    list:   { method: 'GET'    as const, path: '/api/templates' },
    create: { method: 'POST'   as const, path: '/api/templates',     input: insertTemplateSchema },
    update: { method: 'PATCH'  as const, path: '/api/templates/:id', input: z.object({ name: z.string().optional(), content: z.string().optional(), category: z.string().optional() }) },
    delete: { method: 'DELETE' as const, path: '/api/templates/:id' },
  },
  rules: {
    list:   { method: 'GET'    as const, path: '/api/rules' },
    create: { method: 'POST'   as const, path: '/api/rules',     input: insertFollowUpRuleSchema },
    delete: { method: 'DELETE' as const, path: '/api/rules/:id' },
  },
  reminders: {
    list:   { method: 'GET'    as const, path: '/api/reminders' },
    create: { method: 'POST'   as const, path: '/api/reminders',     input: insertReminderSchema },
    delete: { method: 'DELETE' as const, path: '/api/reminders/:id' },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) Object.entries(params).forEach(([k, v]) => { url = url.replace(`:${k}`, String(v)); });
  return url;
}
