import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  decimal,
  boolean,
  uuid
} from "drizzle-orm/pg-core";
import { 
  shopItems,
  userPurchases
} from "@shared/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  llamaBalance: decimal("llama_balance", { precision: 20, scale: 8 }).default("0"),
  ticketBalance: integer("ticket_balance").default(0),
  referralCode: varchar("referral_code").unique(),
  referredBy: varchar("referred_by"),
  // Mining system fields
  miningRate: decimal("mining_rate", { precision: 10, scale: 4 }).default("1.0"), // LLAMA per hour
  miningCapacity: decimal("mining_capacity", { precision: 20, scale: 8 }).default("100"), // max LLAMA to mine
  currentMining: decimal("current_mining", { precision: 20, scale: 8 }).default("0"), // current mined amount
  lastFeedTime: timestamp("last_feed_time").defaultNow(),
  hungerLevel: integer("hunger_level").default(100), // 0-100, affects mining rate
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Game statistics
export const gameStats = pgTable("game_stats", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameType: varchar("game_type").notNull(), // 'spitball', 'alpaca', 'llama_drama', 'fleece_race', 'probable_llama'
  gamesPlayed: integer("games_played").default(0),
  gamesWon: integer("games_won").default(0),
  totalWinnings: decimal("total_winnings", { precision: 20, scale: 8 }).default("0"),
  highestWin: decimal("highest_win", { precision: 20, scale: 8 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Daily tasks
export const dailyTasks = pgTable("daily_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  taskType: varchar("task_type").notNull(), // 'daily_spit', 'check_in', 'social', 'invite'
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  reward: decimal("reward", { precision: 20, scale: 8 }).notNull(),
  date: varchar("date").notNull(), // YYYY-MM-DD format
  createdAt: timestamp("created_at").defaultNow(),
});

// Transactions
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'game_win', 'game_loss', 'task_reward', 'deposit', 'withdraw', 'convert'
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  currency: varchar("currency").notNull(), // 'LLAMA' or 'TICKETS'
  description: text("description"),
  gameType: varchar("game_type"), // for game-related transactions
  createdAt: timestamp("created_at").defaultNow(),
});

// Referrals
export const referrals = pgTable("referrals", {
  id: uuid("id").primaryKey().defaultRandom(),
  referrerId: varchar("referrer_id").notNull().references(() => users.id),
  referredId: varchar("referred_id").notNull().references(() => users.id),
  reward: decimal("reward", { precision: 20, scale: 8 }).default("200"),
  claimed: boolean("claimed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Game sessions (for tracking individual game plays)
export const gameSessions = pgTable("game_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameType: varchar("game_type").notNull(),
  betAmount: decimal("bet_amount", { precision: 20, scale: 8 }).notNull(),
  winAmount: decimal("win_amount", { precision: 20, scale: 8 }).default("0"),
  result: varchar("result").notNull(), // 'win' or 'loss'
  gameData: jsonb("game_data"), // store game-specific data
  createdAt: timestamp("created_at").defaultNow(),
});

// Shop items
export const shopItems = pgTable("shop_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 20, scale: 8 }).notNull(),
  currency: varchar("currency").notNull(), // 'LLAMA' or 'TICKETS'
  itemType: varchar("item_type").notNull(), // 'food', 'upgrade'
  effectType: varchar("effect_type").notNull(), // 'mining_rate', 'capacity', 'hunger'
  effectValue: decimal("effect_value", { precision: 10, scale: 4 }).notNull(),
  duration: integer("duration"), // hours for temporary effects, null for permanent
  icon: varchar("icon").default("🍎"),
  available: boolean("available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User purchases
export const userPurchases = pgTable("user_purchases", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  shopItemId: uuid("shop_item_id").notNull().references(() => shopItems.id),
  purchasedAt: timestamp("purchased_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // for temporary effects
  active: boolean("active").default(true),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGameStatsSchema = createInsertSchema(gameStats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDailyTaskSchema = createInsertSchema(dailyTasks).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});

export const insertGameSessionSchema = createInsertSchema(gameSessions).omit({
  id: true,
  createdAt: true,
});

export const insertShopItemSchema = createInsertSchema(shopItems).omit({
  id: true,
  createdAt: true,
});

export const insertUserPurchaseSchema = createInsertSchema(userPurchases).omit({
  id: true,
  purchasedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type GameStats = typeof gameStats.$inferSelect;
export type InsertGameStats = z.infer<typeof insertGameStatsSchema>;
export type DailyTask = typeof dailyTasks.$inferSelect;
export type InsertDailyTask = z.infer<typeof insertDailyTaskSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type GameSession = typeof gameSessions.$inferSelect;
export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type ShopItem = typeof shopItems.$inferSelect;
export type InsertShopItem = z.infer<typeof insertShopItemSchema>;
export type UserPurchase = typeof userPurchases.$inferSelect;
export type InsertUserPurchase = z.infer<typeof insertUserPurchaseSchema>;
