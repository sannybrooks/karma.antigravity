import { GameSlice, PoolSlice } from '../types';
import { defaultPools } from '../initialState';

export const createPoolSlice: GameSlice<PoolSlice> = (set, get) => ({
  pools: defaultPools,
  boostCooldowns: {},

  createPool: (name) => {
    const state = get();
    if (state.user.poolId) return;
    if (!state.user.premium || state.user.premiumExpiresAt <= Date.now()) {
      state.addNotification('👑 Создание пулов доступно только Premium', 'warning');
      return;
    }
    const newPool = {
      id: `pool_${Date.now()}`, name, leaderId: state.user.id,
      members: [{ userId: state.user.id, role: 'leader' as const, joinedAt: Date.now(), lastActiveAt: Date.now(), weeklyStats: { trades: 0, boosts: 0, votes: 0, dividends: 0 }, contributionScore: 0 }],
      dividendBonus: 0.2, createdAt: Date.now(), maxMembers: 50,
      stats: { totalTrades: 0, totalBoosts: 0, totalDividends: 0, weeklyGrowth: 0, activeMembers: 1, averageScore: 0 },
      activities: [], notifications: [],
      history: [{ id: `hist_create_${Date.now()}`, type: 'member_join' as const, title: 'Пул создан', description: `Пул "${name}" создан`, icon: '🎉', timestamp: Date.now(), userId: state.user.id, username: state.user.username }],
      weeklyQuest: null,
    };
    set({ pools: [...state.pools, newPool], user: { ...state.user, poolId: newPool.id } });
    state.addNotification(`Пул "${name}" создан!`, 'success');
    state.persist();
  },

  joinPool: (poolId) => {
    const state = get();
    if (state.user.poolId) return;
    const pool = state.pools.find(s => s.id === poolId);
    if (!pool || pool.members.length >= pool.maxMembers) return;
    const newMember = { userId: state.user.id, role: 'recruit' as const, joinedAt: Date.now(), lastActiveAt: Date.now(), weeklyStats: { trades: 0, boosts: 0, votes: 0, dividends: 0 }, contributionScore: 0 };
    set({
      pools: state.pools.map(s => s.id === poolId ? { ...s, members: [...s.members, newMember] } : s),
      user: { ...state.user, poolId: poolId },
    });
    state.addNotification(`Вы вступили в "${pool.name}"!`, 'success');
    state.persist();
  },

  leavePool: () => {
    const state = get();
    if (!state.user.poolId) return;
    const pool = state.pools.find(s => s.id === state.user.poolId);
    const poolName = pool?.name ?? 'пул';

    const updatedPools = state.pools.map(s => {
      if (s.id !== state.user.poolId) return s;
      const newMembers = s.members.filter(m => m.userId !== state.user.id);
      if (newMembers.length === 0) return null;
      let newLeaderId = s.leaderId;
      if (s.leaderId === state.user.id && newMembers.length > 0) {
        newLeaderId = newMembers[0].userId;
        newMembers[0] = { ...newMembers[0], role: 'leader' };
      }
      return { ...s, members: newMembers, leaderId: newLeaderId };
    }).filter(Boolean) as any[];

    set({ pools: updatedPools, user: { ...state.user, poolId: null } });
    state.addNotification(`Вы покинули "${poolName}"`, 'info');
    state.persist();
  },

  boostPool: () => {
    const state = get();
    if (!state.user.poolId) return 'Вы не в пуле';
    const pool = state.pools.find(s => s.id === state.user.poolId);
    if (!pool) return 'Пул не найден';

    const otherMembers = pool.members.filter(m => m.userId !== state.user.id);
    if (otherMembers.length === 0) return 'В пуле нет других участников';

    let boostedCount = 0;
    let totalKarmaBoost = 0;
    let totalDividendBonus = 0;
    const now = Date.now();
    const newCooldowns = { ...state.boostCooldowns };
    const newShares = [...state.shares];

    otherMembers.forEach(member => {
      const shareIdx = newShares.findIndex(s => s.ownerId === member.userId);
      if (shareIdx === -1) return;
      const share = newShares[shareIdx];
      const lastBoost = newCooldowns[share.id] || 0;
      if (now - lastBoost < 3600000) return;
      const karmaBoost = 10 + Math.floor(Math.random() * 15);
      const dividendBonus = share.currentPrice * 0.1;
      totalKarmaBoost += karmaBoost;
      totalDividendBonus += dividendBonus;
      boostedCount++;
      newShares[shareIdx] = { ...share, karma: share.karma + karmaBoost, hypeModifier: share.hypeModifier + 3 };
      newCooldowns[share.id] = now;
    });

    if (boostedCount === 0) return 'Все участники на кулдауне буста (1ч)';

    set({
      shares: newShares, boostCooldowns: newCooldowns,
      user: {
        ...state.user,
        karma: state.user.karma + Math.floor(totalKarmaBoost * 0.3),
        totalBoostsGiven: state.user.totalBoostsGiven + boostedCount,
        totalSquadTasksDone: state.user.totalSquadTasksDone + boostedCount,
      },
      unclaimedDividends: Math.round((state.unclaimedDividends + totalDividendBonus) * 100) / 100,
    });
    state.addNotification(`⚡ Пул бустнут!`, 'success');
    state.updateQuestProgress('boost_friends', boostedCount);
    state.trackPoolActivity('boost', boostedCount);
    state.persist();
    return null;
  },

  inviteToPool: (userId) => {
    const state = get();
    const pool = state.pools.find(s => s.id === state.user.poolId);
    if (!pool) return 'Пул не найден';
    const myMember = pool.members.find(m => m.userId === state.user.id);
    if (!myMember || (myMember.role !== 'leader' && myMember.role !== 'admin')) return 'Нет прав';
    if (pool.members.some(m => m.userId === userId)) return 'Уже в пуле';

    const newMember = { userId, role: 'recruit' as const, joinedAt: Date.now(), lastActiveAt: Date.now(), weeklyStats: { trades: 0, boosts: 0, votes: 0, dividends: 0 }, contributionScore: 0 };
    set({
      pools: state.pools.map(s => s.id === pool.id ? { ...s, members: [...s.members, newMember] } : s),
      user: { ...state.user, balance: state.user.balance + 100, karma: state.user.karma + 50 },
    });
    state.addNotification(`✅ Пользователь добавлен в пул!`, 'success');
    state.persist();
    return null;
  },

  promotePoolMember: (userId) => {
    const state = get();
    const pool = state.pools.find(s => s.id === state.user.poolId);
    if (!pool) return 'Пул не найден';
    const myMember = pool.members.find(m => m.userId === state.user.id);
    if (!myMember || (myMember.role !== 'leader' && myMember.role !== 'admin')) return 'Нет прав';

    const ranks = ['recruit', 'member', 'officer', 'admin'];
    const target = pool.members.find(m => m.userId === userId);
    if (!target) return 'Участник не найден';
    const currentIdx = ranks.indexOf(target.role);
    if (currentIdx === -1 || currentIdx >= ranks.length - 1) return 'Макс. ранг';

    const newRole = ranks[currentIdx + 1] as any;
    set({
      pools: state.pools.map(p => p.id === pool.id ? {
        ...p,
        members: p.members.map(m => m.userId === userId ? { ...m, role: newRole } : m),
        history: [...p.history, { id: `h_${Date.now()}`, type: 'member_promote' as const, title: 'Повышение', description: `@${state.user.username} повысил @${userId.slice(-6)}`, icon: '⬆️', timestamp: Date.now() }],
      } : p),
    });
    state.addNotification(`⬆️ Участник повышен`, 'success');
    state.persist();
    return null;
  },

  trackPoolActivity: (action, amount) => {
    const state = get();
    if (!state.user.poolId) return;
    const now = Date.now();
    set({
      user: {
        ...state.user,
        poolWeeklyStats: {
          ...state.user.poolWeeklyStats,
          [action === 'trade' ? 'trades' : action === 'boost' ? 'boosts' : 'votes']: state.user.poolWeeklyStats[action === 'trade' ? 'trades' : action === 'boost' ? 'boosts' : 'votes'] + (amount || 1),
        },
        poolContributionScore: state.user.poolContributionScore + (amount || 1) * 10,
      },
      pools: state.pools.map(p => {
        if (p.id !== state.user.poolId) return p;
        return {
          ...p,
          stats: {
            ...p.stats,
            [action === 'trade' ? 'totalTrades' : 'totalBoosts']: p.stats[action === 'trade' ? 'totalTrades' : 'totalBoosts'] + (amount || 1),
          },
          activities: [...p.activities, { userId: state.user.id, username: state.user.username, action, amount, timestamp: now, description: action }].slice(-50),
        };
      }),
    });
  },

  getPoolStats: (id) => get().pools.find(p => p.id === id)?.stats || null,
  getPoolNotifications: (id) => get().pools.find(p => p.id === id)?.notifications?.filter(n => !n.read) || [],
  markNotificationRead: (id) => set(s => ({ pools: s.pools.map(p => ({ ...p, notifications: p.notifications.map(n => n.id === id ? { ...n, read: true } : n) })) })),
  getPoolHistory: (id) => get().pools.find(p => p.id === id)?.history || [],
  addPoolNotification: (poolId, type, message) => set(s => ({
    pools: s.pools.map(p => p.id === poolId ? { ...p, notifications: [{ id: `pn_${Date.now()}`, poolId, type, message, timestamp: Date.now(), read: false }, ...p.notifications].slice(0, 50) } : p)
  })),

  boostFriend: (shareId) => {
    const state = get();
    const now = Date.now();
    const lastBoost = state.boostCooldowns[shareId] || 0;
    if (now - lastBoost < 3600000) return `Кулдаун: ${Math.ceil((3600000 - (now - lastBoost)) / 60000)} мин.`;

    const share = state.shares.find(s => s.id === shareId);
    if (!share) return 'Не найдено';

    const karmaBoost = 10 + Math.floor(Math.random() * 20);
    const divBonus = share.currentPrice * 0.1;

    set({
      shares: state.shares.map(s => s.id === shareId ? { ...s, karma: s.karma + karmaBoost, hypeModifier: s.hypeModifier + 5 } : s),
      user: { ...state.user, karma: state.user.karma + Math.floor(karmaBoost * 0.2), totalBoostsGiven: state.user.totalBoostsGiven + 1 },
      unclaimedDividends: Math.round((state.unclaimedDividends + divBonus) * 100) / 100,
      boostCooldowns: { ...state.boostCooldowns, [shareId]: now },
    });
    state.addNotification(`Буст ${share.ticker}!`, 'success');
    state.updateQuestProgress('boost_friends', 1);
    state.persist();
    return null;
  },

  voteFriend: (shareId) => {
    const state = get();
    if (state.user.dailyVotesUsed >= 10) return 'Лимит 10/день';
    const share = state.shares.find(s => s.id === shareId);
    if (!share) return 'Не найдено';
    
    set({
      shares: state.shares.map(s => s.id === shareId ? { ...s, karma: s.karma + 5 } : s),
      user: { ...state.user, dailyVotesUsed: state.user.dailyVotesUsed + 1, karma: state.user.karma + 2, totalVotesGiven: state.user.totalVotesGiven + 1 },
    });
    state.addNotification(`Голос за ${share.ticker}!`, 'info');
    state.updateQuestProgress('vote_friends', 1);
    state.persist();
    return null;
  },

  boostSelf: () => {
    const state = get();
    const cost = (state.user.selfBoostLevel + 1) * 100;
    if (state.user.selfBoostLevel >= 5) return 'Макс. уровень';
    if (state.user.balance < cost) return `Нужно ${cost} $KARMA`;

    set({
      user: { ...state.user, balance: state.user.balance - cost, selfBoostLevel: state.user.selfBoostLevel + 1, selfBoostExpiry: Date.now() + 86400000, karma: state.user.karma + 20 },
    });
    state.addNotification(`🚀 Буст карточки!`, 'success');
    state.updateQuestProgress('boost_self', 1);
    state.persist();
    return null;
  },
});
