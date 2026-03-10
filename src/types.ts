/* ===== KarmaMarket — Типы данных ===== */

export interface User {
  id: string;
  username: string;
  avatar: string;
  karma: number;
  level: number;
  balance: number; // $KARMA баланс
  premium: boolean;
  premiumExpiresAt: number; // timestamp истечения премиума
  premiumTheme: string; // 'default' | 'gold' | 'diamond' | 'neon'
  referralCode: string;
  referredBy: string | null;
  totalTradesToday: number;
  lastLogin: number;
  staked: number;
  stakedAt: number | null;
  autoCompound: boolean;
  darkMode: boolean;
  privacyHidden: boolean;
  notifications: boolean;
  poolId: string | null; // ID пула
  dailyVotesUsed: number;
  lastVoteReset: number;
  onboarded: boolean;
  /* Настройка карточки */
  cardBio: string;
  cardColor: string;
  cardBadge: string;
  cardBackground: string;
  /* Буст своей карточки */
  selfBoostLevel: number;
  selfBoostExpiry: number;
  /* Статистика рефералов */
  totalReferrals: number;
  referralLevel2Count: number;
  referralTotalEarnings: number;
  referralPendingEarnings: number; // Накоплено, но не выплачено
  referralTier: number;            // Текущий уровень (1-5)
  referralAchievements: string[];  // ID разблокированных достижений
  /* Счётчики */
  totalTradesAllTime: number;
  totalBoostsGiven: number;
  totalVotesGiven: number;
  totalDividendsClaimed: number;
  totalFriendsInvited: number;
  totalSharesBought: number;
  uniqueSharesBought: string[];
  totalSquadTasksDone: number; // Выполнено квестов пула (устаревшее название, имеется в виду pool)
  poolContributionScore: number; // Счёт вклада в пул
  poolWeeklyStats: {            // Статистика в пуле за неделю
    trades: number;
    boosts: number;
    votes: number;
  };
  consecutiveLoginDays: number;
  lastQuestReset: number;
  /* Premium-статистика */
  premiumPurchasedAt: number;
  totalPremiumDays: number;
  /* Стейкинг — дополнительная статистика */
  totalStaked: number; // Всего застейкано за всё время
  totalStakingReward: number; // Всего получено наград
  longestStakeDays: number; // Максимальное количество дней в стейке
  lastStakingClaim: number; // Время последнего получения награды
}

/* ===== Стейкинг ===== */
export type StakingMode = 'flexible' | 'locked';

export type StakingType = 'stake' | 'unstake' | 'claim' | 'compound';

export interface StakingRecord {
  id: string;
  type: StakingType;
  amount: number;
  reward?: number;
  apy?: number;
  timestamp: number;
}

export interface StakingTier {
  name: string;
  icon: string;
  minAmount: number;
  apy: number;
}

export interface StakingAchievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: number;
}

/* ===== Реферальная система ===== */
export interface ReferralTier {
  level: number;
  name: string;
  icon: string;
  minReferrals: number;
  bonusPercent: number; // % от действий рефералов
}

export interface ReferralAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: (stats: ReferralStats) => boolean;
  reward: {
    karma?: number;
    balance?: number;
    badge?: string;
  };
  unlocked: boolean;
  unlockedAt?: number;
}

export interface ReferralStats {
  totalReferrals: number;        // Всего рефералов
  activeReferrals: number;       // Активных (за 30 дней)
  totalEarned: number;          // Всего заработано реферером
  totalPaid: number;            // Всего выплачено рефералам
  tier: number;                 // Текущий уровень
}

export interface ReferralEarningRecord {
  id: string;
  referralId: string;
  referralUsername: string;
  action: 'trade_buy' | 'trade_sell' | 'boost' | 'dividend';
  amount: number;               // Сумма действия реферала
  bonus: number;                // Бонус реферера
  tier: number;                 // Уровень реферера на момент начисления
  timestamp: number;
  level: 1 | 2;                 // 1 = прямой, 2 = косвенный
}

export interface ReferralRecord {
  userId: string;
  username: string;
  avatar: string;
  joinedAt: number;
  level: 1 | 2; // прямой или суб-реферал
  totalEarnings: number;
  isActive: boolean;
  lastActiveAt?: number;        // Последняя активность
  totalTrades?: number;         // Всего трейдов
  totalVolume?: number;         // Общий объём трейдов
}

