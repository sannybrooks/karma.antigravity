/* ===== LocalStorage Data Service Implementation ===== */
/* Текущая реализация для прототипирования.
   В будущем будет заменена на ApiService с PostgreSQL. */

import type { IDataService, IPersistData } from './dataService';
import type {
  User,
  Share,
  Holding,
  Trade,
  Order,
  Pool,
  DividendRecord,
  Quest,
  BoostCooldown,
  ReferralRecord,
  ReferralEarningRecord,
  StakingRecord,
} from '../types';
import { defaultShares } from '../store/initialState';

export class LocalStorageService implements IDataService {
  private prefix = 'km_';

  /* ===== Инициализация ===== */
  async initialize(): Promise<void> {
    // Ничего не делаем, localStorage всегда готов
    console.log('[LocalStorageService] Initialized');
  }

  /* ===== Загрузка всех данных ===== */
  async loadAll(): Promise<IPersistData | null> {
    try {
      const shares = await this.getShares();
      return {
        user: await this.getUser() || this.getDefaultUser(),
        shares: shares && shares.length > 0 ? shares : defaultShares,
        holdings: await this.getHoldings() || [],
        trades: await this.getTrades() || [],
        orders: await this.getOrders() || [],
        pools: await this.getPools() || [],
        unclaimedDividends: await this.getUnclaimedDividends(),
        dividendRecords: await this.getDividendRecords() || [],
        lastDividendCalc: await this.getLastDividendCalc(),
        nextDividendTime: await this.getNextDividendTime(),
        boostCooldowns: await this.getBoostCooldowns() || {},
        referralEarnings: await this.getReferralEarnings(),
        referralRecords: await this.getReferralRecords() || [],
        referralEarningHistory: await this.getReferralEarningHistory() || [],
        activeEvent: await this.getActiveEvent(),
        dailyQuests: await this.getDailyQuests() || [],
        stakingHistory: await this.getStakingHistory() || [],
      };
    } catch (error) {
      console.error('[LocalStorageService] Error loading data:', error);
      return null;
    }
  }

  /* ===== Сохранение всех данных ===== */
  async saveAll(data: IPersistData): Promise<void> {
    try {
      await Promise.all([
        this.saveUser(data.user),
        this.saveShares(data.shares),
        this.saveHoldings(data.holdings),
        this.saveTrades(data.trades),
        this.saveOrders(data.orders),
        this.savePools(data.pools),
        this.saveUnclaimedDividends(data.unclaimedDividends),
        this.saveDividendRecords(data.dividendRecords),
        this.saveLastDividendCalc(data.lastDividendCalc),
        this.saveNextDividendTime(data.nextDividendTime),
        this.saveBoostCooldowns(data.boostCooldowns),
        this.saveReferralEarnings(data.referralEarnings),
        this.saveReferralRecords(data.referralRecords),
        this.saveReferralEarningHistory(data.referralEarningHistory),
        this.saveActiveEvent(data.activeEvent),
        this.saveDailyQuests(data.dailyQuests),
        this.saveStakingHistory(data.stakingHistory),
      ]);
    } catch (error) {
      console.error('[LocalStorageService] Error saving data:', error);
      throw error;
    }
  }

  /* ===== Отдельные методы ===== */

  async getUser(): Promise<User | null> {
    try {
      const data = localStorage.getItem(this.prefix + 'user');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[LocalStorageService] getUser error:', error);
      return null;
    }
  }

  async saveUser(user: User): Promise<void> {
    try {
      localStorage.setItem(this.prefix + 'user', JSON.stringify(user));
    } catch (error) {
      console.error('[LocalStorageService] saveUser error:', error);
    }
  }

  async getShares(): Promise<Share[] | null> {
    try {
      const data = localStorage.getItem(this.prefix + 'shares');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[LocalStorageService] getShares error:', error);
      return null;
    }
  }

  async saveShares(shares: Share[]): Promise<void> {
    try {
      localStorage.setItem(this.prefix + 'shares', JSON.stringify(shares));
    } catch (error) {
      console.error('[LocalStorageService] saveShares error:', error);
    }
  }

  async getHoldings(): Promise<Holding[] | null> {
    try {
      const data = localStorage.getItem(this.prefix + 'holdings');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[LocalStorageService] getHoldings error:', error);
      return null;
    }
  }

  async saveHoldings(holdings: Holding[]): Promise<void> {
    try {
      localStorage.setItem(this.prefix + 'holdings', JSON.stringify(holdings));
    } catch (error) {
      console.error('[LocalStorageService] saveHoldings error:', error);
    }
  }

  async getTrades(): Promise<Trade[] | null> {
    try {
      const data = localStorage.getItem(this.prefix + 'trades');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[LocalStorageService] getTrades error:', error);
      return null;
    }
  }

