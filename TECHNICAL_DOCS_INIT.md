# KarmaMarket — Техническая документация (init)

**Дата:** 11 марта 2026  
**Версия:** 0.1 (инициализация)  
**Статус:** Frontend MVP, Telegram Web App  

Документ создан после первичного обзора кода, чтобы зафиксировать актуальную архитектуру, ключевые механики и точки расширения. Описывает только то, что есть в репозитории `D:\Proj\Codex\karma`.

---

## 1) Область и границы

- В репозитории находится **только фронтенд** (React + Vite).
- Бэкенд не реализован: `ApiService` — заглушка, фактически работает `LocalStorageService`.
- Источник данных — `localStorage` с префиксом `km_`.

---

## 2) Быстрый старт

```bash
npm install
npm run dev
npm run build
npm run preview
```

Vite-конфигурация: `vite.config.ts`, плагин `vite-plugin-singlefile` собирает приложение в один HTML (под Telegram Web App).

---

## 3) Архитектура приложения

### 3.1 Входная точка

- `src/main.tsx` → рендер `App` в `#root`.
- `index.html` подключает `telegram-web-app.js` и включает `viewport-fit=cover`.

### 3.2 Главный компонент

`src/App.tsx`:

- Инициализирует состояние (`initStore`).
- Инициализирует Telegram Web App API (`ready`, `expand`, `setHeaderColor`).
- Роутинг по состоянию `screen` и отдельный путь `/test-dev`.
- Рендерит `GameLoop`, основной экран, навигацию и модалки.

### 3.3 Фоновые процессы

`src/components/GameLoop.tsx`:

- Проверка Premium — раз в 60 сек.
- Обновление цен — раз в 10 сек.
- Расчёт дивидендов — раз в 5 сек.
- Случайные события — раз в 30 мин.
- Auto-save — раз в 30 сек.

---

## 4) Состояние и срезы (Zustand)

Единый `GameState` собирается из срезов в `src/store/slices`:

- `userSlice` — пользователь, premium, онбординг.
- `tradeSlice` — акции, ордера, трейды, цены.
- `economySlice` — дивиденды, стейкинг, рефералы.
- `poolSlice` — пулы, бусты, активности.
- `questSlice` — ежедневные квесты.
- `notificationSlice` — уведомления.
- `persist/initStore` — сохранение и загрузка состояния.

Файл: `src/store/gameStore.ts`.

---

## 5) Слой данных

### 5.1 Интерфейс

`src/services/dataService.ts` описывает `IDataService` и структуру `IPersistData`.

### 5.2 Реализации

- `LocalStorageService` — текущая реализация.
- `ApiService` — заглушка с fallback на `LocalStorageService`.
- `DataServiceFactory` — выбирает сервис по ключу `km_data_service_type`.

### 5.3 Ключи localStorage

Используются ключи (префикс `km_`):

`user`, `shares`, `holdings`, `trades`, `pools`, `unclaimed_div`, `div_records`,  
`last_div_calc`, `next_dividend_time`, `boost_cd`, `referral_earn`,  
`referral_records`, `event`, `daily_quests`, `data_service_type`, `theme`.

---

## 6) Бизнес‑логика (ядро)

### 6.1 Ценообразование акций

`tradeSlice.ts`:

```
price = basePrice + (karma * 0.1) + (volume24h * 0.05) + hypeModifier
```

Обновление цен каждые 10 секунд + генерация свечей раз в 30 минут.

### 6.2 Торговля

- Комиссия: **0.5%**.
- Ребейт: **0.1% / 0.3% / 0.5%** по дневному объёму.
- Limit‑ордера доступны только Premium.
- Лимит для Free: **50 трейдов/день**.
- Минимальное удержание при продаже: **1 минута**.

### 6.3 Дивиденды

`economySlice.ts`:

- Интервал: **2 часа** (Premium) / **4 часа** (Free).
- Только если акция куплена **24+ часа назад**.
- Формула:

```
div = amount * priceGrowth * 0.025 * currentPrice * multipliers
```

Множители: пул (1.2), уровень ≥10 (1.05), self‑boost, premium (1.25).

### 6.4 Стейкинг

- База APY: **0.5%/день** (Free), **0.8%/день** (Premium).
- Пороговые надбавки от суммы стейка.
- Unstake до 7 дней: **штраф 1%**.

### 6.5 Квесты

- Генерация из `ALL_QUEST_TEMPLATES` + `VIP_QUEST_TEMPLATES`.
- Premium получает **x2** награды.
- Прогресс по `buy_unique_shares`, `stake_karma`, `login_streak` считается по состоянию пользователя.

### 6.6 Пулы

- Создание пула доступно только Premium.
- Бусты на пул: кулдаун **1 час**.
- Активности пула пишутся в историю и статистику.

### 6.7 Premium

- Цена: **500 $KARMA**, длительность **30 дней**.
- При продлении — добавляется +30 дней.
- Влияет на дивиденды, лимитные ордера и множители квестов.

---

## 7) UI‑состав

### 7.1 Экраны

- `MarketScreen` — рынок и акции.
- `PortfolioScreen` — портфель и отчёты.
- `RewardsScreen` — квесты, дивиденды, стейкинг.
- `FriendsScreen` — социальные механики и пулы.
- `ProfileScreen` — профиль и настройки.
- `AdvisorScreen` — AI‑советник (Premium).
- `DevToolsScreen` — dev‑режим (`/test-dev`).

### 7.2 Компоненты

`BottomNav`, `TradeModal`, `PremiumModal`, `OnboardingModal`, `NotificationToast`, `MiniChart`, `GameLoop`.

---

## 8) Моки и сид‑данные

`src/data/seed.ts` генерирует:

- фиктивные акции,
- историю цен за 24 часа,
- order book,
- мок‑рефералов.

---

## 9) Ограничения текущей версии

- Нет реального backend/API.
- Все данные локальные (localStorage).
- Нет синхронизации между устройствами.
- Telegram Web App используется без верификации пользователя/подписи.

---

## 10) Файлы-ориентиры

- `src/App.tsx` — основной UI/роутинг/инициализация.
- `src/components/GameLoop.tsx` — интервальные процессы.
- `src/store/*` — состояние и бизнес‑логика.
- `src/services/*` — слой хранения.
- `src/data/seed.ts` — мок‑данные.
- `src/types.ts` — типы домена.
- `vite.config.ts` — сборка.
