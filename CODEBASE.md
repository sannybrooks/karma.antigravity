# KarmaMarket — Полная документация кодовой базы

> **Назначение:** Справочник разработчика для быстрого понимания архитектуры и внесения изменений

---

## 📁 Структура проекта

```
src/
├── App.tsx                    # Главный компонент (роутинг, глобальные эффекты)
├── main.tsx                   # Точка входа React
├── types.ts                   # Все TypeScript типы и интерфейсы
├── index.css                  # Глобальные стили и анимации
│
├── components/                # UI-компоненты
│   ├── screens/               # Экраны приложения
│   │   ├── MarketScreen.tsx   # Маркет (список акций)
│   │   ├── PortfolioScreen.tsx # Портфель пользователя
│   │   ├── RewardsScreen.tsx  # Награды (квесты, дивиденды, стейкинг)
│   │   ├── FriendsScreen.tsx  # Друзья, пулы, рефералы
│   │   ├── ProfileScreen.tsx  # Профиль и настройки
│   │   ├── AdvisorScreen.tsx  # AI-советник (Premium)
│   │   └── DevToolsScreen.tsx # Инструменты разработчика
│   │
│   ├── BottomNav.tsx          # Нижняя навигационная панель
│   ├── MiniChart.tsx          # Компоненты графиков (MiniChart, FullChart)
│   ├── TradeModal.tsx         # Модалка торговли (Buy/Sell, графики, RSI)
│   ├── OnboardingModal.tsx    # Онбординг (tutorial + бонус)
│   ├── PremiumModal.tsx       # Модалка покупки Premium
│   └── NotificationToast.tsx  # Всплывающие уведомления
│
├── store/                     # Zustand сторы (глобальное состояние)
│   ├── gameStore.ts           # Игровая логика (~1800 строк)
│   └── themeStore.ts          # Тема (светлая/тёмная)
│
├── data/                      # Данные и генераторы
│   └── seed.ts                # Генерация акций, order book, рефералов
│
├── services/                  # Сервисный слой (работа с данными)
│   ├── dataService.ts         # Интерфейс IDataService
│   ├── dataServiceFactory.ts  # Фабрика сервисов
│   ├── localStorageService.ts # Реализация localStorage
│   └── apiService.ts          # Заглушка для будущего API
│
└── utils/                     # Утилиты
    └── cn.ts                  # Утилита для классов (clsx + tailwind-merge)
```

---

## 🏗 Архитектура

### Технологический стек

| Компонент | Технология | Файл конфигурации |
|-----------|------------|-------------------|
| Фреймворк | React 19.2.3 | `package.json` |
| Язык | TypeScript 5.9.3 | `tsconfig.json` |
| Сборка | Vite 7.2.4 | `vite.config.ts` |
| Стили | Tailwind CSS 4.1.17 | `index.css` |
| State | Zustand 5.0.11 | `store/*.ts` |
| Анимации | Framer Motion | компоненты |
| Графики | Chart.js + react-chartjs-2 | `RewardsScreen.tsx` |
| Иконки | Lucide React | все компоненты |

### Path alias

```typescript
// tsconfig.json + vite.config.ts
"@/*" → "src/*"
// Пример: import { useGameStore } from '@/store/gameStore'
```

---

## 📦 Глобальное состояние (Zustand)

### gameStore.ts (`src/store/gameStore.ts`)

**Размер:** ~1800 строк  
**Назначение:** Вся игровая логика, состояние пользователя, торговая система

#### Основные секции:

##### 1. Константы и конфигурация

```typescript
// Уровни пользователя (20 уровней)
export const LEVEL_SYSTEM = [
  { level: 1, name: 'Новичок', icon: '🌱', karmaRequired: 0, ... },
  { level: 20, name: 'Бог Кармы', icon: '🌌', karmaRequired: 50000, ... },
];

// Уровни реферальной программы (5 уровней)
export const REFERRAL_TIERS = [
  { level: 1, name: 'Новичок', bonusPercent: 5 },
  { level: 5, name: 'Легенда', bonusPercent: 20 },
];

// Шаблоны квестов (10 обычных + 5 VIP)
const ALL_QUEST_TEMPLATES = [...];
const VIP_QUEST_TEMPLATES = [...];
```

