import { ReferralTier, ReferralAchievement, Quest, QuestType } from '../types';

/* ===== Система уровней ===== */
export const LEVEL_SYSTEM = [
  { level: 1, name: 'Новичок', icon: '🌱', karmaRequired: 0, divBonus: 0, portfolioLimit: 10, apyBonus: 0, rebateBonus: 0, reward: 0 },
  { level: 2, name: 'Ученик', icon: '🌿', karmaRequired: 50, divBonus: 1, portfolioLimit: 15, apyBonus: 0.5, rebateBonus: 0.01, reward: 25 },
  { level: 3, name: 'Трейдер', icon: '🍀', karmaRequired: 120, divBonus: 2, portfolioLimit: 20, apyBonus: 1, rebateBonus: 0.02, reward: 50 },
  { level: 4, name: 'Опытный', icon: '🌳', karmaRequired: 200, divBonus: 3, portfolioLimit: 30, apyBonus: 1.5, rebateBonus: 0.03, reward: 75 },
  { level: 5, name: 'Эксперт', icon: '⭐', karmaRequired: 350, divBonus: 5, portfolioLimit: 40, apyBonus: 2, rebateBonus: 0.05, reward: 100 },
  { level: 6, name: 'Мастер', icon: '🌟', karmaRequired: 500, divBonus: 6, portfolioLimit: 50, apyBonus: 2.5, rebateBonus: 0.06, reward: 150 },
  { level: 7, name: 'Профи', icon: '💫', karmaRequired: 700, divBonus: 8, portfolioLimit: 60, apyBonus: 3, rebateBonus: 0.07, reward: 200 },
  { level: 8, name: 'Элита', icon: '🔥', karmaRequired: 1000, divBonus: 10, portfolioLimit: 75, apyBonus: 4, rebateBonus: 0.08, reward: 300 },
  { level: 9, name: 'Легенда', icon: '💎', karmaRequired: 1500, divBonus: 12, portfolioLimit: 90, apyBonus: 5, rebateBonus: 0.09, reward: 400 },
  { level: 10, name: 'Магнат', icon: '👑', karmaRequired: 2000, divBonus: 15, portfolioLimit: 100, apyBonus: 6, rebateBonus: 0.1, reward: 500 },
  { level: 11, name: 'Титан', icon: '🏆', karmaRequired: 3000, divBonus: 18, portfolioLimit: 120, apyBonus: 7, rebateBonus: 0.12, reward: 600 },
  { level: 12, name: 'Олигарх', icon: '💰', karmaRequired: 4000, divBonus: 20, portfolioLimit: 140, apyBonus: 8, rebateBonus: 0.13, reward: 800 },
  { level: 13, name: 'Воротила', icon: '🦈', karmaRequired: 5500, divBonus: 22, portfolioLimit: 160, apyBonus: 9, rebateBonus: 0.14, reward: 1000 },
  { level: 14, name: 'Империя', icon: '🏰', karmaRequired: 7000, divBonus: 25, portfolioLimit: 180, apyBonus: 10, rebateBonus: 0.15, reward: 1200 },
  { level: 15, name: 'Монарх', icon: '🤴', karmaRequired: 9000, divBonus: 28, portfolioLimit: 200, apyBonus: 12, rebateBonus: 0.17, reward: 1500 },
  { level: 16, name: 'Оракул', icon: '🔮', karmaRequired: 12000, divBonus: 32, portfolioLimit: 250, apyBonus: 14, rebateBonus: 0.18, reward: 1800 },
  { level: 17, name: 'Архонт', icon: '⚜️', karmaRequired: 16000, divBonus: 38, portfolioLimit: 300, apyBonus: 16, rebateBonus: 0.2, reward: 2200 },
  { level: 18, name: 'Демиург', icon: '🌀', karmaRequired: 22000, divBonus: 42, portfolioLimit: 350, apyBonus: 18, rebateBonus: 0.22, reward: 2800 },
  { level: 19, name: 'Абсолют', icon: '✨', karmaRequired: 30000, divBonus: 48, portfolioLimit: 400, apyBonus: 20, rebateBonus: 0.25, reward: 3500 },
  { level: 20, name: 'Бог Кармы', icon: '🌌', karmaRequired: 50000, divBonus: 50, portfolioLimit: 500, apyBonus: 25, rebateBonus: 0.3, reward: 5000 },
];

export function getUserLevel(karma: number) {
  let currentLevel = LEVEL_SYSTEM[0];
  for (const lvl of LEVEL_SYSTEM) {
    if (karma >= lvl.karmaRequired) currentLevel = lvl;
    else break;
  }
  const nextLevel = LEVEL_SYSTEM.find(l => l.level === currentLevel.level + 1);
  const progress = nextLevel
    ? ((karma - currentLevel.karmaRequired) / (nextLevel.karmaRequired - currentLevel.karmaRequired)) * 100
    : 100;
  return { ...currentLevel, progress: Math.min(100, Math.max(0, progress)), nextLevel };
}