  async saveTrades(trades: Trade[]): Promise<void> {
    try {
      localStorage.setItem(this.prefix + 'trades', JSON.stringify(trades));
    } catch (error) {
      console.error('[LocalStorageService] saveTrades error:', error);
    }
  }

  async getOrders(): Promise<Order[] | null> {
    try {
      const data = localStorage.getItem(this.prefix + 'orders');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[LocalStorageService] getOrders error:', error);
      return null;
    }
  }

  async saveOrders(orders: Order[]): Promise<void> {
    try {
      localStorage.setItem(this.prefix + 'orders', JSON.stringify(orders));
    } catch (error) {
      console.error('[LocalStorageService] saveOrders error:', error);
    }
  }

  async getPools(): Promise<Pool[] | null> {
    try {
      const data = localStorage.getItem(this.prefix + 'pools');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[LocalStorageService] getPools error:', error);
      return null;
    }
  }

  async savePools(pools: Pool[]): Promise<void> {
    try {
      localStorage.setItem(this.prefix + 'pools', JSON.stringify(pools));
    } catch (error) {
      console.error('[LocalStorageService] savePools error:', error);
    }
  }

  async getUnclaimedDividends(): Promise<number> {
    try {
      const data = localStorage.getItem(this.prefix + 'unclaimed_div');
      return data ? parseFloat(data) : 0;
    } catch (error) {
      console.error('[LocalStorageService] getUnclaimedDividends error:', error);
      return 0;
    }
  }

  async saveUnclaimedDividends(amount: number): Promise<void> {
    try {
      localStorage.setItem(this.prefix + 'unclaimed_div', amount.toString());
    } catch (error) {
      console.error('[LocalStorageService] saveUnclaimedDividends error:', error);
    }
  }

  async getDividendRecords(): Promise<DividendRecord[] | null> {
    try {
      const data = localStorage.getItem(this.prefix + 'div_records');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[LocalStorageService] getDividendRecords error:', error);
      return null;
    }
  }

  async saveDividendRecords(records: DividendRecord[]): Promise<void> {
    try {
      localStorage.setItem(this.prefix + 'div_records', JSON.stringify(records));
    } catch (error) {
      console.error('[LocalStorageService] saveDividendRecords error:', error);
    }
  }

  async getLastDividendCalc(): Promise<number> {
    try {
      const data = localStorage.getItem(this.prefix + 'last_div_calc');
      return data ? parseInt(data) : 0;
    } catch (error) {
      console.error('[LocalStorageService] getLastDividendCalc error:', error);
      return 0;
    }
  }

  async saveLastDividendCalc(timestamp: number): Promise<void> {
    try {
      localStorage.setItem(this.prefix + 'last_div_calc', timestamp.toString());
    } catch (error) {
      console.error('[LocalStorageService] saveLastDividendCalc error:', error);
    }
  }

  async getNextDividendTime(): Promise<number> {
    try {
      const data = localStorage.getItem(this.prefix + 'next_dividend_time');
      return data ? parseInt(data) : 0;
    } catch (error) {
      console.error('[LocalStorageService] getNextDividendTime error:', error);
      return 0;
    }
  }

  async saveNextDividendTime(timestamp: number): Promise<void> {
    try {
      localStorage.setItem(this.prefix + 'next_dividend_time', timestamp.toString());
    } catch (error) {
      console.error('[LocalStorageService] saveNextDividendTime error:', error);
    }
  }

  async getBoostCooldowns(): Promise<BoostCooldown | null> {
    try {
      const data = localStorage.getItem(this.prefix + 'boost_cd');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[LocalStorageService] getBoostCooldowns error:', error);
      return null;
    }
  }

  async saveBoostCooldowns(cooldowns: BoostCooldown): Promise<void> {
    try {
      localStorage.setItem(this.prefix + 'boost_cd', JSON.stringify(cooldowns));
    } catch (error) {
      console.error('[LocalStorageService] saveBoostCooldowns error:', error);
    }
  }

  async getReferralEarnings(): Promise<number> {
    try {
      const data = localStorage.getItem(this.prefix + 'referral_earn');
      return data ? parseFloat(data) : 0;
    } catch (error) {
      console.error('[LocalStorageService] getReferralEarnings error:', error);
      return 0;
    }
  }

  async saveReferralEarnings(amount: number): Promise<void> {
    try {
      localStorage.setItem(this.prefix + 'referral_earn', amount.toString());
    } catch (error) {
      console.error('[LocalStorageService] saveReferralEarnings error:', error);
    }
  }

  async getReferralRecords(): Promise<ReferralRecord[] | null> {
    try {
      const data = localStorage.getItem(this.prefix + 'referral_records');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[LocalStorageService] getReferralRecords error:', error);
      return null;
    }
  }

