/* ===== API Data Service Implementation (Заглушка) ===== */
/* Будущая реализация для работы с PostgreSQL через бэкенд.
   Сейчас возвращает mock-данные или данные из localStorage. */

import type { IDataService, IPersistData } from './dataService';
import type { User, Share, Holding, Trade, Pool, DividendRecord, Quest, BoostCooldown, ReferralRecord } from '../types';
import { LocalStorageService } from './localStorageService';

export class ApiService implements IDataService {
  private baseUrl = '/api'; // Будущий бэкенд
  private fallbackService: LocalStorageService;
  private useFallback = true; // Пока используем localStorage как fallback

  constructor() {
    this.fallbackService = new LocalStorageService();
  }

  /* ===== Инициализация ===== */
  async initialize(): Promise<void> {
    try {
      // Попытка подключения к API
      // await fetch(`${this.baseUrl}/health`);
      console.log('[ApiService] Connected to API');
      this.useFallback = false;
    } catch (error) {
      console.warn('[ApiService] API unavailable, using fallback');
      this.useFallback = true;
      await this.fallbackService.initialize();
    }
  }

  /* ===== Загрузка всех данных ===== */
  async loadAll(): Promise<IPersistData | null> {
    if (this.useFallback) {
      return await this.fallbackService.loadAll();
    }

    try {
      // Будущий API вызов
      // const res = await fetch(`${this.baseUrl}/data`);
      // return await res.json();
      return await this.fallbackService.loadAll();
    } catch (error) {
      console.error('[ApiService] Error loading data:', error);
      return await this.fallbackService.loadAll();
    }
  }

  /* ===== Сохранение всех данных ===== */
  async saveAll(data: IPersistData): Promise<void> {
    if (this.useFallback) {
      await this.fallbackService.saveAll(data);
      return;
    }

    try {
      // Будущий API вызов
      // await fetch(`${this.baseUrl}/data`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      await this.fallbackService.saveAll(data);
    } catch (error) {
      console.error('[ApiService] Error saving data:', error);
      await this.fallbackService.saveAll(data);
    }
  }

  /* ===== Отдельные методы ===== */

  async getUser(): Promise<User | null> {
    if (this.useFallback) return await this.fallbackService.getUser();
    // const res = await fetch(`${this.baseUrl}/user`);
    // return await res.json();
    return await this.fallbackService.getUser();
  }

  async saveUser(user: User): Promise<void> {
    if (this.useFallback) {
      await this.fallbackService.saveUser(user);
      return;
    }
    // await fetch(`${this.baseUrl}/user`, {
    //   method: 'PUT',
    //   body: JSON.stringify(user),
    // });
    await this.fallbackService.saveUser(user);
  }

  async getShares(): Promise<Share[] | null> {
    if (this.useFallback) return await this.fallbackService.getShares();
    return await this.fallbackService.getShares();
  }

  async saveShares(shares: Share[]): Promise<void> {
    if (this.useFallback) await this.fallbackService.saveShares(shares);
    else await this.fallbackService.saveShares(shares);
  }

  async getHoldings(): Promise<Holding[] | null> {
    if (this.useFallback) return await this.fallbackService.getHoldings();
    return await this.fallbackService.getHoldings();
  }

  async saveHoldings(holdings: Holding[]): Promise<void> {
    if (this.useFallback) await this.fallbackService.saveHoldings(holdings);
    else await this.fallbackService.saveHoldings(holdings);
  }

  async getTrades(): Promise<Trade[] | null> {
    if (this.useFallback) return await this.fallbackService.getTrades();
    return await this.fallbackService.getTrades();
  }

  async saveTrades(trades: Trade[]): Promise<void> {
    if (this.useFallback) await this.fallbackService.saveTrades(trades);
    else await this.fallbackService.saveTrades(trades);
  }

  async getPools(): Promise<Pool[] | null> {
    if (this.useFallback) return await this.fallbackService.getPools();
    return await this.fallbackService.getPools();
  }

  async savePools(pools: Pool[]): Promise<void> {
    if (this.useFallback) await this.fallbackService.savePools(pools);
    else await this.fallbackService.savePools(pools);
  }

