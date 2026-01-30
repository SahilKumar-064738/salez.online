import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  companyName: text("company_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  status: text("status").notNull().default("new"), // new, interested, negotiation, paid, lost
  lastContactedAt: timestamp("last_contacted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id),
  status: text("status").notNull().default("waiting"), // new, waiting, follow-up-due, replied, closed
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  isAutoPaused: boolean("is_auto_paused").default(false),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id),
  content: text("content").notNull(),
  direction: text("direction").notNull(), // incoming, outgoing
  createdAt: timestamp("created_at").defaultNow(),
});

export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  content: text("content").notNull(), // Supports variables like {{name}}
  category: text("category").notNull(), // follow-up, reminder, payment
});

export const followUpRules = pgTable("follow_up_rules", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  delayHours: integer("delay_hours").notNull(),
  templateId: integer("template_id").references(() => templates.id),
  order: integer("order").notNull(),
});

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id),
  message: text("message").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  sent: boolean("sent").default(false),
  type: text("type").notNull().default("follow-up"), // follow-up, appointment, payment
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });
export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertTemplateSchema = createInsertSchema(templates).omit({ id: true });
export const insertFollowUpRuleSchema = createInsertSchema(followUpRules).omit({ id: true });
export const insertReminderSchema = createInsertSchema(reminders).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Template = typeof templates.$inferSelect;
export type FollowUpRule = typeof followUpRules.$inferSelect;
export type Reminder = typeof reminders.$inferSelect;
