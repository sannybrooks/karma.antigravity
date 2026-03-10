import { GameSlice, QuestSlice } from '../types';
import { defaultDailyQuests, generateDailyQuests } from '../initialState';

export const createQuestSlice: GameSlice<QuestSlice> = (set, get) => ({
  dailyQuests: defaultDailyQuests,

  updateQuestProgress: (type, delta = 1) => {
    const state = get();
    const quests = state.dailyQuests.map(q => {
      if (q.type !== type || q.completed) return q;

      let newProgress = q.progress;
      if (type === 'buy_unique_shares') {
        newProgress = state.user.uniqueSharesBought.length;
      } else if (type === 'stake_karma') {
        newProgress = state.user.staked;
      } else if (type === 'login_streak') {
        newProgress = state.user.consecutiveLoginDays;
      } else {
        newProgress += delta;
      }

      const completed = newProgress >= q.target;
      return { ...q, progress: Math.min(newProgress, q.target), completed };
    });
    set({ dailyQuests: quests });
  },

  claimQuestReward: (questId) => {
    const state = get();
    const quest = state.dailyQuests.find(q => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return;

    const isPrem = state.user.premium && state.user.premiumExpiresAt > Date.now();
    const multiplier = isPrem ? 2 : 1;
    const reward = quest.reward * multiplier;
    const karmaReward = quest.karmaReward * multiplier;

    set({
      user: {
        ...state.user,
        balance: Math.round((state.user.balance + reward) * 100) / 100,
        karma: state.user.karma + karmaReward,
      },
      dailyQuests: state.dailyQuests.map(q =>
        q.id === questId ? { ...q, claimed: true } : q
      ),
    });
    const premLabel = isPrem ? ` (Premium x2!)` : '';
    state.addNotification(`🎯 Квест "${quest.title}" выполнен! +${reward} $K, +${karmaReward} карма${premLabel}`, 'success');
    state.persist();
  },

  resetDailyQuests: () => {
    const state = get();
    const isPrem = state.user.premium && state.user.premiumExpiresAt > Date.now();
    set({ dailyQuests: generateDailyQuests(isPrem) });
    state.persist();
  },
});
