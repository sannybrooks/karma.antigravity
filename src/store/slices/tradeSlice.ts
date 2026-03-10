import { GameSlice, TradeSlice } from '../types';
import { defaultShares, defaultHoldings, defaultTrades, defaultOrders } from '../initialState';
import { REFERRAL_TIERS } from '../constants';

function calcSharePrice(share: any): number {
  const price = share.basePrice + (share.karma * 0.1) + (share.volume24h * 0.05) + share.hypeModifier;
  return Math.max(5, Math.round(price * 100) / 100);
}

export const createTradeSlice: GameSlice<TradeSlice> = (set, get) => ({
  shares: defaultShares,
  holdings: defaultHoldings,
  trades: defaultTrades,
  orders: defaultOrders,
  tradeModalShareId: null,
  activeEvent: null,

  setTradeModal: (id) => set({ tradeModalShareId: id }),

  updateSharePrices: () => set((state) => {
    const event = state.activeEvent;
    const eventMod = event && Date.now() < event.endsAt ? event.modifier : 0;
    const selfBoostActive = state.user.selfBoostExpiry > Date.now();
    const selfBoostMod = selfBoostActive ? state.user.selfBoostLevel * 3 : 0;

    const shares = state.shares.map(share => {
      const randomWalk = (Math.random() - 0.48) * share.currentPrice * 0.04;
      let extraMod = eventMod;
      if (share.ownerId === 'player_1' || share.username === state.user.username) {
        extraMod += selfBoostMod;
      }
      const newHype = share.hypeModifier + randomWalk + extraMod * 0.1;
      const clampedHype = Math.max(-50, Math.min(80, newHype));
      const updatedShare = { ...share, hypeModifier: clampedHype };
      const newPrice = calcSharePrice(updatedShare);

      const now = Date.now();
      let history = [...share.priceHistory];
      const lastCandle = history[history.length - 1];

      if (!lastCandle || now - lastCandle.time > 30 * 60 * 1000) {
        history.push({
          time: now, open: share.currentPrice, high: Math.max(share.currentPrice, newPrice),
          low: Math.min(share.currentPrice, newPrice), close: newPrice,
        });
        if (history.length > 100) history = history.slice(-100);
      } else {
        const last = { ...history[history.length - 1] };
        last.close = newPrice;
        last.high = Math.max(last.high, newPrice);
        last.low = Math.min(last.low, newPrice);
        history[history.length - 1] = last;
      }

      const price24hAgo = history.find(p => now - p.time >= 86400000)?.close ?? share.currentPrice * 0.9;

      return {
        ...updatedShare,
        previousPrice: share.currentPrice,
        currentPrice: newPrice,
        price24hAgo: Math.max(1, price24hAgo),
        priceHistory: history,
      };
    });

    // Ордера
    const pendingOrders = state.orders.filter(o => o.status === 'pending');
    pendingOrders.forEach(order => {
      const orderShare = shares.find(s => s.id === order.shareId);
      if (orderShare) {
        const canExecute = order.side === 'buy' ? orderShare.currentPrice <= order.price : orderShare.currentPrice >= order.price;
        if (canExecute) {
          setTimeout(() => {
            const res = get().executeTrade(order.shareId, order.side, order.amount, 'market');
            if (!res) {
              set(s => ({ orders: s.orders.map(o => o.id === order.id ? { ...o, status: 'filled' as const } : o) }));
              get().addNotification(`✅ Limit ордер исполнен!`, 'success');
            }
          }, 0);
        }
      }
    });

    return { shares };
  }),

  executeTrade: (shareId, side, amount, orderType, limitPrice) => {
    const state = get();
    const share = state.shares.find(s => s.id === shareId);
    if (!share) return 'Акция не найдена';
    if (amount <= 0) return 'Неверное количество';

    const isPremium = state.user.premium && state.user.premiumExpiresAt > Date.now();
    if (orderType === 'limit' && !isPremium) return 'Limit ордера доступны только Premium';

    if (orderType === 'limit' && limitPrice && limitPrice > 0) {
      const canExecuteNow = side === 'buy' ? share.currentPrice <= limitPrice : share.currentPrice >= limitPrice;
      if (!canExecuteNow) {
        const order = {
          id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: state.user.id, shareId, type: 'limit' as const, side, amount,
          price: limitPrice, targetPrice: limitPrice, status: 'pending' as const, createdAt: Date.now(),
        };
        set({ orders: [...state.orders, order] });
        state.addNotification(`🎯 Limit ордер создан: ${share.ticker}`, 'success');
        state.persist();
        return null;
      }
    }

    const price = (orderType === 'limit' && limitPrice) ? limitPrice : share.currentPrice;
    const totalCost = price * amount;
    const fee = totalCost * 0.005;
    const dailyVol = state.trades.filter(t => Date.now() - t.timestamp < 86400000).reduce((s, t) => s + t.price * t.amount, 0);
    const rebate = totalCost * (dailyVol > 10000 ? 0.005 : dailyVol > 1000 ? 0.003 : 0.001);

    if (side === 'buy') {
      if (state.user.balance < totalCost + fee) return 'Недостаточно $KARMA';
      if (!isPremium && state.user.totalTradesToday >= 50) return 'Лимит 50 трейдов/день';

      const existing = state.holdings.find(h => h.shareId === shareId);
      const newHoldings = existing 
        ? state.holdings.map(h => h.shareId === shareId ? { ...h, amount: h.amount + amount, avgBuyPrice: (h.avgBuyPrice * h.amount + price * amount) / (h.amount + amount) } : h)
        : [...state.holdings, { shareId, amount, avgBuyPrice: price, boughtAt: Date.now() }];

      const trade = { id: `t_${Date.now()}`, userId: state.user.id, shareId, side: 'buy' as const, amount, price, fee, rebate, timestamp: Date.now() };
      
      set({
        user: { 
          ...state.user, 
          balance: Math.round((state.user.balance - totalCost - fee + rebate) * 100) / 100,
          totalTradesToday: state.user.totalTradesToday + 1,
          totalTradesAllTime: state.user.totalTradesAllTime + 1,
          totalSharesBought: state.user.totalSharesBought + amount,
          uniqueSharesBought: [...new Set([...state.user.uniqueSharesBought, shareId])],
        },
        holdings: newHoldings,
        trades: [...state.trades, trade],
        shares: state.shares.map(s => s.id === shareId ? { ...s, volume24h: s.volume24h + amount, karma: s.karma + 1 } : s),
      });

      state.addNotification(`Куплено ${amount} ${share.ticker}`, 'success');
      state.updateQuestProgress('make_trades', 1);
      state.updateQuestProgress('buy_unique_shares', 0);
      if (state.user.poolId) state.trackPoolActivity('trade', 1);
      state.persist();
      return null;
    } else {
      const existing = state.holdings.find(h => h.shareId === shareId);
      if (!existing || existing.amount < amount) return 'Недостаточно акций';
      if (Date.now() - existing.boughtAt < 60000) return 'Мин. удержание: 1 мин.';

      const revenue = totalCost - fee + rebate;
      const pnl = (price - existing.avgBuyPrice) * amount;
      const newHoldings = existing.amount === amount ? state.holdings.filter(h => h.shareId !== shareId) : state.holdings.map(h => h.shareId === shareId ? { ...h, amount: h.amount - amount } : h);

      const trade = { id: `t_${Date.now()}`, userId: state.user.id, shareId, side: 'sell' as const, amount, price, fee, rebate, timestamp: Date.now() };

      set({
        user: {
          ...state.user,
          balance: Math.round((state.user.balance + revenue) * 100) / 100,
          karma: state.user.karma + (pnl > 0 ? Math.floor(pnl * 0.1) : 0),
          totalTradesToday: state.user.totalTradesToday + 1,
          totalTradesAllTime: state.user.totalTradesAllTime + 1,
        },
        holdings: newHoldings,
        trades: [...state.trades, trade],
        shares: state.shares.map(s => s.id === shareId ? { ...s, volume24h: s.volume24h + amount } : s),
      });

      state.addNotification(`Продано ${amount} ${share.ticker}. PNL: ${pnl.toFixed(1)}`, pnl >= 0 ? 'success' : 'warning');
      state.updateQuestProgress('make_trades', 1);
      if (pnl > 0) state.updateQuestProgress('earn_profit', Math.floor(pnl));
      if (state.user.poolId) state.trackPoolActivity('trade', 1);
      state.persist();
      return null;
    }
  },

  cancelOrder: (id) => set(s => ({ orders: s.orders.filter(o => o.id !== id) })),
  getOrders: () => get().orders.filter(o => o.status === 'pending'),
  
  triggerEvent: () => {
    const events = [
      { name: '🔥 Karma Friday — скидка 50%!', modifier: -15 },
      { name: '🚀 Influencer Pump — x2 Hype!', modifier: 25 },
      { name: '💎 Diamond Hour — +50% дивиденды', modifier: 10 },
      { name: '🌊 Whale Alert — высокая волатильность!', modifier: 20 },
    ];
    const ev = events[Math.floor(Math.random() * events.length)];
    set({ activeEvent: { name: ev.name, endsAt: Date.now() + 3600000, modifier: ev.modifier } });
    get().addNotification(ev.name, 'warning');
    get().persist();
  },
});
