import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTransactionSchema, insertGameSessionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Daily tasks routes
  app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const today = new Date().toISOString().split('T')[0];
      
      // Ensure daily tasks exist for today
      await storage.createDailyTasks(userId, today);
      
      const tasks = await storage.getDailyTasks(userId, today);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post('/api/tasks/:taskType/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { taskType } = req.params;
      const today = new Date().toISOString().split('T')[0];
      
      const completedTask = await storage.completeTask(userId, taskType, today);
      
      if (!completedTask) {
        return res.status(400).json({ message: "Task already completed or not found" });
      }
      
      res.json({ message: "Task completed", task: completedTask });
    } catch (error) {
      console.error("Error completing task:", error);
      res.status(500).json({ message: "Failed to complete task" });
    }
  });

  // Game routes
  app.post('/api/games/play', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { gameType, betAmount } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const betAmountNum = parseInt(betAmount);
      if ((user.ticketBalance || 0) < betAmountNum) {
        return res.status(400).json({ message: "Insufficient tickets" });
      }

      // Simple game logic - random win/loss with different probabilities per game
      const gameConfigs = {
        'spitball': { winChance: 0.4, maxMultiplier: 5 },
        'alpaca': { winChance: 0.3, maxMultiplier: 8 },
        'llama_drama': { winChance: 0.2, maxMultiplier: 15 },
        'fleece_race': { winChance: 0.35, maxMultiplier: 6 },
        'probable_llama': { winChance: 0.45, maxMultiplier: 3 },
      };

      const config = gameConfigs[gameType as keyof typeof gameConfigs];
      if (!config) {
        return res.status(400).json({ message: "Invalid game type" });
      }

      const won = Math.random() < config.winChance;
      const multiplier = won ? Math.random() * config.maxMultiplier + 1 : 0;
      const winAmount = won ? Math.floor(betAmountNum * multiplier) : 0;

      // Update balances
      await storage.updateUserBalance(userId, winAmount.toString(), -betAmountNum);

      // Update game stats
      await storage.updateGameStats(userId, gameType, won, winAmount.toString());

      // Create game session record
      await storage.createGameSession({
        userId,
        gameType,
        betAmount: betAmountNum.toString(),
        winAmount: winAmount.toString(),
        result: won ? 'win' : 'loss',
        gameData: { multiplier },
      });

      // Create transaction records
      await storage.createTransaction({
        userId,
        type: 'game_loss',
        amount: (-betAmountNum).toString(),
        currency: 'TICKETS',
        description: `Played ${gameType}`,
        gameType,
      });

      if (won) {
        await storage.createTransaction({
          userId,
          type: 'game_win',
          amount: winAmount.toString(),
          currency: 'LLAMA',
          description: `Won ${gameType}`,
          gameType,
        });
      }

      res.json({
        won,
        winAmount,
        multiplier: multiplier.toFixed(2),
        newBalance: {
          llama: (parseFloat(user.llamaBalance || "0") + winAmount).toString(),
          tickets: (user.ticketBalance || 0) - betAmountNum,
        }
      });
    } catch (error) {
      console.error("Error playing game:", error);
      res.status(500).json({ message: "Failed to play game" });
    }
  });

  // Currency conversion
  app.post('/api/convert', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amount, direction } = req.body;
      
      if (!amount || !direction) {
        return res.status(400).json({ message: "Amount and direction required" });
      }

      await storage.convertCurrency(userId, amount.toString(), direction);
      
      const updatedUser = await storage.getUser(userId);
      res.json({
        message: "Conversion successful",
        newBalance: {
          llama: updatedUser?.llamaBalance,
          tickets: updatedUser?.ticketBalance,
        }
      });
    } catch (error) {
      console.error("Error converting currency:", error);
      res.status(500).json({ message: "Failed to convert currency" });
    }
  });

  // Transactions
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const transactions = await storage.getUserTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Leaderboards
  app.get('/api/leaderboard/:type', async (req, res) => {
    try {
      const { type } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      
      let data;
      switch (type) {
        case 'earners':
          data = await storage.getTopEarners(limit);
          break;
        case 'winners':
          data = await storage.getTopGameWinners(limit);
          break;
        case 'referrers':
          data = await storage.getTopReferrers(limit);
          break;
        default:
          return res.status(400).json({ message: "Invalid leaderboard type" });
      }
      
      res.json(data);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Game stats
  app.get('/api/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getGameStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Referrals
  app.get('/api/referrals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const referrals = await storage.getUserReferrals(userId);
      res.json(referrals);
    } catch (error) {
      console.error("Error fetching referrals:", error);
      res.status(500).json({ message: "Failed to fetch referrals" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