##### 2. Функции-утилиты

```typescript
function calcSharePrice(share: Share): number
// Формула: basePrice + (karma * 0.1) + (volume24h * 0.05) + hypeModifier

function getUserLevel(karma: number)
// Возвращает текущий уровень, прогресс и следующий уровень

function generateDailyQuests(isPremium: boolean): Quest[]
// Генерирует 5 случайных квестов (3 обычных + 2 VIP для Premium)
```

##### 3. Интерфейс GameState

```typescript
interface GameState {
  // Навигация
  screen: Screen;
  setScreen: (s: Screen) => void;

  // Пользователь
  user: User;
  updateUser: (partial: Partial<User>) => void;

  // Акции
  shares: Share[];
  updateSharePrices: () => void;

  // Портфель
  holdings: Holding[];

  // Торги
  trades: Trade[];
  orders: Order[];
  executeTrade: (...) => string | null;
  cancelOrder: (orderId: string) => void;

  // Дивиденды
  unclaimedDividends: number;
  dividendRecords: DividendRecord[];
  calculateDividends: () => void;
  claimDividends: () => void;

  // Стейкинг
  stake: (amount: number) => void;
  unstake: () => void;
  getStakingReward: () => number;
  claimStakingReward: () => void;

  // Социалка
  boostFriend: (shareId: string) => string | null;
  voteFriend: (shareId: string) => string | null;
  boostSelf: () => string | null;

  // Пулы
  pools: Pool[];
  createPool: (name: string) => void;
  joinPool: (poolId: string) => void;
  leavePool: () => void;

  // Рефералы
  referralRecords: ReferralRecord[];
  claimReferralEarnings: () => void;

  // Квесты
  dailyQuests: Quest[];
  updateQuestProgress: (type: QuestType, delta?: number) => void;
  claimQuestReward: (questId: string) => void;

  // Premium
  subscribePremium: () => string | null;
  checkPremiumExpiry: () => void;

  // Persist
  persist: () => void;
}
```

##### 4. Ключевые методы (детали реализации)

**executeTrade** — покупка/продажа акций:
- Проверка баланса/количества акций
- Расчёт комиссии (0.5%) и рибэта (0.1-0.5%)
- Реферальные отчисления (5% для пригласившего)
- Обновление портфеля и истории трейдов
- Обновление прогресса квестов

**calculateDividends** — расчёт дивидендов:
- Интервал: 4 часа (Free), 2 часа (Premium), 10 сек (TEST_MODE)
- Условие: акция куплена 24+ часа назад
- Формула: `amount × priceGrowth × 0.025 × бонусы`
- Бонусы: пул (+20%), уровень 10+ (+5%), буст (+5%/ур), Premium (+25%)
- Стейкинг: ежедневное начисление по APY

**getStakingAPY** — расчёт APY стейкинга:
- Базовый: 0.5%/день (Free), 0.8%/день (Premium)
- Бонусы за сумму: Bronze (+0.1%), Silver (+0.2%), Gold (+0.3%), Platinum (+0.4%), Diamond (+0.5-0.75%)

**updateQuestProgress** — отслеживание прогресса:
- Автоматическое обновление при действиях (трейды, бусты, голосования)
- Проверка на завершение квеста

#### Персистентность

```typescript
// Загрузка при инициализации
const initialUser = loadJSON<User>('user', fallbackUser);
const initialShares = loadJSON<Share[]>('shares', generateShares());

// Сохранение (auto-save каждые 30 сек)
async function persist() {
  await dataService.saveAll({ user, shares, holdings, trades, ... });
}
```

#### Тестовые режимы

