import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import {
  users, leads, reminders, conversations, messages, templates, followUpRules,
  type User, type InsertUser,
  type Lead, type InsertLead,
  type Reminder, type InsertReminder,
  type Conversation, type InsertConversation,
  type Message, type InsertMessage,
  type Template, type InsertTemplate,
  type FollowUpRule, type InsertFollowUpRule
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Leads
  getLeads(userId: number): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;

  // Conversations
  getConversations(userId: number): Promise<(Conversation & { messages: Message[] })[]>;
  getConversation(id: number): Promise<(Conversation & { messages: Message[] }) | undefined>;
  createConversation(conv: InsertConversation): Promise<Conversation>;
  
  // Messages
  createMessage(msg: InsertMessage): Promise<Message>;

  // Templates
  getTemplates(userId: number): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;

  // Rules
  getRules(userId: number): Promise<FollowUpRule[]>;
  createRule(rule: InsertFollowUpRule): Promise<FollowUpRule>;

  // Reminders
  getReminders(leadId?: number): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getLeads(userId: number): Promise<Lead[]> {
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(insertLead).returning();
    return lead;
  }

  async getConversations(userId: number): Promise<(Conversation & { messages: Message[] })[]> {
    const convs = await db.select().from(conversations);
    const results = [];
    for (const conv of convs) {
      const msgs = await db.select().from(messages).where(eq(messages.conversationId, conv.id)).orderBy(messages.createdAt);
      results.push({ ...conv, messages: msgs });
    }
    return results;
  }

  async getConversation(id: number): Promise<(Conversation & { messages: Message[] }) | undefined> {
    const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
    if (!conv) return undefined;
    const msgs = await db.select().from(messages).where(eq(messages.conversationId, conv.id)).orderBy(messages.createdAt);
    return { ...conv, messages: msgs };
  }

  async createConversation(conv: InsertConversation): Promise<Conversation> {
    const [result] = await db.insert(conversations).values(conv).returning();
    return result;
  }

  async createMessage(msg: InsertMessage): Promise<Message> {
    const [result] = await db.insert(messages).values(msg).returning();
    // Update conversation last message time
    if (msg.conversationId) {
      await db.update(conversations)
        .set({ lastMessageAt: new Date() })
        .where(eq(conversations.id, msg.conversationId));
    }
    return result;
  }

  async getTemplates(userId: number): Promise<Template[]> {
    return await db.select().from(templates);
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const [result] = await db.insert(templates).values(template).returning();
    return result;
  }

  async getRules(userId: number): Promise<FollowUpRule[]> {
    return await db.select().from(followUpRules).orderBy(followUpRules.order);
  }

  async createRule(rule: InsertFollowUpRule): Promise<FollowUpRule> {
    const [result] = await db.insert(followUpRules).values(rule).returning();
    return result;
  }

  async getReminders(leadId?: number): Promise<Reminder[]> {
    if (leadId) {
      return await db.select().from(reminders).where(eq(reminders.leadId, leadId));
    }
    return await db.select().from(reminders);
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const [reminder] = await db.insert(reminders).values(insertReminder).returning();
    return reminder;
  }
}

export const storage = new DatabaseStorage();