/* Премиум-перки */
export interface PremiumPerk {
  id: string;
  title: string;
  description: string;
  icon: string;
  free: string;
  premium: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: QuestType;
  target: number; // сколько нужно сделать
  reward: number; // $KARMA (базовая, x2 при клейме для Premium)
  karmaReward: number; // + карма (базовая, x2 при клейме для Premium)
  progress: number; // текущий прогресс
  completed: boolean;
  claimed: boolean;
  isVip?: boolean; // VIP-эксклюзивный квест (только для Premium)
}

export type QuestType =
  | 'invite_friends'
  | 'claim_dividends'
  | 'buy_shares'
  | 'buy_unique_shares'
  | 'boost_friends'
  | 'vote_friends'
  | 'make_trades'
  | 'earn_profit'
  | 'stake_karma'
  | 'join_squad'
  | 'login_streak'
  | 'reach_portfolio_value'
  | 'sell_with_profit'
  | 'boost_self';

export interface Shareholder {
  userId: string;
  username: string;
  avatar: string;
  amount: number;
  boughtAt: number;
}


export interface Share {
  id: string;
  ownerId: string;
  ticker: string;
  username: string;
  avatar: string;
  karma: number;
  basePrice: number;
  currentPrice: number;
  previousPrice: number;
  price24hAgo: number;
  volume24h: number;
  hypeModifier: number;
  priceHistory: PricePoint[];
  totalSupply: number;
  isVIP: boolean;
  hidden: boolean;
  /* Акционеры (мок) */
  shareholders: Shareholder[];
}

export interface PricePoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface Holding {
  shareId: string;
  amount: number;
  avgBuyPrice: number;
  boughtAt: number;
}

export interface Order {
  id: string;
  userId: string;
  shareId: string;
  type: 'market' | 'limit';
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  targetPrice?: number;
  status: 'pending' | 'filled' | 'cancelled';
  createdAt: number;
}

export interface Trade {
  id: string;
  userId: string;
  shareId: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  fee: number;
  rebate: number;
  timestamp: number;
}

/* Ранги в пуле */
export type PoolRole = 'leader' | 'admin' | 'officer' | 'member' | 'recruit';

export interface PoolMember {
  userId: string;
  role: PoolRole;
  joinedAt: number;
  lastActiveAt: number;      // Последняя активность
  weeklyStats: {            // Статистика за неделю
    trades: number;
    boosts: number;
    votes: number;
    dividends: number;
  };
  contributionScore: number; // Общий счёт вклада
}

export interface PoolStats {
  totalTrades: number;       // Всего трейдов
  totalBoosts: number;       // Всего бустов
  totalDividends: number;    // Всего дивидендов
  weeklyGrowth: number;      // Рост за неделю (%)
  activeMembers: number;     // Активных участников (за 7 дней)
  averageScore: number;      // Средний счёт участника
}

export interface PoolActivity {
  userId: string;
  username: string;
  action: 'trade' | 'boost' | 'vote' | 'join' | 'leave' | 'quest_complete';
  amount?: number;
  timestamp: number;
  description: string;
}

export interface PoolNotification {
  id: string;
  poolId: string;
  type: 'member_joined' | 'member_left' | 'achievement' | 'quest_completed' | 'tournament' | 'boost_ready';
  message: string;
  timestamp: number;
  read: boolean;
}

export interface PoolHistoryEvent {
  id: string;
  type: 'member_join' | 'member_leave' | 'member_promote' | 'boost' | 'quest' | 'achievement';
  title: string;
  description: string;
  icon: string;
  timestamp: number;
  userId?: string;
  username?: string;
}

export interface Pool {
  id: string;
  name: string;
  leaderId: string;
  members: PoolMember[];
  dividendBonus: number;
  createdAt: number;
  maxMembers: number;
  stats: PoolStats;              // Статистика пула
  activities: PoolActivity[];    // Лента активности
  notifications: PoolNotification[]; // Уведомления
  history: PoolHistoryEvent[];   // История событий
  weeklyQuest: {                // Еженедельный квест
    title: string;
    target: number;
    current: number;
    reward: number;
    endsAt: number;
  } | null;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export interface DividendRecord {
  shareId: string;
  shareTicker: string;
  amount: number;
  timestamp: number;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: number;
  read: boolean;
}

/* Тема приложения */
export type ThemeMode = 'dark' | 'light';

export interface Theme {
  bg: string;
  bgSecondary: string;
  bgCard: string;
  bgCardBorder: string;
  bgHeader: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentGold: string;
  danger: string;
  inputBg: string;
  inputBorder: string;
  navBg: string;
  navBorder: string;
}

export type Screen = 'market' | 'portfolio' | 'rewards' | 'friends' | 'profile';
export type MarketFilter = 'all' | 'hot' | 'friends' | 'undervalued';

export interface BoostCooldown {
  [friendId: string]: number;
}
