import { StateCreator } from 'zustand';
import { 
  User, Share, Holding, Trade, Order, Pool, Screen, 
  DividendRecord, StakingRecord, BoostCooldown, Notification, 
  Quest, QuestType, ReferralTier, ReferralStats, ReferralAchievement,
  PoolActivity, PoolStats, PoolNotification, PoolHistoryEvent
} from '../types';

export interface UserSlice {
  user: User;
  screen: Screen;
  setScreen: (s: Screen) => void;
  updateUser: (partial: Partial<User>) => void;
  completeOnboarding: () => void;
  subscribePremium: () => string | null;
  checkPremiumExpiry: () => void;
}

export interface TradeSlice {
  shares: Share[];
  holdings: Holding[];
  trades: Trade[];
  orders: Order[];
  tradeModalShareId: string | null;
  activeEvent: { name: string; endsAt: number; modifier: number } | null;
  
  setTradeModal: (id: string | null) => void;
  updateSharePrices: () => void;
  executeTrade: (shareId: string, side: 'buy' | 'sell', amount: number, orderType: 'market' | 'limit', limitPrice?: number) => string | null;
  cancelOrder: (orderId: string) => void;
  getOrders: () => Order[];
  triggerEvent: () => void;
}

export interface EconomySlice {
  unclaimedDividends: number;
  dividendRecords: DividendRecord[];
  lastDividendCalc: number;
  nextDividendTime: number;
  stakingHistory: StakingRecord[];
  referralEarnings: number;
  referralRecords: any[]; // ReferralRecord[]
  referralEarningHistory: any[]; // ReferralEarningRecord[]

  setNextDividendTime: (time: number) => void;
  calculateDividends: () => void;
  claimDividends: () => void;
  stake: (amount: number) => void;
  unstake: () => void;
  getStakingReward: () => number;
  getStakingAPY: () => number;
  claimStakingReward: () => void;
  claimReferralEarnings: () => void;
  getReferralTier: () => ReferralTier;
  getReferralStats: () => ReferralStats;
  getReferralAchievements: () => ReferralAchievement[];
}

export interface PoolSlice {
  pools: Pool[];
  boostCooldowns: BoostCooldown;
  
  createPool: (name: string) => void;
  joinPool: (poolId: string) => void;
  leavePool: () => void;
  boostPool: () => string | null;
  inviteToPool: (userId: string) => string | null;
  promotePoolMember: (userId: string) => string | null;
  trackPoolActivity: (action: PoolActivity['action'], amount?: number) => void;
  getPoolStats: (poolId: string) => PoolStats | null;
  getPoolNotifications: (poolId: string) => PoolNotification[];
  markNotificationRead: (notificationId: string) => void;
  getPoolHistory: (poolId: string) => PoolHistoryEvent[];
  addPoolNotification: (poolId: string, type: PoolNotification['type'], message: string) => void;
  boostFriend: (shareId: string) => string | null;
  voteFriend: (shareId: string) => string | null;
  boostSelf: () => string | null;
}

export interface QuestSlice {
  dailyQuests: Quest[];
  updateQuestProgress: (type: QuestType, delta?: number) => void;
  claimQuestReward: (questId: string) => void;
  resetDailyQuests: () => void;
}

export interface NotificationSlice {
  notifications: Notification[];
  addNotification: (msg: string, type: 'info' | 'success' | 'warning') => void;
  clearNotifications: () => void;
}

export interface PersistSlice {
  persist: () => Promise<void>;
  initStore: () => Promise<void>;
}

export type GameState = UserSlice & TradeSlice & EconomySlice & PoolSlice & QuestSlice & NotificationSlice & PersistSlice;

export type GameSlice<T> = StateCreator<GameState, [], [], T>;
