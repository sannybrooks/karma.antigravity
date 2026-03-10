# KarmaMarket — Проектная документация

> **Версия:** 1.0 | **Обновлено:** 6 марта 2026 | **Статус:** Production MVP

---

## 📖 Быстрый старт

```bash
# Установка
npm install

# Запуск dev-сервера
npm run dev

# Production сборка
npm run build
```

**DevTools:** `http://localhost:5173/test-dev`

---

## 🎯 О проекте

**KarmaMarket** — Telegram Web App, симулятор биржи кармы:

- 📈 Покупка/продажа «акций» пользователей
- 💰 Пассивный доход от дивидендов (каждые 2-4 часа)
- 🔒 Стейкинг под 0.5-0.8%/день
- 👥 Реферальная программа (2 уровня, 5-20%)
- 📋 Ежедневные квесты (10 типов + VIP)
- ⚔️ Пулы (команды с бонусами)
- 👑 Premium подписка (500 $KARMA/мес, 10 перков)

---

## 🏗 Технологический стек

| Компонент | Технология |
|-----------|------------|
| Фреймворк | React 19.2.3 + TypeScript 5.9.3 |
| Сборка | Vite 7.2.4 |
| Стили | Tailwind CSS 4.1.17 |
| State | Zustand 5.0.11 |
| Анимации | Framer Motion |
| Графики | Chart.js |
| Иконки | Lucide React |

**Path alias:** `@/*` → `src/*`

---

## 📁 Структура проекта

```
src/
├── App.tsx                    # Главный компонент
├── types.ts                   # Все TypeScript типы
├── main.tsx                   # Точка входа
├── index.css                  # Глобальные стили
│
├── components/
│   ├── screens/
│   │   ├── MarketScreen.tsx   # Маркет (список акций)
│   │   ├── PortfolioScreen.tsx # Портфель
│   │   ├── RewardsScreen.tsx  # Награды (квесты, дивиденды, стейкинг)
│   │   ├── FriendsScreen.tsx  # Друзья, пулы, рефералы
│   │   ├── ProfileScreen.tsx  # Профиль и настройки
│   │   ├── AdvisorScreen.tsx  # AI-советник (Premium)
│   │   └── DevToolsScreen.tsx # Инструменты разработчика
│   ├── BottomNav.tsx          # Нижняя навигация
│   ├── MiniChart.tsx          # Графики
│   ├── TradeModal.tsx         # Торговля (Buy/Sell, RSI)
│   ├── OnboardingModal.tsx    # Tutorial
│   ├── PremiumModal.tsx       # Покупка Premium
│   └── NotificationToast.tsx  # Уведомления
│
├── store/
│   ├── gameStore.ts           # Игровая логика (~1800 строк)
│   └── themeStore.ts          # Тема (dark/light)
│
├── data/
│   └── seed.ts                # Генераторы данных
│
├── services/
│   ├── dataService.ts         # Интерфейс IDataService
│   ├── dataServiceFactory.ts  # Фабрика сервисов
│   ├── localStorageService.ts # LocalStorage реализация
│   └── apiService.ts          # API заглушка (будущее)
│
└── utils/
    └── cn.ts                  # Утилита классов
```

---

## 🔑 Ключевые файлы

| Файл | Строк | Описание |
|------|-------|----------|
| `src/store/gameStore.ts` | ~1800 | Вся игровая логика, состояние, методы |
| `src/components/screens/FriendsScreen.tsx` | ~1350 | Друзья, пулы, рефералы |
| `src/components/screens/DevToolsScreen.tsx` | ~820 | Инструменты разработчика |
| `src/components/screens/PortfolioScreen.tsx` | ~770 | Портфель, отчёты, графики |
| `src/components/screens/RewardsScreen.tsx` | ~730 | Квесты, дивиденды, стейкинг |
| `src/components/screens/AdvisorScreen.tsx` | ~750 | AI-советник |
| `src/components/TradeModal.tsx` | ~600 | Модалка торговли |
| `src/types.ts` | ~500 | Все типы и интерфейсы |

---

## 📊 Документация

Для подробной информации см.:

| Файл | Описание |
|------|----------|
| [`TECHNICAL_DOCS.md`](./TECHNICAL_DOCS.md) | **Полная техническая документация** (24 раздела) |
| [`CODEBASE.md`](./CODEBASE.md) | **Справочник разработчика** (архитектура, компоненты, формулы) |

