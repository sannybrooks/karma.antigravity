import { create } from 'zustand';
import { GameState } from './types';
import { createUserSlice } from './slices/userSlice';
import { createTradeSlice } from './slices/tradeSlice';
import { createEconomySlice } from './slices/economySlice';
import { createPoolSlice } from './slices/poolSlice';
import { createQuestSlice } from './slices/questSlice';
import { createNotificationSlice } from './slices/notificationSlice';
import { DataServiceFactory } from '../services/dataServiceFactory';

const dataService = DataServiceFactory.getService();

export const useGameStore = create<GameState>((set, get, api) => ({
  ...createUserSlice(set, get, api),
  ...createTradeSlice(set, get, api),
  ...createEconomySlice(set, get, api),
  ...createPoolSlice(set, get, api),
  ...createQuestSlice(set, get, api),
  ...createNotificationSlice(set, get, api),

  initStore: async () => {
    try {
      console.log('[gameStore] Initializing store...');
      const data = await dataService.loadAll();
      if (data) {
        set((state) => ({
          ...state,
          user: data.user || state.user,
          shares: data.shares || state.shares,
          holdings: data.holdings || state.holdings,
          trades: data.trades || state.trades,
          pools: data.pools || state.pools,
          unclaimedDividends: data.unclaimedDividends ?? state.unclaimedDividends,
          dividendRecords: data.dividendRecords || state.dividendRecords,
          lastDividendCalc: data.lastDividendCalc ?? state.lastDividendCalc,
          nextDividendTime: data.nextDividendTime ?? state.nextDividendTime,
          boostCooldowns: data.boostCooldowns || state.boostCooldowns,
          referralEarnings: data.referralEarnings ?? state.referralEarnings,
          referralRecords: data.referralRecords || state.referralRecords,
          activeEvent: data.activeEvent || state.activeEvent,
          dailyQuests: data.dailyQuests || state.dailyQuests,
          stakingHistory: data.stakingHistory || state.stakingHistory,
        }));
        console.log('[gameStore] Store initialized from service');
      }
    } catch (error) {
      console.error('[gameStore] Initialization failed:', error);
    }
  },

  persist: async () => {
    try {
      const state = get();
      await dataService.saveAll({
        user: state.user,
        shares: state.shares,
        holdings: state.holdings,
        trades: state.trades,
        orders: state.orders,
        pools: state.pools,
        unclaimedDividends: state.unclaimedDividends,
        dividendRecords: state.dividendRecords,
        lastDividendCalc: state.lastDividendCalc,
        nextDividendTime: state.nextDividendTime,
        boostCooldowns: state.boostCooldowns,
        referralEarnings: state.referralEarnings,
        referralRecords: state.referralRecords,
        referralEarningHistory: state.referralEarningHistory,
        activeEvent: state.activeEvent,
        dailyQuests: state.dailyQuests,
        stakingHistory: state.stakingHistory,
      } as any);
    } catch (error) {
      console.error('[gameStore] Persist failed:', error);
    }
  },
}));