/* ===== Квесты ===== */
export const ALL_QUEST_TEMPLATES: Array<{ type: QuestType; title: string; description: string; icon: string; target: number; reward: number; karmaReward: number }> = [
  { type: 'invite_friends', title: 'Привлеки 3 друзей', description: 'Пригласи 3 новых пользователей по реферальной ссылке', icon: '👥', target: 3, reward: 150, karmaReward: 30 },
  { type: 'claim_dividends', title: 'Собери дивиденды 5 раз', description: 'Нажми "Забрать" на экране наград 5 раз', icon: '💰', target: 5, reward: 100, karmaReward: 20 },
  { type: 'buy_unique_shares', title: 'Купи акции 5 друзей', description: 'Приобрети акции 5 разных пользователей', icon: '🛒', target: 5, reward: 200, karmaReward: 40 },
  { type: 'make_trades', title: 'Соверши 10 сделок', description: 'Выполни 10 операций покупки или продажи', icon: '📊', target: 10, reward: 120, karmaReward: 25 },
  { type: 'boost_friends', title: 'Бустни 5 друзей', description: 'Используй буст на 5 разных друзей', icon: '⚡', target: 5, reward: 80, karmaReward: 15 },
  { type: 'vote_friends', title: 'Проголосуй 10 раз', description: 'Поставь лайк 10 друзьям', icon: '❤️', target: 10, reward: 60, karmaReward: 10 },
  { type: 'earn_profit', title: 'Заработай 500 $K на трейдах', description: 'Получи суммарный профит 500 $KARMA от продажи акций', icon: '🤑', target: 500, reward: 250, karmaReward: 50 },
  { type: 'stake_karma', title: 'Застейкай 200 $KARMA', description: 'Заблокируй 200+ $KARMA в стейкинге', icon: '🔒', target: 200, reward: 100, karmaReward: 20 },
  { type: 'login_streak', title: '3 дня подряд', description: 'Заходи в приложение 3 дня подряд', icon: '🔥', target: 3, reward: 75, karmaReward: 15 },
  { type: 'boost_self', title: 'Бустни свою карточку', description: 'Подними уровень буста своей карточки на 1', icon: '🚀', target: 1, reward: 100, karmaReward: 20 },
];

export const VIP_QUEST_TEMPLATES: Array<{ type: QuestType; title: string; description: string; icon: string; target: number; reward: number; karmaReward: number }> = [
  { type: 'make_trades', title: '👑 VIP: 20 сделок', description: 'Эксклюзивный квест: 20 сделок за день', icon: '👑', target: 20, reward: 500, karmaReward: 80 },
  { type: 'earn_profit', title: '👑 VIP: Заработай 1000 $K', description: 'Эксклюзивный квест: профит 1000 $KARMA', icon: '💰', target: 1000, reward: 600, karmaReward: 100 },
  { type: 'boost_friends', title: '👑 VIP: Бустни 10 друзей', description: 'Эксклюзивный квест: 10 бустов', icon: '⚡', target: 10, reward: 400, karmaReward: 60 },
  { type: 'buy_unique_shares', title: '👑 VIP: Купи 8 разных акций', description: 'Эксклюзивный квест: диверсификация', icon: '🌟', target: 8, reward: 450, karmaReward: 70 },
  { type: 'stake_karma', title: '👑 VIP: Застейкай 500 $K', description: 'Эксклюзивный квест: крупный стейк', icon: '🔒', target: 500, reward: 350, karmaReward: 50 },
];

/* ===== Рефералы ===== */
export const REFERRAL_TIERS: ReferralTier[] = [
  { level: 1, name: 'Новичок', icon: '🥉', minReferrals: 0, bonusPercent: 5 },
  { level: 2, name: 'Активный', icon: '👤', minReferrals: 3, bonusPercent: 7 },
  { level: 3, name: 'Лидер', icon: '⭐', minReferrals: 10, bonusPercent: 10 },
  { level: 4, name: 'Магнат', icon: '💎', minReferrals: 25, bonusPercent: 15 },
  { level: 5, name: 'Легенда', icon: '👑', minReferrals: 50, bonusPercent: 20 },
];

export const REFERRAL_ACHIEVEMENTS: ReferralAchievement[] = [
  {
    id: 'first_referral',
    name: 'Первый реферал',
    description: 'Пригласи первого друга',
    icon: '🎉',
    requirement: (stats) => stats.totalReferrals >= 1,
    reward: { karma: 50, badge: '🥇' },
    unlocked: false,
  },
  {
    id: 'three_friends',
    name: 'Три друга',
    description: 'Пригласи 3 друзей',
    icon: '👥',
    requirement: (stats) => stats.totalReferrals >= 3,
    reward: { balance: 200, badge: '👥' },
    unlocked: false,
  },
  {
    id: 'ten_referrals',
    name: 'Лидер',
    description: 'Пригласи 10 друзей',
    icon: '⭐',
    requirement: (stats) => stats.totalReferrals >= 10,
    reward: { karma: 500, balance: 1000, badge: '⭐' },
    unlocked: false,
  },
  {
    id: 'active_network',
    name: 'Активная сеть',
    description: '5 активных рефералов',
    icon: '🔥',
    requirement: (stats) => stats.activeReferrals >= 5,
    reward: { karma: 300, badge: '🔥' },
    unlocked: false,
  },
  {
    id: 'earnings_master',
    name: 'Мастер заработка',
    description: 'Заработай 5000 $K на рефералах',
    icon: '💰',
    requirement: (stats) => stats.totalEarned >= 5000,
    reward: { balance: 2000, badge: '💰' },
    unlocked: false,
  },
  {
    id: 'two_tier_king',
    name: 'Двухуровневый король',
    description: '10 рефералов 2-го уровня',
    icon: '👑',
    requirement: (stats) => stats.totalReferrals >= 20, // 10 direct + 10 indirect
    reward: { karma: 1000, balance: 5000, badge: '👑' },
    unlocked: false,
  },
];
