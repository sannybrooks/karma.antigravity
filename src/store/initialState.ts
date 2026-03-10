import { User, Share, Holding, Trade, Order, Pool, Quest, DividendRecord, StakingRecord, ReferralRecord, ReferralEarningRecord } from '../types';
import { generateShares, generateMockReferrals } from '../data/seed';
import { ALL_QUEST_TEMPLATES, VIP_QUEST_TEMPLATES } from './constants';

export function generateDailyQuests(isPremium: boolean = false): Quest[] {
  const shuffled = [...ALL_QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
  let templates = shuffled.slice(0, isPremium ? 3 : 5); 

  if (isPremium) {
    const vipShuffled = [...VIP_QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
    templates = [...templates, ...vipShuffled.slice(0, 2)];
  }

  return templates.map((t, i) => ({
    id: `quest_${Date.now()}_${i}`,
    title: t.title,
    description: t.description,
    icon: t.icon,
    type: t.type,
    target: t.target,
    reward: t.reward,
    karmaReward: t.karmaReward,
    progress: 0,
    completed: false,
    claimed: false,
    isVip: t.icon.includes('👑'),
  }));
}

/* Дефолтные значения (fallbacks) */

export const defaultShares = generateShares();
export const defaultUser: User = {
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
  poolWeeklyStats: { trades: 0, boosts: 0, votes: 0 },
  consecutiveLoginDays: 1,
  lastQuestReset: Date.now(),
  premiumPurchasedAt: 0,
  totalPremiumDays: 0,
  totalStaked: 0,
  totalStakingReward: 0,
  longestStakeDays: 0,
  lastStakingClaim: 0,
};

export const defaultHoldings: Holding[] = [];
export const defaultTrades: Trade[] = [];
export const defaultOrders: Order[] = [];
export const defaultUnclaimedDividends = 0;
export const defaultDividendRecords: DividendRecord[] = [];
export const defaultLastDividendCalc = 0;
export const defaultNextDividendTime = 0;
export const defaultStakingHistory: StakingRecord[] = [];
export const defaultReferralEarnings = 0;
export const defaultReferralRecords: ReferralRecord[] = generateMockReferrals();
export const defaultReferralEarningHistory: ReferralEarningRecord[] = [];
export const defaultDailyQuests: Quest[] = generateDailyQuests();
export const defaultPools: Pool[] = [
  {
    id: 'pool_1',
    name: 'Alpha Traders',
    leaderId: 'user_0',
    members: [
      { userId: 'user_0', role: 'leader', joinedAt: Date.now() - 86400000 * 7, lastActiveAt: Date.now(), weeklyStats: { trades: 15, boosts: 8, votes: 5, dividends: 0 }, contributionScore: 450 },
      { userId: 'user_1', role: 'officer', joinedAt: Date.now() - 86400000 * 5, lastActiveAt: Date.now(), weeklyStats: { trades: 10, boosts: 5, votes: 3, dividends: 0 }, contributionScore: 320 },
      { userId: 'user_2', role: 'member', joinedAt: Date.now() - 86400000 * 3, lastActiveAt: Date.now() - 86400000 * 2, weeklyStats: { trades: 5, boosts: 2, votes: 1, dividends: 0 }, contributionScore: 150 },
    ],
    dividendBonus: 0.2,
    createdAt: Date.now() - 86400000 * 7,
    maxMembers: 20,
    stats: {
      totalTrades: 150,
      totalBoosts: 45,
      totalDividends: 2340,
      weeklyGrowth: 12.5,
      activeMembers: 3,
      averageScore: 306,
    },
    activities: [],
    notifications: [],
    history: [
      { id: 'hist_1', type: 'member_join', title: 'Пул создан', description: 'Пул "Alpha Traders" создан', icon: '🎉', timestamp: Date.now() - 86400000 * 7 },
    ],
    weeklyQuest: null,
  },
  {
    id: 'pool_2',
    name: 'TON Degens',
    leaderId: 'user_3',
    members: [
      { userId: 'user_3', role: 'leader', joinedAt: Date.now() - 86400000 * 3, lastActiveAt: Date.now(), weeklyStats: { trades: 8, boosts: 3, votes: 2, dividends: 0 }, contributionScore: 280 },
      { userId: 'user_4', role: 'recruit', joinedAt: Date.now() - 86400000 * 1, lastActiveAt: Date.now() - 86400000, weeklyStats: { trades: 2, boosts: 0, votes: 0, dividends: 0 }, contributionScore: 50 },
    ],
    dividendBonus: 0.2,
    createdAt: Date.now() - 86400000 * 3,
    maxMembers: 20,
    stats: {
      totalTrades: 80,
      totalBoosts: 20,
      totalDividends: 1200,
      weeklyGrowth: 8.3,
      activeMembers: 2,
      averageScore: 165,
    },
    activities: [],
    notifications: [],
    history: [
      { id: 'hist_2', type: 'member_join', title: 'Пул создан', description: 'Пул "TON Degens" создан', icon: '🎉', timestamp: Date.now() - 86400000 * 3 },
    ],
    weeklyQuest: null,
  },
];