  async saveReferralRecords(records: ReferralRecord[]): Promise<void> {
    try {
      localStorage.setItem(this.prefix + 'referral_records', JSON.stringify(records));
    } catch (error) {
      console.error('[LocalStorageService] saveReferralRecords error:', error);
    }
  }

  async getReferralEarningHistory(): Promise<ReferralEarningRecord[] | null> {
    try {
      const data = localStorage.getItem(this.prefix + 'referral_earning_history');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[LocalStorageService] getReferralEarningHistory error:', error);
      return null;
    }
  }

  async saveReferralEarningHistory(records: ReferralEarningRecord[]): Promise<void> {
    try {
      localStorage.setItem(this.prefix + 'referral_earning_history', JSON.stringify(records));
    } catch (error) {
      console.error('[LocalStorageService] saveReferralEarningHistory error:', error);
    }
  }

  async getActiveEvent(): Promise<any | null> {
    try {
      const data = localStorage.getItem(this.prefix + 'event');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[LocalStorageService] getActiveEvent error:', error);
      return null;
    }
  }

  async saveActiveEvent(event: any): Promise<void> {
    try {
      localStorage.setItem(this.prefix + 'event', JSON.stringify(event));
    } catch (error) {
      console.error('[LocalStorageService] saveActiveEvent error:', error);
    }
  }

  async getDailyQuests(): Promise<Quest[] | null> {
    try {
      const data = localStorage.getItem(this.prefix + 'daily_quests');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[LocalStorageService] getDailyQuests error:', error);
      return null;
    }
  }

  async saveDailyQuests(quests: Quest[]): Promise<void> {
    try {
      localStorage.setItem(this.prefix + 'daily_quests', JSON.stringify(quests));
    } catch (error) {
      console.error('[LocalStorageService] saveDailyQuests error:', error);
    }
  }

  async getStakingHistory(): Promise<StakingRecord[] | null> {
    try {
      const data = localStorage.getItem(this.prefix + 'staking_history');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[LocalStorageService] getStakingHistory error:', error);
      return null;
    }
  }

  async saveStakingHistory(records: StakingRecord[]): Promise<void> {
    try {
      localStorage.setItem(this.prefix + 'staking_history', JSON.stringify(records));
    } catch (error) {
      console.error('[LocalStorageService] saveStakingHistory error:', error);
    }
  }

  /* ===== Утилиты ===== */

  async clear(): Promise<void> {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
    console.log('[LocalStorageService] Data cleared');
  }

  async exportData(): Promise<string> {
    const data = await this.loadAll();
    return JSON.stringify(data, null, 2);
  }

  async importData(json: string): Promise<void> {
    const data = JSON.parse(json) as IPersistData;
    await this.saveAll(data);
    console.log('[LocalStorageService] Data imported');
  }

  /* ===== Приватные методы ===== */

  private getDefaultUser(): User {
    return {
      id: 'player_1',
      username: 'you',
      avatar: '👤',
      karma: 100,
      level: 1,
      balance: 2000,
      premium: false,
      premiumExpiresAt: 0,
      premiumTheme: 'default',
      referralCode: 'KM_' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      referredBy: null,
      totalTradesToday: 0,
      lastLogin: Date.now(),
      staked: 0,
      stakedAt: null,
      autoCompound: false,
      darkMode: true,
      privacyHidden: false,
      notifications: true,
      poolId: null,
      dailyVotesUsed: 0,
      lastVoteReset: Date.now(),
      onboarded: false,
      cardBio: 'Трейдер на KarmaMarket 💎',
      cardColor: '#00FF7F',
      cardBadge: '💎',
      cardBackground: 'gradient1',
      selfBoostLevel: 0,
      selfBoostExpiry: 0,
      totalReferrals: 0,
      referralLevel2Count: 0,
      referralTotalEarnings: 0,
      referralPendingEarnings: 0,
      referralTier: 1,
      referralAchievements: [],
      totalTradesAllTime: 0,
      totalBoostsGiven: 0,
      totalVotesGiven: 0,
      totalDividendsClaimed: 0,
      totalFriendsInvited: 0,
      totalSharesBought: 0,
      uniqueSharesBought: [],
      totalSquadTasksDone: 0,
      poolContributionScore: 0,
      poolWeeklyStats: {
        trades: 0,
        boosts: 0,
        votes: 0,
      },
      consecutiveLoginDays: 0,
      lastQuestReset: Date.now(),
      premiumPurchasedAt: 0,
      totalPremiumDays: 0,
      totalStaked: 0,
      totalStakingReward: 0,
      longestStakeDays: 0,
      lastStakingClaim: 0,
    };
  }
}