---

## ⚡ Формулы

### Цена акции
```typescript
price = basePrice + (karma * 0.1) + (volume24h * 0.05) + hypeModifier
// Минимум: 10 $K
```

### Дивиденды
```typescript
div = amount × priceGrowth × 0.025 × бонусы
// бонусы: пул (+20%), уровень 10+ (+5%), буст (+5%/ур), Premium (+25%)
```

### Стейкинг APY (в день)
```typescript
baseAPY = isPremium ? 0.008 : 0.005
// + бонусы за сумму (Bronze +0.1% ... Diamond +0.75%)
```

---

## 🎮 Игровая механика

### Уровни (20 штук)
| Уровень | Карма | Бонус див. | Лимит портфеля |
|---------|-------|------------|----------------|
| 1 (Новичок 🌱) | 0 | 0% | 10 |
| 10 (Магнат 👑) | 2000 | 15% | 100 |
| 20 (Бог Кармы 🌌) | 50000 | 50% | 500 |

### Premium (500 $KARMA/мес)
- ♾️ Безлимитные трейды (Free: 50/день)
- ⏰ Дивиденды каждые 2 часа (Free: 4 часа)
- 💰 +25% к дивидендам
- 📈 APY стейкинга 0.8%/день (Free: 0.5%)
- 🎯 Limit ордера
- 📊 RSI/MA графики
- ⭐ VIP маркет
- 🤖 AI-советник
- 👥 Создание пулов
- 🏆 Квесты x2

### Рефералы (5 уровней)
| Уровень | Рефералов | Бонус |
|---------|-----------|-------|
| 1 (Новичок 🥉) | 0 | 5% |
| 3 (Лидер ⭐) | 10 | 10% |
| 5 (Легенда 👑) | 50 | 20% |

---

## 🧪 Тестирование

### DevTools (/test-dev)
- **Пресеты:** Быстрый тест, Premium, Богач
- **Вкладки:** Дивиденды, Пользователь, Портфель, Квесты, Лог, Настройки

### TEST_MODE
```javascript
// В консоли браузера:
window.KM_TEST_MODE = true;
location.reload();
// Дивиденды каждые 10 сек, проверка 24ч пропускается
```

---

## 💾 Хранение данных

### LocalStorage ключи
```
km_user              // Данные пользователя
km_shares            // Акции
km_holdings          // Портфель
km_trades            // История трейдов
km_unclaimed_div     // Несобранные дивиденды
km_next_dividend_time // Время следующего начисления
km_daily_quests      // Квесты
km_theme             // Тема
```

### Будущая миграция: PostgreSQL
- Таблицы: `users`, `shares`, `holdings`, `trades`, `pools`, `referrals`
- См. [`TECHNICAL_DOCS.md`](./TECHNICAL_DOCS.md#5-база-данных-и-хранение)

---

## 📱 Telegram Web App

```typescript
// App.tsx — инициализация
useEffect(() => {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor(mode === 'dark' ? '#0d0d1a' : '#FFFFFF');
    tg.setBackgroundColor(mode === 'dark' ? '#121212' : '#F5F5F7');
  }
}, [mode]);
```

---

## 🚀 Сборка

```bash
# Dev
npm run dev          # http://localhost:5173

# Production
npm run build        # dist/index.html (единый файл)
npm run preview      # Preview сборки
```

**Плагин singlefile:** Собирает всё в один HTML для Telegram Web App.

---

## 📋 Чек-лист для новой функции

1. [ ] Добавить типы в `types.ts`
2. [ ] Методы в `gameStore.ts`
3. [ ] Компонент в `components/`
4. [ ] Экран в `App.tsx` (роутинг)
5. [ ] Обновить `BottomNav.tsx` (если нужно)
6. [ ] Проверить тему в `themeStore.ts`
7. [ ] Протестировать в DevTools

---

## 🔗 Ссылки

- **Документация:** [`TECHNICAL_DOCS.md`](./TECHNICAL_DOCS.md), [`CODEBASE.md`](./CODEBASE.md)
- **Платформа:** Telegram Web App
- **Статус:** Production MVP

---

*KarmaMarket — Биржа социальной кармы в Telegram*
