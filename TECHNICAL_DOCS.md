# KarmaMarket — Полная техническая документация

**Версия документа:** 1.0  
**Дата обновления:** 6 марта 2026  
**Статус:** Production MVP

---

## 📑 Оглавление

1. [Обзор проекта](#1-обзор-проекта)
2. [Архитектура](#2-архитектура)
3. [Технологический стек](#3-технологический-стек)
4. [Структура проекта](#4-структура-проекта)
5. [База данных и хранение](#5-база-данных-и-хранение)
6. [Глобальное состояние](#6-глобальное-состояние)
7. [Компоненты](#7-компоненты)
8. [Бизнес-логика](#8-бизнес-логика)
9. [Система уровней](#9-система-уровней)
10. [Реферальная программа](#10-реферальная-программа)
11. [Премиум подписка](#11-премиум-подписка)
12. [Торговая система](#12-торговая-система)
13. [Дивиденды](#13-дивиденды)
14. [Стейкинг](#14-стейкинг)
15. [Квесты](#15-квесты)
16. [Пулы](#16-пулы)
17. [AI-советник](#17-ai-советник)
18. [Telegram Web App](#18-telegram-web-app)
19. [Сборка и развёртывание](#19-сборка-и-развёртывание)
20. [Тестирование](#20-тестирование)
21. [Производительность](#21-производительность)
22. [Безопасность](#22-безопасность)
23. [Мониторинг и логи](#23-мониторинг-и-логи)
24. [План развития](#24-план-развития)

---

## 1. Обзор проекта

### 1.1 Назначение

**KarmaMarket** — это интерактивное веб-приложение (Telegram Web App), представляющее собой симулятор биржи кармы. Пользователи могут:

- Покупать и продавать «акции» других пользователей
- Получать пассивный доход от дивидендов
- Участвовать в реферальной программе (2 уровня)
- Выполнять ежедневные квесты
- Вступать в пулы (команды)
- Стейкать токены $KARMA
- Получать Premium-подписку с расширенными возможностями

### 1.2 Целевая аудитория

- Пользователи Telegram (мобильные устройства)
- Возраст: 16-35 лет
- Интересы: криптовалюты, трейдинг, социальные игры, пассивный доход

### 1.3 Ключевые метрики (MVP)

| Метрика | Значение |
|---------|----------|
| Стартовый баланс | 2000 $KARMA + 100 бонус |
| Минимальная сделка | 1 акция |
| Комиссия | 0.5% |
| Дивиденды | каждые 2-4 часа |
| Стейкинг APY | 0.5-0.8%/день |
| Premium цена | 500 $KARMA/мес |

---

## 2. Архитектура

### 2.1 Высокоуровневая архитектура

```
┌─────────────────────────────────────────────────────────┐
│                    Telegram Web App                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │              React 19 + TypeScript                │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │  │
│  │  │ Components  │  │   Screens   │  │  Modals   │ │  │
│  │  └─────────────┘  └─────────────┘  └───────────┘ │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │         Zustand Store (gameStore)           │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  │  ┌─────────────┐  ┌───────────────────────────┐ │  │
│  │  │   Services  │  │   LocalStorage / API      │ │  │
│  │  └─────────────┘  └───────────────────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Слои приложения

| Слой | Технологии | Ответственность |
|------|------------|-----------------|
| Presentation | React, Tailwind CSS | UI, анимации, темы |
| State Management | Zustand | Глобальное состояние, бизнес-логика |
| Data Access | LocalStorageService, ApiService | CRUD операции |
| External | Telegram Web App API | Интеграция с Telegram |

### 2.3 Поток данных

```
User Action → Component → Zustand Action → State Update → Persist → UI Re-render
                              ↓
                        Side Effects (notifications, quest progress)
```

---

## 3. Технологический стек

### 3.1 Основные зависимости

```json
{
  "react": "19.2.3",
  "react-dom": "19.2.3",
  "typescript": "5.9.3",
  "vite": "7.2.4",
  "zustand": "5.0.11",
  "tailwindcss": "4.1.17",
  "framer-motion": "^12.34.3",
  "lucide-react": "^0.575.0",
  "chart.js": "^4.5.1",
  "react-chartjs-2": "^5.3.1",
  "clsx": "2.1.1",
  "tailwind-merge": "3.4.0",
  "jspdf": "^4.2.0"
}
```

### 3.2 Dev-зависимости

```json
{
  "@tailwindcss/vite": "4.1.17",
  "@vitejs/plugin-react": "5.1.1",
  "@types/node": "^22.0.0",
  "@types/react": "19.2.7",
  "@types/react-dom": "19.2.3",
  "vite-plugin-singlefile": "2.3.0"
}
```

### 3.3 Требования к среде

| Компонент | Версия | Примечание |
|-----------|--------|------------|
| Node.js | 18+ | Для сборки |
| npm | 9+ | Менеджер пакетов |
| Браузер | Chrome 90+ | Mobile-first |
| Telegram | Web App API | Интеграция |

---

## 4. Структура проекта

```
karma.antigravity/
├── index.html                 # Точка входа HTML
├── package.json               # Зависимости и скрипты
├── tsconfig.json              # Конфигурация TypeScript
├── vite.config.ts             # Конфигурация Vite
│
├── src/
│   ├── main.tsx               # Entry point React
│   ├── App.tsx                # Главный компонент
│   ├── types.ts               # Все TypeScript типы
│   ├── index.css              # Глобальные стили
│   │
│   ├── components/
│   │   ├── screens/
│   │   │   ├── MarketScreen.tsx      # Экран маркета
│   │   │   ├── PortfolioScreen.tsx   # Экран портфеля
│   │   │   ├── RewardsScreen.tsx     # Экран наград
│   │   │   ├── FriendsScreen.tsx     # Экран друзей
│   │   │   ├── ProfileScreen.tsx     # Экран профиля
│   │   │   ├── AdvisorScreen.tsx     # AI-советник
│   │   │   └── DevToolsScreen.tsx    # Инструменты dev
│   │   │
│   │   ├── BottomNav.tsx             # Нижняя навигация
│   │   ├── MiniChart.tsx             # Графики (Mini, Full)
│   │   ├── TradeModal.tsx            # Модалка торговли
│   │   ├── OnboardingModal.tsx       # Tutorial
│   │   ├── PremiumModal.tsx          # Модалка Premium
│   │   └── NotificationToast.tsx     # Уведомления
│   │
│   ├── store/
│   │   ├── gameStore.ts              # Игровой стор (~1800 строк)
│   │   └── themeStore.ts             # Тема (dark/light)
│   │
│   ├── data/
│   │   └── seed.ts                   # Генераторы данных
│   │
│   ├── services/
│   │   ├── dataService.ts            # Интерфейс IDataService
│   │   ├── dataServiceFactory.ts     # Фабрика сервисов
│   │   ├── localStorageService.ts    # LocalStorage реализация
│   │   └── apiService.ts             # API заглушка
│   │
│   └── utils/
│       └── cn.ts                     # Утилита классов
│
├── node_modules/
└── dist/                     # Production сборка
```

---

## 5. База данных и хранение

### 5.1 Текущее хранилище: LocalStorage

| Ключ | Тип | Описание |
|------|-----|----------|
| `km_user` | User | Данные пользователя |
| `km_shares` | Share[] | Массив всех акций |
| `km_holdings` | Holding[] | Портфель пользователя |
| `km_trades` | Trade[] | История трейдов |
| `km_orders` | Order[] | Отложенные ордера |
| `km_pools` | Pool[] | Пулы |
| `km_unclaimed_div` | number | Несобранные дивиденды |
| `km_div_records` | DividendRecord[] | История дивидендов |
| `km_last_div_calc` | number | Время последнего расчёта |
| `km_next_dividend_time` | number | Время следующего начисления |
| `km_boost_cd` | BoostCooldown | Кулдауны бустов |
| `km_referral_earn` | number | Реферальные доходы |
| `km_referral_records` | ReferralRecord[] | Рефералы |
| `km_event` | Event | Активное событие |
| `km_daily_quests` | Quest[] | Ежедневные квесты |
| `km_staking_history` | StakingRecord[] | История стейкинга |
| `km_theme` | 'dark' \| 'light' | Тема |
| `km_data_service_type` | string | Тип сервиса |

### 5.2 Структура IPersistData

```typescript
interface IPersistData {
  user: User;
  shares: Share[];
  holdings: Holding[];
  trades: Trade[];
  pools: Pool[];
  unclaimedDividends: number;
  dividendRecords: DividendRecord[];
  lastDividendCalc: number;
  nextDividendTime: number;
  boostCooldowns: BoostCooldown;
  referralEarnings: number;
  referralRecords: ReferralRecord[];
  activeEvent: Event | null;
  dailyQuests: Quest[];
}
```

### 5.3 Будущая миграция на PostgreSQL

```sql
-- Таблица пользователей
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  karma INTEGER DEFAULT 0,
  balance DECIMAL(20, 8) DEFAULT 0,
  premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMP,
  referral_code VARCHAR(20) UNIQUE,
  referred_by VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица акций
CREATE TABLE shares (
  id VARCHAR(50) PRIMARY KEY,
  owner_id VARCHAR(50) REFERENCES users(id),
  ticker VARCHAR(20),
  karma INTEGER,
  base_price DECIMAL(10, 2),
  current_price DECIMAL(10, 2),
  volume_24h INTEGER,
  hype_modifier DECIMAL(5, 2)
);

-- Таблица портфеля
CREATE TABLE holdings (
  user_id VARCHAR(50) REFERENCES users(id),
  share_id VARCHAR(50) REFERENCES shares(id),
  amount INTEGER,
  avg_buy_price DECIMAL(10, 2),
  bought_at TIMESTAMP,
  PRIMARY KEY (user_id, share_id)
);

-- Таблица трейдов
CREATE TABLE trades (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id),
  share_id VARCHAR(50) REFERENCES shares(id),
  side VARCHAR(4),
  amount INTEGER,
  price DECIMAL(10, 2),
  fee DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6. Глобальное состояние

### 6.1 gameStore.ts — центральное хранилище

**Размер:** ~1800 строк  
**Технология:** Zustand 5.0.11

#### Категории методов:

| Категория | Методы | Описание |
|-----------|--------|----------|
| Навигация | `setScreen` | Переключение экранов |
| Пользователь | `updateUser` | Обновление данных пользователя |
| Акции | `updateSharePrices` | Обновление цен (каждые 10 сек) |
| Торги | `executeTrade`, `cancelOrder`, `getOrders` | Покупка/продажа |
| Дивиденды | `calculateDividends`, `claimDividends` | Начисление и сбор |
| Стейкинг | `stake`, `unstake`, `getStakingReward`, `claimStakingReward` | Управление стейком |
| Социалка | `boostFriend`, `voteFriend`, `boostSelf` | Бусты и голоса |
| Пулы | `createPool`, `joinPool`, `leavePool`, `boostPool` | Управление пулами |
| Рефералы | `claimReferralEarnings`, `getReferralTier` | Реферальная программа |
| Квесты | `updateQuestProgress`, `claimQuestReward`, `resetDailyQuests` | Система квестов |
| Premium | `subscribePremium`, `checkPremiumExpiry` | Подписка |
| Утилиты | `persist` | Сохранение в localStorage |

### 6.2 themeStore.ts — управление темой

```typescript
interface ThemeState {
  mode: 'dark' | 'light';
  theme: Theme;
  toggle: () => void;
  setMode: (m: ThemeMode) => void;
}
```

### 6.3 Auto-save механизм

```typescript
// App.tsx — каждые 30 секунд
useEffect(() => {
  let isSaving = false;
  const interval = setInterval(async () => {
    if (isSaving) return;
    isSaving = true;
    try {
      await persist();
    } catch (err) {
      console.error('[Auto-save] err:', err);
    } finally {
      isSaving = false;
    }
  }, 30000);
  return () => clearInterval(interval);
}, [persist]);
```

---

## 7. Компоненты

### 7.1 Экраны (Screens)

| Компонент | Строк | Описание |
|-----------|-------|----------|
| MarketScreen | 350 | Список акций, фильтры, поиск, order book |
| PortfolioScreen | 770 | Портфель, позиции, PNL, графики, отчёты |
| RewardsScreen | 730 | Квесты, дивиденды, стейкинг |
| FriendsScreen | 1350 | Друзья, пулы, рефералы, Canvas-стикеры |
| ProfileScreen | 585 | Профиль, настройки карточки, буст |
| AdvisorScreen | 750 | AI-советник (Premium) |
| DevToolsScreen | 820 | Инструменты разработчика |

### 7.2 Модалки

| Компонент | Строк | Описание |
|-----------|-------|----------|
| TradeModal | 600 | Торговля, графики, RSI, Limit ордера |
| PremiumModal | 400 | Перки Premium, покупка подписки |
| OnboardingModal | 150 | Tutorial для новых пользователей |
| NotificationToast | 50 | Всплывающие уведомления |

### 7.3 Общие компоненты

| Компонент | Строк | Описание |
|-----------|-------|----------|
| BottomNav | 100 | Нижняя навигация (6 табов) |
| MiniChart | 200 | Графики (sparkline, свечи) |

---

## 8. Бизнес-логика

### 8.1 Формула цены акции

```typescript
function calcSharePrice(share: Share): number {
  const price = share.basePrice 
              + (share.karma * 0.1) 
              + (share.volume24h * 0.05) 
              + share.hypeModifier;
  return Math.max(10, Math.round(price * 100) / 100);
}
```

**Параметры:**
- `basePrice` — базовая цена (100)
- `karma` — карма пользователя
- `volume24h` — объём торгов за 24 часа
- `hypeModifier` — модификатор хайпа (-50 до 80)

### 8.2 Обновление цен

```typescript
// Каждые 10 секунд
updateSharePrices: () => {
  const event = state.activeEvent;
  const eventMod = event && Date.now() < event.endsAt ? event.modifier : 0;
  
  const shares = state.shares.map(share => {
    const randomWalk = (Math.random() - 0.48) * share.currentPrice * 0.04;
    const newHype = share.hypeModifier + randomWalk + eventMod * 0.1;
    const clampedHype = Math.max(-50, Math.min(80, newHype));
    
    const newPrice = calcSharePrice({ ...share, hypeModifier: clampedHype });
    // Обновление истории цен...
    return { ...share, previousPrice, currentPrice: newPrice, ... };
  });
  
  // Проверка Limit ордеров...
  return { shares };
}
```

---

## 9. Система уровней

### 9.1 Уровни пользователя (20 уровней)

| Уровень | Название | Иконка | Карма | Бонус див. | Лимит портфеля | APY бонус | Ребейт бонус |
|---------|----------|--------|-------|------------|----------------|-----------|--------------|
| 1 | Новичок | 🌱 | 0 | 0% | 10 | 0% | 0% |
| 2 | Ученик | 🌿 | 50 | 1% | 15 | 0.5% | 1% |
| 3 | Трейдер | 🍀 | 120 | 2% | 20 | 1% | 2% |
| 4 | Опытный | 🌳 | 200 | 3% | 30 | 1.5% | 3% |
| 5 | Эксперт | ⭐ | 350 | 5% | 40 | 2% | 5% |
| 6 | Мастер | 🌟 | 500 | 6% | 50 | 2.5% | 6% |
| 7 | Профи | 💫 | 700 | 8% | 60 | 3% | 7% |
| 8 | Элита | 🔥 | 1000 | 10% | 75 | 4% | 8% |
| 9 | Легенда | 💎 | 1500 | 12% | 90 | 5% | 9% |
| 10 | Магнат | 👑 | 2000 | 15% | 100 | 6% | 10% |
| 11 | Титан | 🏆 | 3000 | 18% | 120 | 7% | 12% |
| 12 | Олигарх | 💰 | 4000 | 20% | 140 | 8% | 13% |
| 13 | Воротила | 🦈 | 5500 | 22% | 160 | 9% | 14% |
| 14 | Империя | 🏰 | 7000 | 25% | 180 | 10% | 15% |
| 15 | Монарх | 🤴 | 9000 | 28% | 200 | 12% | 17% |
| 16 | Оракул | 🔮 | 12000 | 32% | 250 | 14% | 18% |
| 17 | Архонт | ⚜️ | 16000 | 38% | 300 | 16% | 20% |
| 18 | Демиург | 🌀 | 22000 | 42% | 350 | 18% | 22% |
| 19 | Абсолют | ✨ | 30000 | 48% | 400 | 20% | 25% |
| 20 | Бог Кармы | 🌌 | 50000 | 50% | 500 | 25% | 30% |

### 9.2 Расчёт уровня

```typescript
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
```

---

## 10. Реферальная программа

### 10.1 Уровни рефералов (5 уровней)

| Уровень | Название | Иконка | Мин. рефералов | Бонус |
|---------|----------|--------|----------------|-------|
| 1 | Новичок | 🥉 | 0 | 5% |
| 2 | Активный | 👤 | 3 | 7% |
| 3 | Лидер | ⭐ | 10 | 10% |
| 4 | Магнат | 💎 | 25 | 15% |
| 5 | Легенда | 👑 | 50 | 20% |

### 10.2 Структура отчислений

```
Прямой реферал (1 уровень): 5-20% от комиссии
Косвенный реферал (2 уровень): 2% фиксировано
```

### 10.3 Типы действий для отчислений

```typescript
type ReferralAction = 
  | 'trade_buy'      // Покупка акций
  | 'trade_sell'     // Продажа акций
  | 'boost'          // Буст друга
  | 'dividend'       // Получение дивидендов
```

### 10.4 Достижения рефералов

| ID | Название | Требование | Награда |
|----|----------|------------|---------|
| first_referral | Первый реферал | 1 реферал | 50 карма + 🥇 |
| three_friends | Три друга | 3 реферала | 200 $K + 👥 |
| ten_referrals | Лидер | 10 рефералов | 500 карма + 1000 $K + ⭐ |
| active_network | Активная сеть | 5 активных | 300 карма + 🔥 |
| earnings_master | Мастер заработка | 5000 $K доход | 2000 $K + 💰 |
| two_tier_king | Двухуровневый король | 20 рефералов | 1000 карма + 5000 $K + 👑 |

---

## 11. Премиум подписка

### 11.1 Условия

| Параметр | Значение |
|----------|----------|
| Цена | 500 $KARMA |
| Период | 30 дней |
| Автопродление | Да (сгорание 40% + пул 60%) |

### 11.2 Перки (10 штук)

| № | Перк | Free | Premium |
|---|------|------|---------|
| 1 | Трейды/день | 50 | ♾️ |
| 2 | Дивиденды интервал | 4 часа | 2 часа |
| 3 | Дивиденды бонус | 0% | +25% |
| 4 | Стейкинг APY | 0.5%/день | 0.8%/день |
| 5 | Limit ордера | ❌ | ✅ |
| 6 | RSI/MA графики | ❌ | ✅ |
| 7 | VIP маркет | ❌ | ✅ |
| 8 | AI-советник | ❌ | ✅ |
| 9 | Создание пулов | ❌ | ✅ |
| 10 | Квесты награда | 100% | 200% (x2) |

### 11.3 Проверка Premium

```typescript
const isPremium = user.premium && user.premiumExpiresAt > Date.now();
```

---

## 12. Торговая система

### 12.1 Типы ордеров

| Тип | Описание | Доступно |
|-----|----------|----------|
| Market | Исполняется по текущей цене | Все |
| Limit | Исполняется при достижении цены | Premium |

### 12.2 Комиссии и рибэты

```typescript
// Комиссия: 0.5%
const fee = totalCost * 0.005;

// Рибэт в зависимости от объёма
const rebateRate = dailyVol > 10000 ? 0.005 : dailyVol > 1000 ? 0.003 : 0.001;
const rebate = totalCost * rebateRate;
```

### 12.3 Ограничения

| Параметр | Free | Premium |
|----------|------|---------|
| Трейдов/день | 50 | ♾️ |
| Мин. сумма | 10 $K | 10 $K |
| Мин. удержание | 1 минута | 1 минута |

### 12.4 Limit ордера

```typescript
// Создание ордера
if (orderType === 'limit' && limitPrice && limitPrice > 0) {
  const canExecuteNow = side === 'buy' 
    ? share.currentPrice <= limitPrice 
    : share.currentPrice >= limitPrice;
  
  if (!canExecuteNow) {
    // Создаём отложенный ордер
    const order: Order = {
      id: `order_${Date.now()}`,
      type: 'limit',
      side,
      amount,
      price: limitPrice,
      status: 'pending',
    };
    set({ orders: [...state.orders, order] });
  }
}

// Проверка при обновлении цен
pendingOrders.forEach(order => {
  const canExecute = order.side === 'buy'
    ? share.currentPrice <= order.price
    : share.currentPrice >= order.price;
  
  if (canExecute) {
    executeTrade(order.shareId, order.side, order.amount, 'market');
  }
});
```

---

## 13. Дивиденды

### 13.1 Интервалы начисления

| Статус | Интервал | Тестовый режим |
|--------|----------|----------------|
| Free | 4 часа | 10 секунд |
| Premium | 2 часа | 10 секунд |

### 13.2 Условия получения

- Акция должна быть куплена 24+ часа назад
- Цена должна вырасти за 24 часа
- Несобранные дивиденды должны быть собраны

### 13.3 Формула расчёта

```typescript
// Базовая ставка: 2.5% годовых
const divRate = 0.025;

// Рост цены за 24 часа
const priceGrowth = (share.currentPrice - share.price24hAgo) / share.price24hAgo;

// Базовые дивиденды
const div = h.amount * priceGrowth * divRate * share.currentPrice;

// Множители
const squadBonus = state.user.poolId ? 1.2 : 1.0;      // +20% за пул
const levelBonus = state.user.level >= 10 ? 1.05 : 1.0; // +5% за уровень 10+
const selfBoostBonus = state.user.selfBoostExpiry > now 
  ? 1 + state.user.selfBoostLevel * 0.05 : 1.0;        // +5%/ур буст
const premiumDivBonus = isPremiumActive ? 1.25 : 1.0;   // +25% Premium

const finalDiv = div * squadBonus * levelBonus * selfBoostBonus * premiumDivBonus;
```

### 13.4 Процесс начисления

```typescript
calculateDividends: () => {
  const now = Date.now();
  const isPremiumActive = state.user.premium && state.user.premiumExpiresAt > now;
  const DIVIDEND_INTERVAL = isPremiumActive ? 2 * 60 * 60 * 1000 : 4 * 60 * 60 * 1000;
  
  // Проверка: время наступило?
  if (now < state.nextDividendTime) return;
  
  // Проверка: собраны ли предыдущие?
  if (state.unclaimedDividends > 0) {
    set({ nextDividendTime: now + DIVIDEND_INTERVAL });
    return;
  }
  
  // Расчёт для каждой акции
  state.holdings.forEach(h => {
    if (Date.now() - h.boughtAt < 86400000) return; // 24 часа
    const share = state.shares.find(s => s.id === h.shareId);
    const priceGrowth = (share.currentPrice - share.price24hAgo) / share.price24hAgo;
    if (priceGrowth <= 0) return;
    
    const div = h.amount * priceGrowth * 0.025 * share.currentPrice;
    const finalDiv = div * squadBonus * levelBonus * selfBoostBonus * premiumDivBonus;
    
    total += finalDiv;
    records.push({ shareId: h.shareId, shareTicker: share.ticker, amount: finalDiv });
  });
  
  set({
    unclaimedDividends: total,
    dividendRecords: [...state.dividendRecords, ...records],
    nextDividendTime: now + DIVIDEND_INTERVAL,
  });
}
```

---

## 14. Стейкинг

### 14.1 Уровни стейкинга

| Уровень | Название | Мин. сумма | Бонус APY (Free) | Бонус APY (Premium) |
|---------|----------|------------|------------------|---------------------|
| 1 | Bronze | 500 $K | +0.1% | +0.15% |
| 2 | Silver | 1500 $K | +0.2% | +0.3% |
| 3 | Gold | 5000 $K | +0.3% | +0.45% |
| 4 | Platinum | 10000 $K | +0.4% | +0.6% |
| 5 | Diamond | 50000 $K | +0.5% | +0.75% |

### 14.2 Базовый APY

| Статус | APY в день | APY в неделю |
|--------|------------|--------------|
| Free | 0.5% | 3.5% |
| Premium | 0.8% | 5.6% |

### 14.3 Формула награды

```typescript
getStakingAPY: () => {
  const isPrem = state.user.premium && state.user.premiumExpiresAt > Date.now();
  let baseAPY = isPrem ? 0.008 : 0.005;
  
  const staked = state.user.staked;
  if (staked >= 50000) baseAPY += isPrem ? 0.0075 : 0.005;
  else if (staked >= 10000) baseAPY += isPrem ? 0.006 : 0.004;
  else if (staked >= 5000) baseAPY += isPrem ? 0.0045 : 0.003;
  else if (staked >= 1500) baseAPY += isPrem ? 0.003 : 0.002;
  else if (staked >= 500) baseAPY += isPrem ? 0.0015 : 0.001;
  
  return baseAPY; // APY в день
}

getStakingReward: () => {
  const lastClaimTime = state.user.lastStakingClaim || state.user.stakedAt;
  const daysSinceClaim = (Date.now() - lastClaimTime) / 86400000;
  const dailyAPY = get().getStakingAPY();
  
  return Math.round(state.user.staked * dailyAPY * daysSinceClaim * 100) / 100;
}
```

### 14.4 Условия

| Параметр | Значение |
|----------|----------|
| Мин. сумма | 1 $K |
| Кулдаун | 7 дней |
| Пенальти (ранний вывод) | 1% |
| Auto-compound | Premium (каждые 24ч) |
| Частота клейма | 24 часа |

### 14.5 Операции стейкинга

```typescript
stake: (amount) => {
  // Внесение в стейкинг
  set({
    user: {
      ...state.user,
      balance: state.user.balance - amount,
      staked: state.user.staked + amount,
      stakedAt: state.user.stakedAt ?? now,
    },
    stakingHistory: [...state.stakingHistory, { type: 'stake', amount, apy, timestamp: now }],
  });
}

unstake: () => {
  const daysStaked = (Date.now() - state.user.stakedAt) / 86400000;
  const reward = get().getStakingReward();
  
  if (daysStaked < 7) {
    // Ранний анстейк с пенальти
    const penalty = state.user.staked * 0.01;
    const returned = state.user.staked - penalty;
    set({ user: { ...state.user, balance: state.user.balance + returned, staked: 0 } });
  } else {
    // Успешный анстейк
    set({ user: { ...state.user, balance: state.user.balance + state.user.staked + reward, staked: 0 } });
  }
}

claimStakingReward: () => {
  const reward = get().getStakingReward();
  if (state.user.autoCompound) {
    // Реинвестирование
    set({ user: { ...state.user, staked: state.user.staked + reward } });
  } else {
    // Забрать награду
    set({ user: { ...state.user, balance: state.user.balance + reward } });
  }
}
```

---

## 15. Квесты

### 15.1 Типы квестов (10 обычных)

| Тип | Описание | Цель | Награда |
|-----|----------|------|---------|
| invite_friends | Пригласи 3 друзей | 3 | 150 $K + 30 карма |
| claim_dividends | Собери дивиденды 5 раз | 5 | 100 $K + 20 карма |
| buy_unique_shares | Купи акции 5 друзей | 5 | 200 $K + 40 карма |
| make_trades | Соверши 10 сделок | 10 | 120 $K + 25 карма |
| boost_friends | Бустни 5 друзей | 5 | 80 $K + 15 карма |
| vote_friends | Проголосуй 10 раз | 10 | 60 $K + 10 карма |
| earn_profit | Заработай 500 $K на трейдах | 500 | 250 $K + 50 карма |
| stake_karma | Застейкай 200 $KARMA | 200 | 100 $K + 20 карма |
| login_streak | 3 дня подряд | 3 | 75 $K + 15 карма |
| boost_self | Бустни свою карточку | 1 | 100 $K + 20 карма |

### 15.2 VIP квесты (Premium, 5 штук)

| Тип | Описание | Цель | Награда (x2) |
|-----|----------|------|--------------|
| make_trades | 👑 VIP: 20 сделок | 20 | 500 $K + 80 карма |
| earn_profit | 👑 VIP: Заработай 1000 $K | 1000 | 600 $K + 100 карма |
| boost_friends | 👑 VIP: Бустни 10 друзей | 10 | 400 $K + 60 карма |
| buy_unique_shares | 👑 VIP: Купи 8 разных акций | 8 | 450 $K + 70 карма |
| stake_karma | 👑 VIP: Застейкай 500 $K | 500 | 350 $K + 50 карма |

### 15.3 Генерация квестов

```typescript
function generateDailyQuests(isPremium: boolean = false): Quest[] {
  const shuffled = [...ALL_QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
  let templates = shuffled.slice(0, isPremium ? 3 : 5);
  
  if (isPremium) {
    const vipShuffled = [...VIP_QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
    templates = [...templates, ...vipShuffled.slice(0, 2)];
  }
  
  return templates.map((t, i) => ({
    id: `quest_${Date.now()}_${i}`,
    title: t.title,
    description: t.description,
    icon: t.icon,
    type: t.type,
    target: t.target,
    reward: t.reward,
    karmaReward: t.karmaReward,
    progress: 0,
    completed: false,
    claimed: false,
    isVip: t.icon.includes('👑'),
  }));
}
```

### 15.4 Обновление прогресса

```typescript
updateQuestProgress: (type: QuestType, delta?: number) => {
  const now = Date.now();
  const newQuests = state.dailyQuests.map(q => {
    if (q.type === type && !q.completed && !q.claimed) {
      const newProgress = q.progress + (delta || 1);
      return {
        ...q,
        progress: Math.min(newProgress, q.target),
        completed: newProgress >= q.target,
      };
    }
    return q;
  });
  
  // Проверка: все квесты выполнены?
  const allCompleted = newQuests.every(q => q.completed && q.claimed);
  if (allCompleted && now - state.user.lastQuestReset > 86400000) {
    // Сброс квестов через 24 часа
  }
  
  set({ dailyQuests: newQuests });
}
```

---

## 16. Пулы

### 16.1 Ранги в пуле

| Ранг | Иконка | Цвет | Бонус див. | Бонус карма/день |
|------|--------|------|------------|------------------|
| Leader | 👑 | #FFD700 | +25% | +50 |
| Admin | ⭐ | #FF9500 | +20% | +30 |
| Officer | 🎖️ | #00BFFF | +15% | +20 |
| Member | 👤 | #00FF7F | +10% | +10 |
| Recruit | 🆕 | #9CA3AF | +5% | +5 |

### 16.2 Создание и вступление

```typescript
createPool: (name: string) => {
  // Только Premium может создавать пулы
  if (!isPremium) return 'Только Premium может создавать пулы';
  
  const pool: Pool = {
    id: `pool_${Date.now()}`,
    name,
    leaderId: state.user.id,
    members: [{
      userId: state.user.id,
      role: 'leader',
      joinedAt: Date.now(),
      weeklyStats: { trades: 0, boosts: 0, votes: 0, dividends: 0 },
      contributionScore: 0,
    }],
    dividendBonus: 0.2,
    maxMembers: 20,
    stats: {
      totalTrades: 0,
      totalBoosts: 0,
      totalDividends: 0,
      weeklyGrowth: 0,
      activeMembers: 1,
      averageScore: 0,
    },
  };
  
  set({ pools: [...state.pools, pool] });
  updateUser({ poolId: pool.id });
}

joinPool: (poolId: string) => {
  const pool = state.pools.find(p => p.id === poolId);
  if (!pool || pool.members.length >= pool.maxMembers) return 'Пул полон';
  
  const member: PoolMember = {
    userId: state.user.id,
    role: 'recruit',
    joinedAt: Date.now(),
    weeklyStats: { trades: 0, boosts: 0, votes: 0, dividends: 0 },
    contributionScore: 0,
  };
  
  set({
    pools: state.pools.map(p => 
      p.id === poolId ? { ...p, members: [...p.members, member] } : p
    ),
  });
  updateUser({ poolId: poolId });
}
```

### 16.3 Активность в пуле

```typescript
trackPoolActivity: (action: PoolActivity['action'], amount?: number) => {
  const pool = state.pools.find(p => p.id === state.user.poolId);
  if (!pool) return;
  
  const member = pool.members.find(m => m.userId === state.user.id);
  if (!member) return;
  
  // Обновление статистики участника
  switch (action) {
    case 'trade':
      member.weeklyStats.trades += amount || 1;
      member.contributionScore += 10;
      break;
    case 'boost':
      member.weeklyStats.boosts += amount || 1;
      member.contributionScore += 5;
      break;
    case 'vote':
      member.weeklyStats.votes += amount || 1;
      member.contributionScore += 2;
      break;
  }
  
  // Добавление активности в ленту
  const activity: PoolActivity = {
    userId: state.user.id,
    action,
    amount,
    timestamp: Date.now(),
    description: `${state.user.username} выполнил ${action}`,
  };
  
  set({
    pools: state.pools.map(p =>
      p.id === pool.id
        ? { ...p, activities: [activity, ...p.activities.slice(0, 49)] }
        : p
    ),
  });
}
```

---

## 17. AI-советник

### 17.1 Функции

1. **Аналитика портфеля** — PNL, концентрация, ликвидность
2. **Генерация инсайтов** — прибыль, убыток, риски, возможности
3. **Умные ответы** — на вопросы пользователя

### 17.2 Типы инсайтов

| Тип | Иконка | Приоритет | Описание |
|-----|--------|-----------|----------|
| profit | 📈 | high/medium | Позиции с прибылью >20% |
| loss | 📉 | high/medium | Позиции с убытком <-15% |
| opportunity | 💎 | medium | Недооценённые акции |
| risk | ⚠️ | high | Высокая концентрация, мало позиций |
| staking | 🏦 | low | Увеличьте стейкинг |
| social | 👥 | medium | Вступите в пул, пригласите друзей |

### 17.3 Генерация ответов

```typescript
generateSmartResponse: (question: string): string => {
  const q = question.toLowerCase();
  
  if (q.includes('купить') || q.includes('buy')) {
    // Рекомендации по покупке
    const notOwned = shares
      .filter(s => !holdings.some(h => h.shareId === s.id))
      .map(s => ({
        ...s,
        score: s.karma * 0.4 + s.hypeModifier * 10 + priceChange * 0.3,
      }))
      .sort((a, b) => b.score - a.score);
    
    return `📊 РЕКОМЕНДАЦИИ К ПОКУПКЕ\n\n` +
      notOwned.slice(0, 3).map((s, i) => 
        `${i + 1}. @${s.username} — ${s.currentPrice.toFixed(0)} $K`
      ).join('\n');
  }
  
  if (q.includes('портфел') || q.includes('portfolio')) {
    // Полный анализ портфеля
    return `💼 Стоимость: ${analytics.totalValue.toFixed(0)} $K\n` +
      `📈 PNL: ${analytics.totalPnl.toFixed(0)} $K (${analytics.totalRoi.toFixed(1)}%)\n` +
      `📊 Позиций: ${holdings.length}\n`;
  }
  
  // ... другие типы вопросов
}
```

### 17.4 Быстрые вопросы

```typescript
const quickQuestions = [
  { label: '📊 Что купить?', query: 'что купить' },
  { label: '📉 Что продать?', query: 'что продать' },
  { label: '💼 Портфель', query: 'анализ портфеля' },
  { label: '🔒 Стейкинг', query: 'стейкинг' },
  { label: '⚠️ Риски', query: 'анализ рисков' },
  { label: '💰 Дивиденды', query: 'дивиденды' },
  { label: '📈 Тренды', query: 'обзор рынка' },
  { label: '🎯 Стратегия', query: 'стратегия' },
  { label: '🔮 Прогноз', query: 'прогноз' },
  { label: '🚨 Алерты', query: 'алерты' },
  { label: '🤝 Рефералы', query: 'рефералы' },
  { label: '👑 Premium', query: 'премиум' },
];
```

---

## 18. Telegram Web App

### 18.1 Инициализация

```typescript
// App.tsx
useEffect(() => {
  try {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.setHeaderColor(mode === 'dark' ? '#0d0d1a' : '#FFFFFF');
      tg.setBackgroundColor(mode === 'dark' ? '#121212' : '#F5F5F7');
    }
  } catch (error) {
    console.error('[Telegram WebApp] init error:', error);
  }
}, [mode]);
```

### 18.2 Интеграция

| Метод | Описание |
|-------|----------|
| `tg.ready()` | Сообщение о готовности |
| `tg.expand()` | Развернуть на весь экран |
| `tg.setHeaderColor()` | Цвет хедера |
| `tg.setBackgroundColor()` | Цвет фона |

### 18.3 Скрипт Telegram

```html
<!-- index.html -->
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```

---

## 19. Сборка и развёртывание

### 19.1 Команды npm

```bash
# Установка зависимостей
npm install

# Dev сервер (порт 5173)
npm run dev

# Production сборка
npm run build

# Preview сборки
npm run preview
```

### 19.2 Vite конфигурация

```typescript
// vite.config.ts
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

### 19.3 TypeScript конфигурация

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src", "vite.config.ts"]
}
```

### 19.4 Структура сборки

```
dist/
└── index.html          # Единый файл со всем кодом и стилями
```

---

## 20. Тестирование

### 20.1 DevTools (/test-dev)

**URL:** `http://localhost:5173/test-dev`

#### Вкладки:

| Вкладка | Функции |
|---------|---------|
| Дивиденды | Таймер, форс-расчёт, сбор |
| Пользователь | Баланс, Premium, уровень |
| Портфель | Состаривание акций, экспорт |
| Квесты | Выполнить все, сброс |
| Лог | Экспорт, очистка |
| Настройки | Переключение сервиса |

#### Пресеты:

| Пресет | Действие |
|--------|----------|
| Быстрый тест | Дивиденды каждые 10 сек |
| Premium | Активация Premium + дивиденды |
| Богач | 100к $KARMA, 20 уровень |

### 20.2 Тестовый режим

```javascript
// Включение через консоль
window.KM_TEST_MODE = true;
location.reload();

// Влияет на:
// - Интервал дивидендов: 10 сек вместо 2-4 часов
// - Проверка 24 часов: пропускается
```

### 20.3 Ручное тестирование

1. **Торговля** — покупка/продажа акций
2. **Дивиденды** — ожидание начисления, сбор
3. **Стейкинг** — внесение, ожидание, вывод
4. **Квесты** — выполнение, клейм наград
5. **Premium** — покупка, проверка перков

---

## 21. Производительность

### 21.1 Оптимизации

| Область | Метод |
|---------|-------|
| Рендеринг | React.memo, useMemo, useCallback |
| Состояние | Zustand (минимальные ре-рендеры) |
| Графики | Canvas API (вместо SVG) |
| Анимации | Framer Motion (GPU-ускорение) |
| Стили | Tailwind CSS (минимальный CSS) |

### 21.2 Метрики

| Метрика | Значение |
|---------|----------|
| Размер сборки | ~500 KB (gzip) |
| Время загрузки | < 2 сек (3G) |
| FPS анимаций | 60 FPS |
| Auto-save интервал | 30 сек |

### 21.3 Lazy loading

```typescript
// Экраны загружаются по требованию
const renderScreen = () => {
  switch (screen) {
    case 'market': return <MarketScreen />;
    case 'portfolio': return <PortfolioScreen />;
    // ...
  }
};
```

---

## 22. Безопасность

### 22.1 Текущие меры

| Мера | Описание |
|------|----------|
| LocalStorage | Данные только на устройстве пользователя |
| Валидация | Проверка входных данных в методах |
| Ограничения | Лимиты на трейды, бусты, голоса |

### 22.2 Будущие меры (для API)

| Мера | Описание |
|------|----------|
| JWT токены | Аутентификация |
| Rate limiting | Ограничение запросов |
| Шифрование | HTTPS, шифрование данных |
| Валидация на сервере | Двойная проверка |

### 22.3 Уязвимости

| Риск | Статус |
|------|--------|
| XSS | Минимальный (нет user-generated content) |
| CSRF | Низкий (LocalStorage) |
| Data tampering | Средний (клиентское хранение) |

---

## 23. Мониторинг и логи

### 23.1 Логирование

```typescript
// Консольные логи
console.log('[gameStore] Method called:', methodName);
console.error('[LocalStorageService] Error:', error);
console.warn('[ApiService] API unavailable, using fallback');
```

### 23.2 DevTools логирование

```typescript
interface LogEntry {
  id: string;
  timestamp: Date;
  action: string;
  details: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

// Экспорт логов
const handleExportLogs = () => {
  const data = JSON.stringify(logs.map(l => ({
    ...l,
    timestamp: l.timestamp.toISOString(),
  })), null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  // ...
};
```

### 23.3 Уведомления

```typescript
addNotification: (msg: string, type: 'info' | 'success' | 'warning') => {
  const notification: Notification = {
    id: `notif_${Date.now()}`,
    message: msg,
    type,
    timestamp: Date.now(),
    read: false,
  };
  set({ notifications: [notification, ...state.notifications.slice(0, 9)] });
}
```

---

## 24. План развития

### 24.1 Фаза 1 (MVP) ✅

- [x] Торговая система
- [x] Дивиденды
- [x] Стейкинг
- [x] Квесты
- [x] Рефералы (1 уровень)
- [x] Premium подписка
- [x] Telegram Web App интеграция

### 24.2 Фаза 2 (в разработке)

- [ ] Рефералы (2 уровень)
- [ ] Пулы (совместные квесты)
- [ ] Limit ордера (Premium)
- [ ] PDF-отчёты (Premium)
- [ ] Алерты цен

### 24.3 Фаза 3 (планирование)

- [ ] Backend API (PostgreSQL)
- [ ] Синхронизация между устройствами
- [ ] PVP режим
- [ ] Сезонные ивенты
- [ ] NFT аватары (Premium)

### 24.4 Будущие улучшения

| Функция | Приоритет | Сложность |
|---------|-----------|-----------|
| Backend API | Высокий | Высокая |
| PVP режим | Средний | Средняя |
| NFT аватары | Низкий | Средняя |
| Мобильное приложение | Низкий | Высокая |

---

## 📎 Приложения

### A. Глоссарий

| Термин | Определение |
|--------|-------------|
| $KARMA | Внутренняя валюта приложения |
| Акции | Виртуальные активы пользователей |
| Дивиденды | Пассивный доход от роста акций |
| Стейкинг | Блокировка токенов под процент |
| Пул | Команда пользователей |
| Premium | Платная подписка с перками |

### B. Часто задаваемые вопросы

**Q: Как купить Premium?**  
A: Откройте профиль, нажмите «Подписаться», подтвердите транзакцию 500 $KARMA.

**Q: Когда начисляются дивиденды?**  
A: Каждые 2 часа (Premium) или 4 часа (Free), если акции куплены 24+ часа назад.

**Q: Можно ли вывести $KARMA?**  
A: Нет, $KARMA — внутренняя валюта без реальной стоимости.

**Q: Как пригласить друга?**  
A: Откройте вкладку «Рефералы», скопируйте ссылку, отправьте другу.

---

**Документ создан:** 6 марта 2026  
**Автор:** KarmaMarket Development Team  
**Контакты:** support@karmamarket.io

---

*Этот документ является полной технической документацией проекта KarmaMarket и должен использоваться для понимания архитектуры, бизнес-логики и процессов разработки.*
