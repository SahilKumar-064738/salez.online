import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.leads.list.path, async (req, res) => {
    const leads = await storage.getLeads(1);
    res.json(leads);
  });

  app.post(api.leads.create.path, async (req, res) => {
    try {
      const input = api.leads.create.input.parse(req.body);
      const lead = await storage.createLead(input);
      res.status(201).json(lead);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.conversations.list.path, async (req, res) => {
    const convs = await storage.getConversations(1);
    res.json(convs);
  });

  app.get(api.conversations.get.path, async (req, res) => {
    const conv = await storage.getConversation(Number(req.params.id));
    if (!conv) return res.status(404).json({ message: "Not found" });
    res.json(conv);
  });

  app.post(api.conversations.sendMessage.path, async (req, res) => {
    const msg = await storage.createMessage({
      conversationId: Number(req.params.id),
      content: req.body.content,
      direction: "outgoing"
    });
    res.status(201).json(msg);
  });

  app.get(api.templates.list.path, async (req, res) => {
    const items = await storage.getTemplates(1);
    res.json(items);
  });

  app.get(api.rules.list.path, async (req, res) => {
    const items = await storage.getRules(1);
    res.json(items);
  });

  app.get(api.reminders.list.path, async (req, res) => {
    const reminders = await storage.getReminders();
    res.json(reminders);
  });

  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingLeads = await storage.getLeads(0);
  if (existingLeads.length === 0) {
    console.log("Seeding founder-mode data...");
    
    const demoUser = await storage.createUser({
      email: "demo@example.com",
      password: "hashed_password",
      name: "Demo User",
      companyName: "Demo Corp"
    });

    const lead1 = await storage.createLead({
      userId: demoUser.id,
      name: "Rahul Gupta",
      phone: "+91 98765 43210",
      status: "new"
    });

    const lead2 = await storage.createLead({
      userId: demoUser.id,
      name: "Sneha Patel",
      phone: "+91 98765 12345",
      status: "interested"
    });

    const conv1 = await storage.createConversation({
      leadId: lead1.id,
      status: "waiting"
    });

    await storage.createMessage({
      conversationId: conv1.id,
      content: "Hi, I'm interested in your service.",
      direction: "incoming"
    });

    const temp1 = await storage.createTemplate({
      userId: demoUser.id,
      name: "Intro Follow-up",
      content: "Hi {{name}}, thanks for reaching out! How can we help?",
      category: "follow-up"
    });

    await storage.createRule({
      userId: demoUser.id,
      delayHours: 24,
      templateId: temp1.id,
      order: 1
    });

    await storage.createReminder({
      leadId: lead1.id,
      message: "Follow up on brochure",
      scheduledAt: new Date(Date.now() + 86400000),
      sent: false,
      type: "follow-up"
    });

    console.log("Founder-mode seeding complete!");
  }
}
