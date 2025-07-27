import { users, bets, type User, type InsertUser, type Bet, type InsertBet, type UpdateBet } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getBets(): Promise<Bet[]>;
  getBet(id: number): Promise<Bet | undefined>;
  createBet(bet: InsertBet): Promise<Bet>;
  updateBet(bet: UpdateBet): Promise<Bet | undefined>;
  deleteBet(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bets: Map<number, Bet>;
  private currentUserId: number;
  private currentBetId: number;

  constructor() {
    this.users = new Map();
    this.bets = new Map();
    this.currentUserId = 1;
    this.currentBetId = 1;
    // Ready for your real betting data - no mock data
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getBets(): Promise<Bet[]> {
    return Array.from(this.bets.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getBet(id: number): Promise<Bet | undefined> {
    return this.bets.get(id);
  }

  async createBet(insertBet: InsertBet): Promise<Bet> {
    const id = this.currentBetId++;
    const bet: Bet = {
      id,
      date: insertBet.date,
      source: insertBet.source || null,
      location: insertBet.location || null,
      type: insertBet.type || null,
      stake: insertBet.stake,
      potentialReturn: insertBet.potentialReturn || null,
      actualReturn: insertBet.actualReturn || null,
      odds: insertBet.odds || null,
      notes: insertBet.notes || null,
      status: insertBet.status || "pending",
      playerProps: insertBet.playerProps || null,
      createdAt: new Date(),
    };
    this.bets.set(id, bet);
    return bet;
  }

  async updateBet(updateBet: UpdateBet): Promise<Bet | undefined> {
    const existingBet = this.bets.get(updateBet.id);
    if (!existingBet) return undefined;

    const updatedBet: Bet = { ...existingBet, ...updateBet };
    this.bets.set(updateBet.id, updatedBet);
    return updatedBet;
  }

  async deleteBet(id: number): Promise<boolean> {
    return this.bets.delete(id);
  }
}

export const storage = new MemStorage();
