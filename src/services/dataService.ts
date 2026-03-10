/* ===== Data Service Interface ===== */
/* Этот интерфейс определяет контракт для работы с данными.
   Реализации: LocalStorageService (сейчас), ApiService (в будущем) */

import type {
  User,
  Share,
  Holding,
  Trade,
  Order,
  Pool,
  DividendRecord,
  Quest,
  BoostCooldown,
  ReferralRecord,
  ReferralEarningRecord,
  StakingRecord,
} from '../types';

export interface IPersistData {
  user: User;
  shares: Share[];
  holdings: Holding[];
  trades: Trade[];
  orders: Order[];
  pools: Pool[];
  unclaimedDividends: number;
  dividendRecords: DividendRecord[];
  lastDividendCalc: number;
  nextDividendTime: number;
  boostCooldowns: BoostCooldown;
  referralEarnings: number;
  referralEarningHistory: ReferralEarningRecord[];
  activeEvent: any;
  dailyQuests: Quest[];
  stakingHistory: StakingRecord[];
}

export interface IDataService {
  /* ===== Инициализация ===== */
  initialize(): Promise<void>;

  /* ===== Загрузка всех данных ===== */
  loadAll(): Promise<IPersistData | null>;

  /* ===== Сохранение всех данных ===== */
  saveAll(data: IPersistData): Promise<void>;

  /* ===== Отдельные методы для гибкости ===== */

  // Пользователь
  getUser(): Promise<User | null>;
  saveUser(user: User): Promise<void>;

  // Акции
  getShares(): Promise<Share[] | null>;
  saveShares(shares: Share[]): Promise<void>;

  // Портфель
  getHoldings(): Promise<Holding[] | null>;
  saveHoldings(holdings: Holding[]): Promise<void>;

  // Торги
  getTrades(): Promise<Trade[] | null>;
  saveTrades(trades: Trade[]): Promise<void>;

  // Пулы
  getPools(): Promise<Pool[] | null>;
  savePools(pools: Pool[]): Promise<void>;

  // Дивиденды
  getUnclaimedDividends(): Promise<number>;
  saveUnclaimedDividends(amount: number): Promise<void>;
  getDividendRecords(): Promise<DividendRecord[] | null>;
  saveDividendRecords(records: DividendRecord[]): Promise<void>;

  // Таймеры дивидендов
  getLastDividendCalc(): Promise<number>;
  saveLastDividendCalc(timestamp: number): Promise<void>;
  getNextDividendTime(): Promise<number>;
  saveNextDividendTime(timestamp: number): Promise<void>;

  // Бусты
  getBoostCooldowns(): Promise<BoostCooldown | null>;
  saveBoostCooldowns(cooldowns: BoostCooldown): Promise<void>;

  // Рефералы
  getReferralEarnings(): Promise<number>;
  saveReferralEarnings(amount: number): Promise<void>;
  getReferralRecords(): Promise<ReferralRecord[] | null>;
  saveReferralRecords(records: ReferralRecord[]): Promise<void>;

  // События
  getActiveEvent(): Promise<any | null>;
  saveActiveEvent(event: any): Promise<void>;

  // Квесты
  getDailyQuests(): Promise<Quest[] | null>;
  saveDailyQuests(quests: Quest[]): Promise<void>;

  /* ===== Утилиты ===== */
  clear(): Promise<void>;
  exportData(): Promise<string>;
  importData(json: string): Promise<void>;
}