  async getUnclaimedDividends(): Promise<number> {
    if (this.useFallback) return await this.fallbackService.getUnclaimedDividends();
    return await this.fallbackService.getUnclaimedDividends();
  }

  async saveUnclaimedDividends(amount: number): Promise<void> {
    if (this.useFallback) await this.fallbackService.saveUnclaimedDividends(amount);
    else await this.fallbackService.saveUnclaimedDividends(amount);
  }

  async getDividendRecords(): Promise<DividendRecord[] | null> {
    if (this.useFallback) return await this.fallbackService.getDividendRecords();
    return await this.fallbackService.getDividendRecords();
  }

  async saveDividendRecords(records: DividendRecord[]): Promise<void> {
    if (this.useFallback) await this.fallbackService.saveDividendRecords(records);
    else await this.fallbackService.saveDividendRecords(records);
  }

  async getLastDividendCalc(): Promise<number> {
    if (this.useFallback) return await this.fallbackService.getLastDividendCalc();
    return await this.fallbackService.getLastDividendCalc();
  }

  async saveLastDividendCalc(timestamp: number): Promise<void> {
    if (this.useFallback) await this.fallbackService.saveLastDividendCalc(timestamp);
    else await this.fallbackService.saveLastDividendCalc(timestamp);
  }

  async getNextDividendTime(): Promise<number> {
    if (this.useFallback) return await this.fallbackService.getNextDividendTime();
    return await this.fallbackService.getNextDividendTime();
  }

  async saveNextDividendTime(timestamp: number): Promise<void> {
    if (this.useFallback) await this.fallbackService.saveNextDividendTime(timestamp);
    else await this.fallbackService.saveNextDividendTime(timestamp);
  }

  async getBoostCooldowns(): Promise<BoostCooldown | null> {
    if (this.useFallback) return await this.fallbackService.getBoostCooldowns();
    return await this.fallbackService.getBoostCooldowns();
  }

  async saveBoostCooldowns(cooldowns: BoostCooldown): Promise<void> {
    if (this.useFallback) await this.fallbackService.saveBoostCooldowns(cooldowns);
    else await this.fallbackService.saveBoostCooldowns(cooldowns);
  }

  async getReferralEarnings(): Promise<number> {
    if (this.useFallback) return await this.fallbackService.getReferralEarnings();
    return await this.fallbackService.getReferralEarnings();
  }

  async saveReferralEarnings(amount: number): Promise<void> {
    if (this.useFallback) await this.fallbackService.saveReferralEarnings(amount);
    else await this.fallbackService.saveReferralEarnings(amount);
  }

  async getReferralRecords(): Promise<ReferralRecord[] | null> {
    if (this.useFallback) return await this.fallbackService.getReferralRecords();
    return await this.fallbackService.getReferralRecords();
  }

  async saveReferralRecords(records: ReferralRecord[]): Promise<void> {
    if (this.useFallback) await this.fallbackService.saveReferralRecords(records);
    else await this.fallbackService.saveReferralRecords(records);
  }

  async getActiveEvent(): Promise<any | null> {
    if (this.useFallback) return await this.fallbackService.getActiveEvent();
    return await this.fallbackService.getActiveEvent();
  }

  async saveActiveEvent(event: any): Promise<void> {
    if (this.useFallback) await this.fallbackService.saveActiveEvent(event);
    else await this.fallbackService.saveActiveEvent(event);
  }

  async getDailyQuests(): Promise<Quest[] | null> {
    if (this.useFallback) return await this.fallbackService.getDailyQuests();
    return await this.fallbackService.getDailyQuests();
  }

  async saveDailyQuests(quests: Quest[]): Promise<void> {
    if (this.useFallback) await this.fallbackService.saveDailyQuests(quests);
    else await this.fallbackService.saveDailyQuests(quests);
  }

  /* ===== Утилиты ===== */

  async clear(): Promise<void> {
    if (this.useFallback) await this.fallbackService.clear();
  }

  async exportData(): Promise<string> {
    const data = await this.loadAll();
    return JSON.stringify(data, null, 2);
  }

  async importData(json: string): Promise<void> {
    const data = JSON.parse(json) as IPersistData;
    await this.saveAll(data);
  }
}