```typescript
// Включить в консоли DevTools или через window.KM_TEST_MODE
const TEST_MODE = typeof window !== 'undefined' && (window as any).KM_TEST_MODE === true;

// Влияет на:
// - Интервал дивидендов (10 сек вместо 2-4 часов)
// - Проверку 24 часов для дивидендов (пропускается)
```

---

### themeStore.ts (`src/store/themeStore.ts`)

**Размер:** ~70 строк  
**Назначение:** Управление темой оформления

```typescript
interface ThemeState {
  mode: 'dark' | 'light';
  theme: Theme; // Объект с цветами
  toggle: () => void;
  setMode: (m: ThemeMode) => void;
}

// Цветовые схемы
const DARK: Theme = {
  bg: '#121212',
  bgSecondary: '#0d0d1a',
  bgCard: 'rgba(255,255,255,0.03)',
  bgCardBorder: 'rgba(255,255,255,0.06)',
  textPrimary: '#ffffff',
  accent: '#00FF7F',
  accentGold: '#FFD700',
  // ...
};
```

---

## 🎨 Компоненты

### App.tsx

**Размер:** ~200 строк  
**Назначение:** Главный компонент, роутинг, глобальные эффекты

#### Ключевые useEffect:

1. **Telegram Web App API** — инициализация при загрузке
2. **Проверка Premium** — проверка истечения подписки
3. **Ежедневный логин** — бонус за вход + сброс квестов
4. **Обновление цен** — каждые 10 секунд
5. **Расчёт дивидендов** — каждые 5 секунд
6. **Рандомные события** — каждые 30 минут
7. **Auto-save** — каждые 30 секунд

#### Рендеринг экранов:

```typescript
const renderScreen = () => {
  if (window.location.pathname === '/test-dev') {
    return <DevToolsScreen />;
  }
  switch (screen) {
    case 'market': return <MarketScreen />;
    case 'portfolio': return <PortfolioScreen />;
    case 'rewards': return <RewardsScreen />;
    case 'friends': return <FriendsScreen />;
    case 'profile': return <ProfileScreen />;
    case 'advisor': return <AdvisorScreen />;
    default: return <MarketScreen />;
  }
};
```

---

### MarketScreen.tsx

**Размер:** ~350 строк  
**Назначение:** Список акций, фильтры, поиск, order book, акционеры

#### Фильтры:

```typescript
type ExtFilter = 'all' | 'hot' | 'friends' | 'undervalued' | 'vip';

// Логика фильтрации:
// - hot: рост > 10% за 24ч
// - friends: акции в портфеле
// - undervalued: karma > 200 && price < 200
// - vip: только VIP акции (Premium)
```

#### Компоненты внутри:

- `OrderBookView` — стакан цен (bids/asks)
- `ShareholdersView` — список акционеров

---

### PortfolioScreen.tsx

**Размер:** ~770 строк  
**Назначение:** Портфель, позиции, PNL, графики, отчёты

#### Ключевые компоненты:

**DailyReport** — подробный отчёт за день:
- Трейды сегодня
- PNL реализованный/нереализованный
- Лучшая/худшая позиция
- Детали торговли

**PieChartCanvas** — круговая диаграмма портфеля  
**PnlChart** — история PNL  
**ShareholderBar** — прогресс-бар акционеров

---

### RewardsScreen.tsx

**Размер:** ~730 строк  
**Назначение:** Квесты, дивиденды, стейкинг

#### Секции:

1. **Ежедневные квесты** — 5 обычных + 2 VIP (Premium)
2. **Реферальные задания** — 5 челленджей
3. **Дивиденды** — таймер, история, сбор
4. **Стейкинг** — уровни, APY, управление, история

#### Стейкинг логика:

```typescript
// Уровни стейкинга
Bronze:   ≥ 500 $K   → +0.1% APY
Silver:   ≥ 1500 $K  → +0.2% APY
Gold:     ≥ 5000 $K  → +0.3% APY
Platinum: ≥ 10000 $K → +0.4% APY
Diamond:  ≥ 50000 $K → +0.5-0.75% APY

// Кулдаун: 7 дней
// Пенальти за ранний вывод: 1%
// Auto-compound: только Premium
```

