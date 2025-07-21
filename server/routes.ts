import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBetSchema, updateBetSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all bets
  app.get("/api/bets", async (req, res) => {
    try {
      const bets = await storage.getBets();
      res.json(bets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bets" });
    }
  });

  // Get a specific bet
  app.get("/api/bets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid bet ID" });
      }

      const bet = await storage.getBet(id);
      if (!bet) {
        return res.status(404).json({ message: "Bet not found" });
      }

      res.json(bet);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bet" });
    }
  });

  // Create a new bet
  app.post("/api/bets", async (req, res) => {
    try {
      const betData = insertBetSchema.parse(req.body);
      const bet = await storage.createBet(betData);
      res.status(201).json(bet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create bet" });
    }
  });

  // Update a bet
  app.patch("/api/bets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid bet ID" });
      }

      const updateData = updateBetSchema.parse({ ...req.body, id });
      const updatedBet = await storage.updateBet(updateData);
      
      if (!updatedBet) {
        return res.status(404).json({ message: "Bet not found" });
      }

      res.json(updatedBet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update bet" });
    }
  });

  // Delete a bet
  app.delete("/api/bets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid bet ID" });
      }

      const deleted = await storage.deleteBet(id);
      if (!deleted) {
        return res.status(404).json({ message: "Bet not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete bet" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
