import { GameSlice, UserSlice } from '../types';
import { defaultUser } from '../initialState';
import { getUserLevel } from '../constants';

export const createUserSlice: GameSlice<UserSlice> = (set, get) => ({
  user: defaultUser,
  screen: 'market',
  
  setScreen: (s) => set({ screen: s }),
  
  updateUser: (partial) => set((state) => {
    const updated = { ...state.user, ...partial };
    updated.level = getUserLevel(updated.karma).level;
    return { user: updated };
  }),

  completeOnboarding: () => {
    const state = get();
    if (state.user.onboarded) return;
    const randomShare = state.shares[Math.floor(Math.random() * state.shares.length)];
    const newHolding = {
      shareId: randomShare.id, amount: 10, avgBuyPrice: randomShare.currentPrice, boughtAt: Date.now(),
    };
    set({
      user: { ...state.user, balance: state.user.balance + 100, onboarded: true },
      holdings: [...state.holdings, newHolding],
    });
    state.addNotification('🎉 Бонус: 100 $KARMA + 10 акций!', 'success');
    state.persist();
  },

  subscribePremium: () => {
    const state = get();
    const now = Date.now();

    if (state.user.premium && state.user.premiumExpiresAt > now) {
      const cost = 500;
      if (state.user.balance < cost) return `Нужно ${cost} $KARMA для продления`;
      const newExpiry = state.user.premiumExpiresAt + 30 * 86400000;
      set({
        user: {
          ...state.user,
          balance: Math.round((state.user.balance - cost) * 100) / 100,
          premiumExpiresAt: newExpiry,
          totalPremiumDays: state.user.totalPremiumDays + 30,
        },
      });
      state.addNotification('👑 Premium продлён на +30 дней!', 'success');
      state.persist();
      return null;
    }

    const cost = 500;
    if (state.user.balance < cost) return `Нужно ${cost} $KARMA для Premium`;

    const expiresAt = now + 30 * 86400000;
    const currentTimeRemaining = Math.max(0, state.nextDividendTime - now);
    const newNextDividendTime = now + (currentTimeRemaining / 2);

    set({
      user: {
        ...state.user,
        balance: Math.round((state.user.balance - cost) * 100) / 100,
        premium: true,
        premiumExpiresAt: expiresAt,
        premiumPurchasedAt: state.user.premiumPurchasedAt || now,
        premiumTheme: 'gold',
        totalPremiumDays: state.user.totalPremiumDays + 30,
      },
      nextDividendTime: newNextDividendTime,
    });
    state.addNotification('👑 Premium активирован на 30 дней!', 'success');
    state.persist();
    return null;
  },

  checkPremiumExpiry: () => {
    const state = get();
    if (state.user.premium && state.user.premiumExpiresAt > 0 && Date.now() > state.user.premiumExpiresAt) {
      const now = Date.now();
      const currentTimeRemaining = Math.max(0, state.nextDividendTime - now);
      const newNextDividendTime = now + (currentTimeRemaining * 2);

      set({
        user: {
          ...state.user,
          premium: false,
          premiumExpiresAt: 0,
        },
        nextDividendTime: newNextDividendTime,
      });
      state.addNotification('⚠️ Premium подписка истекла', 'warning');
      state.persist();
    }
  },
});