---

### FriendsScreen.tsx

**Размер:** ~1350 строк  
**Назначение:** Друзья, пулы, рефералы

#### Вкладки:

1. **Друзья** — список, бусты, голосования
2. **Пул** — статистика, участники, история
3. **Рефералы** — статистика, достижения, доходы

#### Компоненты внутри:

- `InviteStickerCanvas` — Canvas-стикер для приглашения
- `PoolStickerCanvas` — Canvas-стикер пула

---

### ProfileScreen.tsx

**Размер:** ~585 строк  
**Назначение:** Профиль, настройка карточки, буст

#### Настройки карточки:

- Цвет (8 вариантов)
- Бейдж (10 вариантов)
- Фон баннера (6 градиентов)
- Описание (до 100 символов)

#### Буст своей карточки:

```typescript
// Уровни: 1-5
// Стоимость: (level + 1) * 100 $K
// Длительность: 24 часа
// Бонусы: +3 hype/ур, +5% дивиденды/ур, +20 карма
```

---

### AdvisorScreen.tsx

**Размер:** ~750 строк  
**Назначение:** AI-советник (Premium)

#### Функции:

1. **Аналитика портфеля** — PNL, концентрация, ликвидность
2. **Генерация инсайтов** — прибыль, убыток, риски, возможности
3. **Умные ответы** — на вопросы пользователя

#### Типы вопросов:

- "что купить" → рекомендации по покупке
- "что продать" → анализ позиций
- "портфель" → полный обзор
- "стейкинг" → расчёт дохода
- "риски" → анализ рисков
- "дивиденды" → прогноз дохода
- "тренд" → обзор рынка
- "стратегия" → план действий

---

### DevToolsScreen.tsx

**Размер:** ~820 строк  
**Назначение:** Инструменты разработчика для тестирования

#### Вкладки:

1. **Дивиденды** — таймер, форс-расчёт, сбор
2. **Пользователь** — баланс, Premium, уровень
3. **Портфель** — "состаривание" акций, экспорт
4. **Квесты** — выполнить все, сброс
5. **Лог** — экспорт, очистка
6. **Настройки** — переключение сервиса данных

#### Пресеты:

- "Быстрый тест" — таймер дивидендов в прошлое
- "Premium" — активация Premium + дивиденды
- "Богач" — 100к $KARMA, 20 уровень

---

### TradeModal.tsx

**Размер:** ~600 строк  
**Назначение:** Модалка торговли

#### Компоненты:

**PriceChart** — свечной график с MA(7)  
**RSIChart** — RSI(14) индикатор (только Premium)

#### Функционал:

- Market/Limit ордера (Limit — Premium)
- Выбор периода графика (1ч, 6ч, 24ч)
- Предварительный расчёт (цена, комиссия, итог)
- Быстрые кнопки (25%, 50%, 100%, MAX)

---

### PremiumModal.tsx

**Размер:** ~400 строк  
**Назначение:** Модалка покупки Premium

#### 10 Premium перков:

1. Безлимитные трейды
2. Advanced Charts (RSI, MA, PDF)
3. VIP Маркет
4. +25% дивиденды, APY 15-20%
5. Без рекламы
6. Кастомные темы
7. Приоритет ордеров
8. VIP-квесты x2
9. Создание пулов
10. AI-советник

#### Цена: 500 $KARMA/мес

---

### BottomNav.tsx

**Размер:** ~100 строк  
**Назначение:** Нижняя навигация

#### Табы:

- Маркет (BarChart3)
- Портфель (Briefcase)
- Награды (Gift)
- AI (Bot) — только Premium
- Друзья (Users)
- Профиль (UserCircle)

---

### MiniChart.tsx

**Размер:** ~200 строк  
**Назначение:** Компоненты графиков

#### Компоненты:

**MiniChart** — sparkline (80x32px)  
**FullChart** — свечной график с осями (100% width, 120px height)

#### Отрисовка:

- Canvas API
- Свечи (бычьи/медвежьи)
- MA(7) — пунктирная линия
- Градиентная заливка

---

### NotificationToast.tsx

**Размер:** ~50 строк  
**Назначение:** Всплывающие уведомления

#### Типы:

- `success` — зелёная иконка
- `warning` — жёлтая иконка
- `info` — синяя иконка

---

### OnboardingModal.tsx

**Размер:** ~150 строк  
**Назначение:** Tutorial для новых пользователей

#### Шаги:

1. Торгуй акциями друзей
2. Бустай друзей и себя
3. Пассивные дивиденды

#### Финал:

- Подключение TON кошелька (mock)
- Стартовый бонус: 2000 $KARMA + 100 бонус

---

## 🔧 Сервисы

### dataService.ts

**Назначение:** Интерфейс для работы с данными

```typescript
interface IDataService {
  initialize(): Promise<void>;
  loadAll(): Promise<IPersistData | null>;
  saveAll(data: IPersistData): Promise<void>;

  // Отдельные методы
  getUser(): Promise<User | null>;
  saveUser(user: User): Promise<void>;
  getShares(): Promise<Share[] | null>;
  saveShares(shares: Share[]): Promise<void>;
  // ...
}
```

---

### dataServiceFactory.ts

**Назначение:** Фабрика для создания сервисов

```typescript
DataServiceFactory.getService();  // LocalStorageService или ApiService
DataServiceFactory.switchService('api');  // Переключение с перезагрузкой
```

---

### localStorageService.ts

**Размер:** ~350 строк  
**Назначение:** Реализация IDataService через localStorage

#### Ключи localStorage:

```
km_user           // Данные пользователя
km_shares         // Акции
km_holdings       // Портфель
km_trades         // История трейдов
km_pools          // Пулы
km_unclaimed_div  // Несобранные дивиденды
km_div_records    // История дивидендов
km_last_div_calc  // Время последнего расчёта
km_next_dividend_time // Время следующего начисления
km_boost_cd       // Кулдауны бустов
km_referral_earn  // Реферальные доходы
km_referral_records // Рефералы
km_event          // Активное событие
km_daily_quests   // Квесты
km_theme          // Тема
km_data_service_type // Тип сервиса
```

---

### apiService.ts

**Назначение:** Заглушка для будущего API

```typescript
// Сейчас использует LocalStorageService как fallback
// В будущем: REST API к PostgreSQL
```

---

## 📊 Типы данных

### User

```typescript
interface User {
  id: string;
  username: string;
  karma: number;
  level: number;
  balance: number;
  premium: boolean;
  premiumExpiresAt: number;
  referralCode: string;
  referredBy: string | null;
  staked: number;
  stakedAt: number | null;
  autoCompound: boolean;
  poolId: string | null;
  dailyQuests: Quest[];
  // ... 50+ полей
}
```

### Share

```typescript
interface Share {
  id: string;
  ownerId: string;
  ticker: string;
  username: string;
  karma: number;
  basePrice: number;
  currentPrice: number;
  price24hAgo: number;
  volume24h: number;
  hypeModifier: number;
  priceHistory: PricePoint[];
  shareholders: Shareholder[];
}
```

### Quest

```typescript
interface Quest {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: QuestType;
  target: number;
  reward: number;
  karmaReward: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  isVip?: boolean;
}
```

---

## 🎯 Ключевые формулы

### Цена акции

```typescript
price = basePrice + (karma * 0.1) + (volume24h * 0.05) + hypeModifier
// Минимум: 10 $K
```

### Дивиденды

```typescript
div = amount * priceGrowth * 0.025 * squadBonus * levelBonus * selfBoostBonus * premiumDivBonus
// priceGrowth = (currentPrice - price24hAgo) / price24hAgo
// squadBonus = 1.2 (если в пуле)
// levelBonus = 1.05 (если уровень >= 10)
// selfBoostBonus = 1 + selfBoostLevel * 0.05
// premiumDivBonus = 1.25 (если Premium)
```

