import { pgTable, text, serial, integer, decimal, timestamp, varchar, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const bets = pgTable("bets", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  source: varchar("source", { length: 50 }), // DraftKings, FanDuel, etc.
  location: varchar("location", { length: 50 }), // CA, NY, etc.
  type: varchar("type", { length: 50 }), // straight, parlay
  stake: decimal("stake", { precision: 10, scale: 2 }).notNull(),
  potentialReturn: decimal("potential_return", { precision: 10, scale: 2 }),
  actualReturn: decimal("actual_return", { precision: 10, scale: 2 }),
  odds: varchar("odds", { length: 20 }), // +150, -110, 2.50, etc.
  notes: text("notes"),
  status: varchar("status", { length: 20 }).default("pending"), // pending, won, lost
  playerProps: json("player_props"), // JSON array of player prop objects
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBetSchema = createInsertSchema(bets).omit({
  id: true,
  createdAt: true,
}).extend({
  date: z.string().transform((val) => new Date(val)),
  stake: z.string().transform((val) => val),
  potentialReturn: z.string().optional().transform((val) => val || null),
  actualReturn: z.string().optional().transform((val) => val || null),
  playerProps: z.array(z.object({
    id: z.string(),
    player: z.string(),
    prop: z.string(),
    result: z.string(),
    sport: z.string(),
    league: z.string(),
    sportsbook: z.string(),
    odds: z.string(),
  })).optional(),
});

export const updateBetSchema = insertBetSchema.partial().extend({
  id: z.number(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBet = z.infer<typeof insertBetSchema>;
export type Bet = typeof bets.$inferSelect;
export type UpdateBet = z.infer<typeof updateBetSchema>;
