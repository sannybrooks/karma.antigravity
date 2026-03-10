import { GameSlice, EconomySlice, DividendRecord, ReferralRecord, ReferralEarningRecord } from '../types';
import { 
  defaultUnclaimedDividends, defaultDividendRecords, defaultLastDividendCalc, 
  defaultNextDividendTime, defaultStakingHistory, defaultReferralEarnings, 
  defaultReferralRecords, defaultReferralEarningHistory 
} from '../initialState';
import { REFERRAL_TIERS, REFERRAL_ACHIEVEMENTS } from '../constants';

export const createEconomySlice: GameSlice<EconomySlice> = (set, get) => ({
  unclaimedDividends: defaultUnclaimedDividends,
  dividendRecords: defaultDividendRecords,
  lastDividendCalc: defaultLastDividendCalc,
  nextDividendTime: defaultNextDividendTime,
  stakingHistory: defaultStakingHistory,
  referralEarnings: defaultReferralEarnings,
  referralRecords: defaultReferralRecords,
  referralEarningHistory: defaultReferralEarningHistory,

  setNextDividendTime: (time) => set({ nextDividendTime: time }),

  calculateDividends: () => {
    const state = get();
    const now = Date.now();
    const isPremiumActive = state.user.premium && state.user.premiumExpiresAt > now;
    const DIVIDEND_INTERVAL = isPremiumActive ? 2 * 60 * 60 * 1000 : 4 * 60 * 60 * 1000;

    if (now < state.nextDividendTime) return;
    if (state.unclaimedDividends > 0) {
      set({ nextDividendTime: now + DIVIDEND_INTERVAL });
      return;
    }

    let total = 0;
    const records: DividendRecord[] = [];

    state.holdings.forEach(h => {
      if (now - h.boughtAt < 86400000) return;
      const share = state.shares.find(s => s.id === h.shareId);
      if (!share || !share.price24hAgo || share.price24hAgo <= 1) return;

      const priceGrowth = (share.currentPrice - share.price24hAgo) / share.price24hAgo;
      if (priceGrowth <= 0) return;

      const div = h.amount * priceGrowth * 0.025 * share.currentPrice;
      const multipliers = (state.user.poolId ? 1.2 : 1) * (state.user.level >= 10 ? 1.05 : 1) * (state.user.selfBoostExpiry > now ? 1 + state.user.selfBoostLevel * 0.05 : 1) * (isPremiumActive ? 1.25 : 1);
      
      const finalDiv = Math.round(div * multipliers * 100) / 100;
      if (finalDiv > 0.01) {
        total += finalDiv;
        records.push({ shareId: h.shareId, shareTicker: share.ticker, amount: finalDiv, timestamp: now });
      }
    });

    const apy = get().getStakingAPY();
    const lastClaim = state.user.lastStakingClaim || state.user.stakedAt || 0;
    const hours = (now - lastClaim) / 3600000;

    if (state.user.staked > 0 && state.user.autoCompound && isPremiumActive && hours >= 24) {
      const autoReward = Math.round(state.user.staked * apy * 100) / 100;
      set(s => ({ user: { ...s.user, staked: s.user.staked + autoReward, totalStakingReward: s.user.totalStakingReward + autoReward, lastStakingClaim: now } }));
    }

    const stakingReward = (!state.user.autoCompound && state.user.staked > 0) ? Math.round(state.user.staked * apy * hours * 100) / 100 : 0;
    total += stakingReward;

    set({
      unclaimedDividends: Math.round((state.unclaimedDividends + total) * 100) / 100,
      dividendRecords: [...state.dividendRecords, ...records],
      lastDividendCalc: now,
      nextDividendTime: now + DIVIDEND_INTERVAL,
    });
    if (total > 0.01) state.addNotification(`📈 Начислено ${total.toFixed(2)} $KARMA дивидендов!`, 'success');
    state.persist();
  },

  claimDividends: () => {
    const state = get();
    if (state.unclaimedDividends <= 0) return;
    set({
      user: { ...state.user, balance: state.user.balance + state.unclaimedDividends, karma: state.user.karma + Math.floor(state.unclaimedDividends * 0.5), totalDividendsClaimed: state.user.totalDividendsClaimed + 1 },
      unclaimedDividends: 0,
    });
    state.addNotification(`Получено ${state.unclaimedDividends.toFixed(2)} $KARMA`, 'success');
    state.updateQuestProgress('claim_dividends', 1);
    state.persist();
  },

  stake: (amount) => {
    const state = get();
    if (amount > state.user.balance || amount <= 0) return;
    const now = Date.now();
    set({
      user: { ...state.user, balance: state.user.balance - amount, staked: state.user.staked + amount, stakedAt: state.user.stakedAt ?? now, totalStaked: state.user.totalStaked + amount },
      stakingHistory: [...state.stakingHistory, { id: `s_${now}`, type: 'stake', amount, apy: get().getStakingAPY(), timestamp: now }],
    });
    state.addNotification(`🔒 Застейкано ${amount} $KARMA`, 'success');
    state.updateQuestProgress('stake_karma', amount);
    state.persist();
  },

  unstake: () => {
    const state = get();
    if (state.user.staked <= 0) return;
    const now = Date.now();
    const days = state.user.stakedAt ? (now - state.user.stakedAt) / 86400000 : 0;
    const reward = get().getStakingReward();
    
    if (days < 7) {
      const penalty = state.user.staked * 0.01;
      set({
        user: { ...state.user, balance: state.user.balance + state.user.staked - penalty, staked: 0, stakedAt: null, lastStakingClaim: 0, totalStakingReward: state.user.totalStakingReward - penalty },
        stakingHistory: [...state.stakingHistory, { id: `u_${now}`, type: 'unstake', amount: state.user.staked, reward: -penalty, timestamp: now }],
      });
      state.addNotification(`⚠️ Анстейк с пенальти 1%`, 'warning');
    } else {
      set({
        user: { ...state.user, balance: state.user.balance + state.user.staked + reward, staked: 0, stakedAt: null, lastStakingClaim: 0, totalStakingReward: state.user.totalStakingReward + reward },
        stakingHistory: [...state.stakingHistory, { id: `u_${now}`, type: 'unstake', amount: state.user.staked, reward, apy: get().getStakingAPY(), timestamp: now }],
      });
      state.addNotification(`✅ Анстейк выполнен`, 'success');
    }
    state.persist();
  },

  getStakingReward: () => {
    const state = get();
    if (state.user.staked <= 0 || !state.user.stakedAt) return 0;
    const last = state.user.lastStakingClaim || state.user.stakedAt;
    return Math.round(state.user.staked * get().getStakingAPY() * ((Date.now() - last) / 86400000) * 100) / 100;
  },

  getStakingAPY: () => {
    const state = get();
    const isPrem = state.user.premium && state.user.premiumExpiresAt > Date.now();
    let apy = isPrem ? 0.008 : 0.005;
    const s = state.user.staked;
    if (s >= 50000) apy += isPrem ? 0.0075 : 0.005;
    else if (s >= 10000) apy += isPrem ? 0.006 : 0.004;
    else if (s >= 5000) apy += isPrem ? 0.0045 : 0.003;
    else if (s >= 1500) apy += isPrem ? 0.003 : 0.002;
    else if (s >= 500) apy += isPrem ? 0.0015 : 0.001;
    return apy;
  },

  claimStakingReward: () => {
    const state = get();
    const reward = get().getStakingReward();
    if (reward <= 0.01) return;
    const now = Date.now();
    if (state.user.autoCompound) {
      set({ user: { ...state.user, staked: state.user.staked + reward, totalStakingReward: state.user.totalStakingReward + reward, lastStakingClaim: now }, stakingHistory: [...state.stakingHistory, { id: `c_${now}`, type: 'compound', amount: reward, apy: get().getStakingAPY(), timestamp: now }] });
    } else {
      set({ user: { ...state.user, balance: state.user.balance + reward, totalStakingReward: state.user.totalStakingReward + reward, lastStakingClaim: now }, stakingHistory: [...state.stakingHistory, { id: `cl_${now}`, type: 'claim', amount: reward, apy: get().getStakingAPY(), timestamp: now }] });
    }
    state.addNotification(`💰 Награда получена`, 'success');
    state.persist();
  },

  claimReferralEarnings: () => {
    const state = get();
    if (state.user.referralPendingEarnings <= 0) return;
    set({ user: { ...state.user, balance: state.user.balance + state.user.referralPendingEarnings, referralPendingEarnings: 0 } });
    state.addNotification(`💰 Выплачено реферальных`, 'success');
    state.persist();
  },

  getReferralTier: () => {
    const total = get().user.totalReferrals + get().user.referralLevel2Count;
    for (let i = REFERRAL_TIERS.length - 1; i >= 0; i--) if (total >= REFERRAL_TIERS[i].minReferrals) return REFERRAL_TIERS[i];
    return REFERRAL_TIERS[0];
  },

  getReferralStats: () => {
    const state = get();
    const now = Date.now();
    return {
      totalReferrals: state.referralRecords.length,
      activeReferrals: state.referralRecords.filter(r => r.lastActiveAt && (now - r.lastActiveAt) < 2592000000).length,
      totalEarned: state.user.referralTotalEarnings,
      totalPaid: state.user.referralTotalEarnings - state.user.referralPendingEarnings,
      tier: state.user.referralTier,
    };
  },

  getReferralAchievements: () => {
    const stats = get().getReferralStats();
    return REFERRAL_ACHIEVEMENTS.map(a => ({ ...a, unlocked: (get().user.referralAchievements || []).includes(a.id) || a.requirement(stats) }));
  },
});