### Стейкинг APY (в день)

```typescript
baseAPY = isPremium ? 0.008 : 0.005
// + бонусы за сумму (Bronze +0.001 ... Diamond +0.0075)

reward = staked * dailyAPY * daysSinceClaim
```

### Реферальные отчисления

```typescript
// 1 уровень: 5-20% от комиссии (зависит от уровня)
// 2 уровень: 2% фиксировано

bonus = totalCost * bonusPercent / 100
```

---

## 🧪 Тестирование

### DevTools (/test-dev)

1. Открыть `http://localhost:5173/test-dev`
2. Использовать пресеты:
   - "Быстрый тест" — дивиденды каждые 10 сек
   - "Premium" — активировать Premium
   - "Богач" — 100к $KARMA

### Ручное включение TEST_MODE

```javascript
// В консоли браузера:
window.KM_TEST_MODE = true;
location.reload();
```

---

## 📝 Стили и анимации

### Глобальные анимации (`index.css`)

```css
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
@keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }
@keyframes flashGreen { 50% { color: #00FF7F; text-shadow: 0 0 8px #00FF7F; } }
@keyframes flashRed { 50% { color: #FF4444; text-shadow: 0 0 8px #FF4444; } }
@keyframes pulse-glow { 50% { box-shadow: 0 0 20px 4px #00FF7F25; } }
@keyframes goldGlow { 50% { box-shadow: 0 0 20px #FFD70040; } }
@keyframes shimmer { 100% { background-position: 200% 0; } }
```

### Утилиты

```css
.animate-slideUp, .animate-slideDown, .animate-flashGreen, .animate-flashRed
.animate-pulseGlow, .animate-fadeIn, .animate-goldGlow
.scrollbar-hide
.premium-shimmer, .premium-card-border
```

---

## 🔐 Premium функции

| Функция | Free | Premium |
|---------|------|---------|
| Трейды/день | 50 | ♾️ |
| Дивиденды интервал | 4 часа | 2 часа |
| Дивиденды бонус | 0% | +25% |
| Стейкинг APY | 0.5%/день | 0.8%/день |
| Limit ордера | ❌ | ✅ |
| RSI/MA графики | ❌ | ✅ |
| VIP маркет | ❌ | ✅ |
| AI-советник | ❌ | ✅ |
| Создание пулов | ❌ | ✅ |
| Квесты награда | 100% | 200% (x2) |
| Auto-compound | ❌ | ✅ |

---

## 🚀 Сборка и запуск

```bash
# Установка зависимостей
npm install

# Dev сервер
npm run dev

# Production сборка
npm run build

# Preview сборки
npm run preview
```

### Vite конфигурация

```typescript
// vite.config.ts
plugins: [react(), tailwindcss(), viteSingleFile()]
resolve: { alias: { '@': path.resolve(__dirname, 'src') } }
```

### Плагин singlefile

Собирает всё в один HTML-файл для Telegram Web App.

---

## 📋 Чек-лист для добавления новой функции

1. **Типы** — добавить в `types.ts`
2. **Стор** — методы в `gameStore.ts`
3. **Компонент** — создать в `components/`
4. **Экран** — добавить в `App.tsx` роутинг
5. **Навигация** — обновить `BottomNav.tsx`
6. **Стили** — проверить тему в `themeStore.ts`
7. **Тесты** — проверить в DevTools

---

## 🐛 Известные ограничения

1. **Рефералы** — мок-данные, нет загрузки по userId
2. **Пулы** — частичная реализация, нет совместных квестов
3. **API** — заглушка, нет реального бэкенда
4. **Limit ордера** — исполняются при обновлении цен (10 сек)
5. **2-й уровень рефералов** — упрощённая логика

---

## 📞 Контакты разработчика

- **Проект:** KarmaMarket — Биржа кармы в Telegram
- **Платформа:** Telegram Web App
- **Версия:** MVP

---

*Документ создан для упрощения разработки и поддержки проекта KarmaMarket.*
