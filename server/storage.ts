import {
  users,
  gameStats,
  dailyTasks,
  transactions,
  referrals,
  gameSessions,
  type User,
  type UpsertUser,
  type GameStats,
  type InsertGameStats,
  type DailyTask,
  type InsertDailyTask,
  type Transaction,
  type InsertTransaction,
  type Referral,
  type InsertReferral,
  type GameSession,
  type InsertGameSession,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, sum } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Game stats operations
  getGameStats(userId: string): Promise<GameStats[]>;
  updateGameStats(userId: string, gameType: string, won: boolean, winAmount: string): Promise<void>;
  
  // Daily tasks operations
  getDailyTasks(userId: string, date: string): Promise<DailyTask[]>;
  createDailyTasks(userId: string, date: string): Promise<void>;
  completeTask(userId: string, taskType: string, date: string): Promise<DailyTask | undefined>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  
  // Balance operations
  updateUserBalance(userId: string, llamaAmount: string, ticketAmount: number): Promise<void>;
  convertCurrency(userId: string, llamaAmount: string, direction: 'llama_to_tickets' | 'tickets_to_llama'): Promise<void>;
  
  // Referral operations
  createReferral(referral: InsertReferral): Promise<Referral>;
  getUserReferrals(userId: string): Promise<Referral[]>;
  
  // Game session operations
  createGameSession(session: InsertGameSession): Promise<GameSession>;
  
  // Leaderboard operations
  getTopEarners(limit?: number): Promise<Array<User & { totalEarnings: string }>>;
  getTopGameWinners(limit?: number): Promise<Array<User & { totalWins: number }>>;
  getTopReferrers(limit?: number): Promise<Array<User & { referralCount: number }>>;
  
  // Mining operations
  feedLarry(userId: string): Promise<void>;
  claimMining(userId: string): Promise<string>;
  updateMiningProgress(userId: string): Promise<User>;
  
  // Shop operations
  getShopItems(): Promise<ShopItem[]>;
  purchaseItem(userId: string, itemId: string): Promise<void>;
  getUserPurchases(userId: string): Promise<UserPurchase[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getGameStats(userId: string): Promise<GameStats[]> {
    return await db.select().from(gameStats).where(eq(gameStats.userId, userId));
  }

  async updateGameStats(userId: string, gameType: string, won: boolean, winAmount: string): Promise<void> {
    const existing = await db
      .select()
      .from(gameStats)
      .where(and(eq(gameStats.userId, userId), eq(gameStats.gameType, gameType)))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(gameStats)
        .set({
          gamesPlayed: sql`games_played + 1`,
          gamesWon: won ? sql`games_won + 1` : sql`games_won`,
          totalWinnings: sql`total_winnings + ${winAmount}`,
          highestWin: won && parseFloat(winAmount) > parseFloat(existing[0].highestWin || "0") 
            ? winAmount 
            : existing[0].highestWin,
          updatedAt: new Date(),
        })
        .where(and(eq(gameStats.userId, userId), eq(gameStats.gameType, gameType)));
    } else {
      await db.insert(gameStats).values({
        userId,
        gameType,
        gamesPlayed: 1,
        gamesWon: won ? 1 : 0,
        totalWinnings: winAmount,
        highestWin: won ? winAmount : "0",
      });
    }
  }

  async getDailyTasks(userId: string, date: string): Promise<DailyTask[]> {
    return await db
      .select()
      .from(dailyTasks)
      .where(and(eq(dailyTasks.userId, userId), eq(dailyTasks.date, date)));
  }

  async createDailyTasks(userId: string, date: string): Promise<void> {
    const tasks = [
      { taskType: 'daily_spit', reward: '50' },
      { taskType: 'check_in', reward: '25' },
      { taskType: 'social', reward: '100' },
      { taskType: 'invite', reward: '200' },
    ];

    for (const task of tasks) {
      await db.insert(dailyTasks).values({
        userId,
        taskType: task.taskType,
        reward: task.reward,
        date,
      }).onConflictDoNothing();
    }
  }

  async completeTask(userId: string, taskType: string, date: string): Promise<DailyTask | undefined> {
    const [task] = await db
      .update(dailyTasks)
      .set({
        completed: true,
        completedAt: new Date(),
      })
      .where(
        and(
          eq(dailyTasks.userId, userId),
          eq(dailyTasks.taskType, taskType),
          eq(dailyTasks.date, date),
          eq(dailyTasks.completed, false)
        )
      )
      .returning();

    if (task) {
      // Update user balance
      await db
        .update(users)
        .set({
          llamaBalance: sql`llama_balance + ${task.reward}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      // Create transaction record
      await this.createTransaction({
        userId,
        type: 'task_reward',
        amount: task.reward,
        currency: 'LLAMA',
        description: `Daily task: ${taskType}`,
      });
    }

    return task;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [result] = await db.insert(transactions).values(transaction).returning();
    return result;
  }

  async getUserTransactions(userId: string, limit: number = 10): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async updateUserBalance(userId: string, llamaAmount: string, ticketAmount: number): Promise<void> {
    await db
      .update(users)
      .set({
        llamaBalance: sql`llama_balance + ${llamaAmount}`,
        ticketBalance: sql`ticket_balance + ${ticketAmount}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async convertCurrency(userId: string, llamaAmount: string, direction: 'llama_to_tickets' | 'tickets_to_llama'): Promise<void> {
    if (direction === 'llama_to_tickets') {
      const ticketAmount = parseInt(llamaAmount); // 1:1 conversion
      await db
        .update(users)
        .set({
          llamaBalance: sql`llama_balance - ${llamaAmount}`,
          ticketBalance: sql`ticket_balance + ${ticketAmount}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      await this.createTransaction({
        userId,
        type: 'convert',
        amount: `-${llamaAmount}`,
        currency: 'LLAMA',
        description: `Converted ${llamaAmount} LLAMA to ${ticketAmount} Tickets`,
      });

      await this.createTransaction({
        userId,
        type: 'convert',
        amount: ticketAmount.toString(),
        currency: 'TICKETS',
        description: `Converted ${llamaAmount} LLAMA to ${ticketAmount} Tickets`,
      });
    } else {
      const ticketAmount = parseInt(llamaAmount); // 1:1 conversion
      await db
        .update(users)
        .set({
          llamaBalance: sql`llama_balance + ${llamaAmount}`,
          ticketBalance: sql`ticket_balance - ${ticketAmount}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      await this.createTransaction({
        userId,
        type: 'convert',
        amount: llamaAmount,
        currency: 'LLAMA',
        description: `Converted ${ticketAmount} Tickets to ${llamaAmount} LLAMA`,
      });

      await this.createTransaction({
        userId,
        type: 'convert',
        amount: `-${ticketAmount}`,
        currency: 'TICKETS',
        description: `Converted ${ticketAmount} Tickets to ${llamaAmount} LLAMA`,
      });
    }
  }

  async createReferral(referral: InsertReferral): Promise<Referral> {
    const [result] = await db.insert(referrals).values(referral).returning();
    return result;
  }

  async getUserReferrals(userId: string): Promise<Referral[]> {
    return await db.select().from(referrals).where(eq(referrals.referrerId, userId));
  }

  async createGameSession(session: InsertGameSession): Promise<GameSession> {
    const [result] = await db.insert(gameSessions).values(session).returning();
    return result;
  }

  async getTopEarners(limit: number = 10): Promise<Array<User & { totalEarnings: string }>> {
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        llamaBalance: users.llamaBalance,
        ticketBalance: users.ticketBalance,
        referralCode: users.referralCode,
        referredBy: users.referredBy,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        totalEarnings: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} IN ('game_win', 'task_reward') THEN ${transactions.amount}::numeric ELSE 0 END), 0)::text`,
      })
      .from(users)
      .leftJoin(transactions, eq(users.id, transactions.userId))
      .groupBy(users.id)
      .orderBy(desc(sql`COALESCE(SUM(CASE WHEN ${transactions.type} IN ('game_win', 'task_reward') THEN ${transactions.amount}::numeric ELSE 0 END), 0)`))
      .limit(limit);

    return result;
  }

  async getTopGameWinners(limit: number = 10): Promise<Array<User & { totalWins: number }>> {
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        llamaBalance: users.llamaBalance,
        ticketBalance: users.ticketBalance,
        referralCode: users.referralCode,
        referredBy: users.referredBy,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        totalWins: sql<number>`COALESCE(SUM(${gameStats.gamesWon}), 0)`,
      })
      .from(users)
      .leftJoin(gameStats, eq(users.id, gameStats.userId))
      .groupBy(users.id)
      .orderBy(desc(sql`COALESCE(SUM(${gameStats.gamesWon}), 0)`))
      .limit(limit);

    return result;
  }

  async getTopReferrers(limit: number = 10): Promise<Array<User & { referralCount: number }>> {
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        llamaBalance: users.llamaBalance,
        ticketBalance: users.ticketBalance,
        referralCode: users.referralCode,
        referredBy: users.referredBy,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        referralCount: sql<number>`COALESCE(COUNT(${referrals.id}), 0)`,
      })
      .from(users)
      .leftJoin(referrals, eq(users.id, referrals.referrerId))
      .groupBy(users.id)
      .orderBy(desc(sql`COALESCE(COUNT(${referrals.id}), 0)`))
      .limit(limit);

    return result;
  }
}

export const storage = new DatabaseStorage();
