/* ===== Data Service Factory ===== */
/* Создаёт нужный сервис в зависимости от конфигурации */

import type { IDataService } from './dataService';
import { LocalStorageService } from './localStorageService';
import { ApiService } from './apiService';

export type DataServiceType = 'localStorage' | 'api';

export class DataServiceFactory {
  private static instance: IDataService | null = null;
  private static currentType: DataServiceType = 'localStorage';

  /**
   * Получить текущий тип сервиса
   */
  static getType(): DataServiceType {
    // Проверяем localStorage для переключения между режимами
    const saved = localStorage.getItem('km_data_service_type');
    if (saved === 'api' || saved === 'localStorage') {
      return saved;
    }
    return 'localStorage';
  }

  /**
   * Установить тип сервиса (требует перезагрузки)
   */
  static setType(type: DataServiceType): void {
    localStorage.setItem('km_data_service_type', type);
  }

  /**
   * Получить или создать сервис
   */
  static getService(): IDataService {
    if (this.instance) {
      return this.instance;
    }

    const type = this.getType();

    if (type === 'api') {
      this.instance = new ApiService();
      console.log('[DataServiceFactory] Using ApiService');
    } else {
      this.instance = new LocalStorageService();
      console.log('[DataServiceFactory] Using LocalStorageService');
    }

    return this.instance;
  }

  /**
   * Сбросить сервис (для переключения)
   */
  static reset(): void {
    this.instance = null;
  }

  /**
   * Переключить сервис и перезагрузить приложение
   */
  static async switchService(type: DataServiceType): Promise<void> {
    this.setType(type);
    this.reset();
    window.location.reload();
  }
}
