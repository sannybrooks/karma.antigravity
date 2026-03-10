# KarmaMarket: План перехода на Telegram API и полноценный бэкенд

**Версия:** 1.0  
**Дата:** 6 марта 2026  
**Статус:** План разработки

---

## 📋 Оглавление

1. [Обзор текущей архитектуры](#1-обзор-текущей-архитектуры)
2. [Целевая архитектура](#2-целевая-архитектура)
3. [Этапы миграции](#3-этапы-миграции)
4. [Фаза 1: Подготовка и проектирование](#фаза-1-подготовка-и-проектирование)
5. [Фаза 2: Бэкенд разработка](#фаза-2-бэкенд-разработка)
6. [Фаза 3: Telegram Bot интеграция](#фаза-3-telegram-bot-интеграция)
7. [Фаза 4: Telegram Web App интеграция](#фаза-4-telegram-web-app-интеграция)
8. [Фаза 5: Миграция данных](#фаза-5-миграция-данных)
9. [Фаза 6: Тестирование и запуск](#фаза-6-тестирование-и-запуск)
10. [Приложения](#приложения)

---

## 1. Обзор текущей архитектуры

### Текущий стек (MVP)

```
┌─────────────────────────────────────┐
│         Telegram Web App            │
│  ┌───────────────────────────────┐  │
│  │   React + TypeScript + Vite   │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │   Zustand (gameStore)   │  │  │
│  │  └─────────────────────────┘  │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │   LocalStorageService   │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Проблемы текущей архитектуры:**
- ❌ Данные хранятся только на устройстве пользователя
- ❌ Нет синхронизации между устройствами
- ❌ Нет защиты от читерства (взлом localStorage)
- ❌ Моковые данные (генерация на клиенте)
- ❌ Нет реального взаимодействия с Telegram API
- ❌ Нет бэкенда для валидации действий
- ❌ Нет базы данных пользователей

---

## 2. Целевая архитектура

### Архитектура Production

```
┌──────────────────────────────────────────────────────────────────────┐
│                           Telegram Platform                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │
│  │   Telegram Bot  │  │   Web App API   │  │   Bot API Server    │  │
│  └────────┬────────┘  └────────┬────────┘  └──────────┬──────────┘  │
│           │                    │                       │             │
└───────────┼────────────────────┼───────────────────────┼─────────────┘
            │                    │                       │
            ▼                    ▼                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        Backend Server (Node.js)                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │
│  │   Express.js    │  │  Telegram API   │  │   WebSocket Server  │  │
│  │   REST API      │  │   Bot SDK       │  │   (Real-time)       │  │
│  └────────┬────────┘  └────────┬────────┘  └──────────┬──────────┘  │
│           │                    │                       │             │
│  ┌────────▼────────────────────▼───────────────────────▼──────────┐  │
│  │                    Business Logic Layer                         │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │  │
│  │  │ Auth Module │  │ Game Engine │  │  Payment/Stars Module   │ │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘ │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                      Data Access Layer                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │  │
│  │  │  Prisma ORM │  │  Redis Cache│  │   Message Queue (Bull)  │ │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘ │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
            │                    │                       │
            ▼                    ▼                       ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐
│   PostgreSQL    │  │     Redis       │  │   File Storage (S3)     │
│   (Main DB)     │  │   (Cache/Sess)  │  │   (Avatars, Files)      │
└─────────────────┘  └─────────────────┘  └─────────────────────────┘
```

### Компоненты архитектуры

| Компонент | Технология | Назначение |
|-----------|------------|------------|
| **Backend Server** | Node.js 20+ | Основной сервер приложений |
| **Framework** | Express.js 4.x | REST API, middleware |
| **Database** | PostgreSQL 15+ | Основное хранилище данных |
| **ORM** | Prisma 5.x | Работа с БД, миграции |
| **Cache** | Redis 7.x | Кэширование, сессии |
| **Queue** | Bull 4.x | Очереди задач (дивиденды, уведомления) |
| **Real-time** | Socket.io 4.x | WebSocket для обновлений |
| **Telegram Bot** | Telegraf 4.x / Grammy | Bot API интеграция |
| **File Storage** | S3-compatible | Хранение файлов |
| **Validation** | Zod | Валидация данных |
| **Auth** | JWT + Telegram initData | Аутентификация |

---

## 3. Этапы миграции

### Дорожная карта (12 недель)

```
Неделя 1-2:   ████████████████████  Фаза 1: Подготовка
Неделя 3-5:   ██████████████████████████████████████  Фаза 2: Бэкенд
Неделя 6-7:   ████████████████████████████  Фаза 3: Telegram Bot
Неделя 8-9:   ████████████████████████████  Фаза 4: Web App
Неделя 10:    ████████████████  Фаза 5: Миграция данных
Неделя 11-12: ██████████████████████████  Фаза 6: Тестирование
```

---

## Фаза 1: Подготовка и проектирование

**Длительность:** 2 недели  
**Приоритет:** Критический

### Задачи фазы 1

#### 1.1 Изучение документации Telegram

**Ресурсы:**
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Web Apps](https://core.telegram.org/bots/webapps)
- [Telegram Games](https://core.telegram.org/api/bots/games)
- [Telegram Payments](https://core.telegram.org/bots/payments)
- [Telegram Stars](https://core.telegram.org/bots/stars)

**Ключевые концепции для изучения:**
- Bot API методы и объекты
- Web App initData и валидация
- Inline клавиатуры и callback queries
- Main Button, Back Button
- CloudStorage
- HapticFeedback
- Платежи через Stars

#### 1.2 Проектирование схемы базы данных

**Сущности:**
- Users (пользователи)
- Shares (акции)
- Holdings (портфели)
- Trades (транзакции)
- Dividends (дивиденды)
- Staking (стейкинг)
- Quests (квесты)
- Referrals (рефералы)
- Pools (пулы)
- Premium (подписки)

#### 1.3 Проектирование API

**REST Endpoints:**
```
POST   /api/auth/telegram       # Аутентификация через Telegram
GET    /api/user/profile        # Профиль пользователя
GET    /api/user/balance        # Баланс
POST   /api/trades/buy          # Покупка акций
POST   /api/trades/sell         # Продажа акций
GET    /api/shares              # Список акций
GET    /api/shares/:id          # Конкретная акция
GET    /api/portfolio           # Портфель пользователя
POST   /api/staking/stake       # Внести в стейкинг
POST   /api/staking/unstake     # Вывести из стейкинга
POST   /api/staking/claim       # Забрать награду
GET    /api/dividends           # Дивиденды
POST   /api/dividends/claim     # Собрать дивиденды
GET    /api/quests              # Квесты
POST   /api/quests/:id/claim    # Забрать награду квеста
GET    /api/referrals           # Рефералы
POST   /api/referrals/claim     # Забрать реферальные
GET    /api/pools               # Пулы
POST   /api/pools/create        # Создать пул
POST   /api/pools/join          # Вступить в пул
POST   /api/premium/subscribe   # Подписаться на Premium
```

**WebSocket Events:**
```
→ client: subscribe, unsubscribe
← server: price_update, dividend_notification, quest_progress
```

#### 1.4 Настройка инфраструктуры

**Требуемые сервисы:**
- PostgreSQL (основная БД)
- Redis (кэш, сессии, очереди)
- S3-compatible storage (файлы)
- HTTPS сертификат (для webhook)
- CI/CD pipeline

---

### 📝 Промпт 1.1: Создание схемы Prisma

```
Ты — senior backend разработчик с экспертизой в Prisma ORM и PostgreSQL.

ЗАДАЧА: Спроектировать и написать полную схему Prisma для проекта KarmaMarket — 
Telegram Mini App игры-симулятора биржи кармы.

ТРЕБОВАНИЯ К МОДЕЛЯМ:

1. User (Пользователь)
   - id: String (UUID, primary key)
   - telegramId: String (unique, индекс) — ID пользователя Telegram
   - username: String? (unique) — username Telegram
   - firstName: String
   - lastName: String?
   - avatarUrl: String?
   - languageCode: String (default: 'ru')
   - karma: Int (default: 100)
   - level: Int (default: 1)
   - balance: Decimal (default: 2000)
   - premium: Boolean (default: false)
   - premiumExpiresAt: DateTime?
   - referralCode: String (unique) — его реферальный код
   - referredBy: String? (foreign key к User.id) — кто пригласил
   - staked: Decimal (default: 0)
   - stakedAt: DateTime?
   - autoCompound: Boolean (default: false)
   - poolId: String? (foreign key к Pool.id)
   - dailyVotesUsed: Int (default: 0)
   - lastVoteReset: DateTime
   - onboarded: Boolean (default: false)
   - cardBio: String (default: 'Трейдер на KarmaMarket 💎')
   - cardColor: String (default: '#00FF7F')
   - cardBadge: String (default: '💎')
   - cardBackground: String (default: 'gradient1')
   - selfBoostLevel: Int (default: 0)
   - selfBoostExpiry: DateTime?
   - totalReferrals: Int (default: 0)
   - referralTotalEarnings: Decimal (default: 0)
   - referralPendingEarnings: Decimal (default: 0)
   - referralTier: Int (default: 1)
   - totalTradesAllTime: Int (default: 0)
   - totalBoostsGiven: Int (default: 0)
   - totalVotesGiven: Int (default: 0)
   - totalDividendsClaimed: Int (default: 0)
   - totalSharesBought: Int (default: 0)
   - consecutiveLoginDays: Int (default: 1)
   - lastQuestReset: DateTime
   - lastStakingClaim: DateTime?
   - createdAt: DateTime (default: now())
   - updatedAt: DateTime (updatedAt)
   
   Relations:
   - referredUsers: User[] (те, кого пригласил)
   - referrer: User? (кто пригласил)
   - holdings: Holding[]
   - trades: Trade[]
   - stakes: StakingRecord[]
   - dividends: DividendRecord[]
   - quests: UserQuest[]
   - pool: Pool? (текущий пул)
   - poolMembers: PoolMember[]

2. Share (Акцию)
   - id: String (UUID)
   - ownerId: String (foreign key к User.telegramId)
   - ticker: String (unique)
   - username: String
   - avatar: String
   - karma: Int
   - basePrice: Decimal (default: 100)
   - currentPrice: Decimal
   - previousPrice: Decimal
   - price24hAgo: Decimal
   - volume24h: Int (default: 0)
   - hypeModifier: Decimal (default: 0)
   - totalSupply: Int (default: 10000)
   - isVIP: Boolean (default: false)
   - hidden: Boolean (default: false)
   - lastPriceUpdate: DateTime
   - createdAt: DateTime
   - updatedAt: DateTime
   
   Relations:
   - owner: User
   - holdings: Holding[]
   - trades: Trade[]
   - priceHistory: PriceHistory[]
   - shareholders: Shareholder[]

3. PriceHistory (История цен)
   - id: String (UUID)
   - shareId: String (foreign key)
   - time: DateTime
   - open: Decimal
   - high: Decimal
   - low: Decimal
   - close: Decimal
   - volume: Int
   
   Relations:
   - share: Share

4. Holding (Позиция в портфеле)
   - id: String (UUID)
   - userId: String (foreign key)
   - shareId: String (foreign key)
   - amount: Int
   - avgBuyPrice: Decimal
   - boughtAt: DateTime
   
   Relations:
   - user: User
   - share: Share
   
   @@unique([userId, shareId])

5. Trade (Транзакция)
   - id: String (UUID)
   - userId: String (foreign key)
   - shareId: String (foreign key)
   - side: Enum ('BUY', 'SELL')
   - type: Enum ('MARKET', 'LIMIT')
   - amount: Int
   - price: Decimal
   - limitPrice: Decimal?
   - fee: Decimal
   - rebate: Decimal
   - status: Enum ('PENDING', 'FILLED', 'CANCELLED')
   - pnl: Decimal?
   - createdAt: DateTime
   - filledAt: DateTime?
   
   Relations:
   - user: User
   - share: Share

6. Order (Отложенный ордер)
   - id: String (UUID)
   - userId: String (foreign key)
   - shareId: String (foreign key)
   - side: Enum ('BUY', 'SELL')
   - type: Enum ('LIMIT')
   - amount: Int
   - limitPrice: Decimal
   - status: Enum ('PENDING', 'FILLED', 'CANCELLED')
   - createdAt: DateTime
   - expiresAt: DateTime?
   
   Relations:
   - user: User
   - share: Share

7. DividendRecord (Дивиденд)
   - id: String (UUID)
   - userId: String (foreign key)
   - shareId: String (foreign key)
   - shareTicker: String
   - amount: Decimal
   - timestamp: DateTime
   
   Relations:
   - user: User
   - share: Share

8. StakingRecord (Стейкинг запись)
   - id: String (UUID)
   - userId: String (foreign key)
   - type: Enum ('STAKE', 'UNSTAKE', 'CLAIM', 'COMPOUND')
   - amount: Decimal
   - reward: Decimal?
   - apy: Decimal?
   - timestamp: DateTime
   
   Relations:
   - user: User

9. Quest (Квест)
   - id: String (UUID)
   - type: Enum (10 типов квестов)
   - title: String
   - description: String
   - icon: String
   - target: Int
   - reward: Int ($KARMA)
   - karmaReward: Int
   - isVip: Boolean (default: false)
   - isActive: Boolean (default: true)
   
   Relations:
   - userQuests: UserQuest[]

10. UserQuest (Прогресс квеста пользователя)
    - id: String (UUID)
    - userId: String (foreign key)
    - questId: String (foreign key)
    - progress: Int (default: 0)
    - completed: Boolean (default: false)
    - claimed: Boolean (default: false)
    - date: DateTime (дата квеста)
    
    Relations:
    - user: User
    - quest: Quest
    
    @@unique([userId, questId, date])

11. ReferralEarning (Реферальное начисление)
    - id: String (UUID)
    - referrerId: String (foreign key к User)
    - referralId: String (foreign key к User)
    - action: Enum ('TRADE_BUY', 'TRADE_SELL', 'BOOST', 'DIVIDEND')
    - amount: Decimal (сумма действия)
    - bonus: Decimal (бонус реферера)
    - tier: Int (уровень реферера)
    - level: Int (1 или 2)
    - timestamp: DateTime
    
    Relations:
    - referrer: User
    - referral: User

12. Pool (Пул)
    - id: String (UUID)
    - name: String
    - leaderId: String (foreign key к User.telegramId)
    - dividendBonus: Decimal (default: 0.2)
    - maxMembers: Int (default: 20)
    - createdAt: DateTime
    - totalTrades: Int (default: 0)
    - totalBoosts: Int (default: 0)
    - totalDividends: Decimal (default: 0)
    - weeklyGrowth: Decimal (default: 0)
    
    Relations:
    - leader: User
    - members: PoolMember[]
    - activities: PoolActivity[]
    - notifications: PoolNotification[]

13. PoolMember (Участник пула)
    - id: String (UUID)
    - poolId: String (foreign key)
    - userId: String (foreign key)
    - role: Enum ('LEADER', 'ADMIN', 'OFFICER', 'MEMBER', 'RECRUIT')
    - joinedAt: DateTime
    - weeklyTrades: Int (default: 0)
    - weeklyBoosts: Int (default: 0)
    - weeklyVotes: Int (default: 0)
    - contributionScore: Int (default: 0)
    
    Relations:
    - pool: Pool
    - user: User
    
    @@unique([poolId, userId])

14. PoolActivity (Активность пула)
    - id: String (UUID)
    - poolId: String (foreign key)
    - userId: String (foreign key)
    - action: Enum ('TRADE', 'BOOST', 'VOTE', 'JOIN', 'LEAVE', 'QUEST_COMPLETE')
    - amount: Int?
    - description: String
    - timestamp: DateTime
    
    Relations:
    - pool: Pool
    - user: User

15. PremiumSubscription (Подписка)
    - id: String (UUID)
    - userId: String (foreign key)
    - starsAmount: Int (цена в Stars)
    - durationDays: Int (30)
    - startDate: DateTime
    - endDate: DateTime
    - status: Enum ('ACTIVE', 'EXPIRED', 'CANCELLED', 'REFUNDED')
    - telegramTransactionId: String?
    - createdAt: DateTime
    
    Relations:
    - user: User

16. Notification (Уведомление)
    - id: String (UUID)
    - userId: String (foreign key)
    - type: Enum ('INFO', 'SUCCESS', 'WARNING', 'ERROR')
    - message: String
    - read: Boolean (default: false)
    - createdAt: DateTime
    
    Relations:
    - user: User

17. ActiveEvent (Активное событие)
    - id: String (UUID)
    - name: String
    - description: String
    - modifier: Decimal
    - startsAt: DateTime
    - endsAt: DateTime
    - isActive: Boolean (default: true)

18. SystemSettings (Настройки системы)
    - key: String (primary key)
    - value: String
    - description: String?
    - updatedAt: DateTime

ДОПОЛНИТЕЛЬНЫЕ ТРЕБОВАНИЯ:

1. Все модели должны иметь createdAt и updatedAt
2. Использовать Decimal для денежных значений
3. Использовать UUID для всех ID
4. Добавить индексы на часто используемые поля (telegramId, userId, shareId)
5. Добавить @@map для указания имен таблиц в snake_case
6. Добавить комментарии к моделям и полям

РЕЗУЛЬТАТ:
- Полный файл schema.prisma
- Миграции для PostgreSQL
- Seed данные для тестирования

ВЫВОД:
- schema.prisma файл
- SQL миграции
- Seed скрипт
```

---

### 📝 Промпт 1.2: Проектирование REST API

```
Ты — senior backend разработчик с экспертизой в проектировании REST API для high-load приложений.

ЗАДАЧА: Спроектировать полную спецификацию REST API для проекта KarmaMarket — 
Telegram Mini App игры-симулятора биржи кармы.

ТРЕБОВАНИЯ К API:

1. Аутентификация и авторизация
   - Аутентификация через Telegram initData
   - JWT токены для сессий
   - Валидация подписи initData

2. Структура ответов
   - Унифицированный формат ответов
   - Пагинация для списков
   - Обработка ошибок

3. Rate limiting
   - Разные лимиты для разных endpoints
   - Приоритет для Premium пользователей

СПЕЦИФИКАЦИЯ ENDPOINTS:

Для каждого endpoint указать:
- Метод и путь
- Описание
- Параметры запроса (query, body, path)
- Валидация (Zod schema)
- Ответ (успех)
- Ответ (ошибки)
- Rate limit
- Требуется ли Premium

КАТЕГОРИИ ENDPOINTS:

1. Auth (аутентификация)
2. User (профиль пользователя)
3. Shares (акции)
4. Trades (транзакции)
5. Portfolio (портфель)
6. Staking (стейкинг)
7. Dividends (дивиденды)
8. Quests (квесты)
9. Referrals (рефералы)
10. Pools (пулы)
11. Premium (подписка)
12. Notifications (уведомления)

ДОПОЛНИТЕЛЬНО:
- WebSocket events для real-time обновлений
- Webhook handlers для Telegram Bot API
- Background jobs для дивидендов и событий

РЕЗУЛЬТАТ:
- Полная спецификация API в формате OpenAPI 3.0
- Zod схемы для валидации
- TypeScript типы для request/response
```

---

### 📝 Промпт 1.3: Настройка инфраструктуры

```
Ты — DevOps инженер с экспертизой в настройке инфраструктуры для Node.js приложений.

ЗАДАЧА: Создать полную конфигурацию инфраструктуры для проекта KarmaMarket.

ТРЕБУЕМЫЕ КОМПОНЕНТЫ:

1. Docker конфигурация
   - Dockerfile для Node.js приложения
   - docker-compose.yml для локальной разработки
   - Multi-stage build для оптимизации размера

2. База данных (PostgreSQL)
   - Конфигурация Docker
   - Настройка производительности
   - Backup стратегия

3. Redis
   - Конфигурация Docker
   - Настройка persistence
   - Memory limits

4. Nginx (reverse proxy)
   - Конфигурация для production
   - HTTPS настройка
   - Rate limiting на уровне Nginx
   - Кэширование статики

5. CI/CD pipeline (GitHub Actions)
   - Тестирование
   - Build
   - Deploy

6. Monitoring
   - Prometheus + Grafana
   - Логирование (Winston + ELK stack)
   - Health checks

7. Безопасность
   - HTTPS (Let's Encrypt)
   - Firewall правила
   - Secrets management

РЕЗУЛЬТАТ:
- docker-compose.yml (development)
- Dockerfile (production)
- nginx.conf
- GitHub Actions workflows
- Конфигурационные файлы для monitoring
- Документация по развертыванию
```

---

## Фаза 2: Бэкенд разработка

**Длительность:** 3 недели  
**Приоритет: Критический**

### Задачи фазы 2

#### 2.1 Инициализация проекта

**Структура проекта:**
```
backend/
├── src/
│   ├── index.ts              # Entry point
│   ├── app.ts                # Express app
│   ├── config/               # Конфигурация
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── telegram.ts
│   │   └── index.ts
│   ├── modules/              # Модули приложения
│   │   ├── auth/
│   │   ├── user/
│   │   ├── shares/
│   │   ├── trades/
│   │   ├── staking/
│   │   ├── dividends/
│   │   ├── quests/
│   │   ├── referrals/
│   │   ├── pools/
│   │   └── premium/
│   ├── common/               # Общие утилиты
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   ├── lib/                  # Библиотеки
│   │   ├── prisma.ts
│   │   ├── redis.ts
│   │   ├── logger.ts
│   │   └── jwt.ts
│   └── types/                # TypeScript типы
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── tests/
├── .env.example
├── package.json
└── tsconfig.json
```

#### 2.2 Модуль аутентификации

**Функционал:**
- Валидация Telegram initData
- Генерация JWT токенов
- Refresh токены
- Middleware для защиты endpoints

#### 2.3 Модуль пользователя

**Функционал:**
- Профиль пользователя
- Баланс и карма
- Статистика
- Настройки

#### 2.4 Модуль акций

**Функционал:**
- Список акций
- Детали акции
- История цен
- Обновление цен (cron job)

#### 2.5 Модуль торговли

**Функционал:**
- Покупка акций
- Продажа акций
- Limit ордера
- История транзакций

#### 2.6 Модуль стейкинга

**Функционал:**
- Внести в стейкинг
- Вывести из стейкинга
- Забрать награду
- Auto-compound (Premium)

#### 2.7 Модуль дивидендов

**Функционал:**
- Расчёт дивидендов (cron job)
- Начисление дивидендов
- История дивидендов
- Сбор дивидендов

#### 2.8 Модуль квестов

**Функционал:**
- Список квестов
- Прогресс квестов
- Обновление прогресса
- Сбор наград

#### 2.9 Модуль рефералов

**Функционал:**
- Реферальная ссылка
- Список рефералов
- Начисление бонусов
- Сбор реферальных

#### 2.10 Модуль пулов

**Функционал:**
- Создание пула
- Вступление/выход
- Активность пула
- Статистика пула

#### 2.11 Модуль Premium

**Функционал:**
- Подписка через Telegram Stars
- Проверка статуса
- Продление подписки

#### 2.12 WebSocket сервер

**Функционал:**
- Real-time обновления цен
- Уведомления о дивидендах
- Уведомления о квестах

---

### 📝 Промпт 2.1: Создание базовой структуры проекта

```
Ты — senior Node.js разработчик с экспертизой в Express.js, TypeScript и Prisma.

ЗАДАЧА: Создать базовую структуру backend проекта для KarmaMarket.

ТРЕБОВАНИЯ:

1. Node.js 20+, TypeScript 5+, Express.js 4.x
2. Prisma ORM для работы с PostgreSQL
3. Redis для кэширования
4. JWT для аутентификации
5. Winston для логирования
6. Zod для валидации
7. Helmet для безопасности
8. CORS настройка

СТРУКТУРА ПРОЕКТА:
(см. выше в разделе 2.1)

РЕЗУЛЬТАТ:
- package.json со всеми зависимостями
- tsconfig.json
- .env.example
- src/index.ts (entry point)
- src/app.ts (Express app)
- src/config/*.ts (конфигурация)
- src/lib/prisma.ts (Prisma client singleton)
- src/lib/redis.ts (Redis client singleton)
- src/lib/logger.ts (Winston logger)
- src/lib/jwt.ts (JWT utilities)
- Базовый health check endpoint
- Error handling middleware
- CORS middleware
- Request logging middleware

ВАЖНО:
- Использовать ES modules
- Строгая типизация TypeScript
- Правильная обработка ошибок
- Логирование всех запросов
```

---

### 📝 Промпт 2.2: Модуль аутентификации через Telegram

```
Ты — senior backend разработчик с экспертизой в Telegram Bot API и безопасности.

ЗАДАЧА: Реализовать модуль аутентификации через Telegram initData.

ТРЕБОВАНИЯ К БЕЗОПАСНОСТИ:

1. Валидация initData
   - Проверка HMAC-SHA256 подписи
   - Использование токена бота как ключа
   - Проверка времени жизни (max 5 минут)

2. JWT токены
   - Access token (15 минут)
   - Refresh token (30 дней)
   - HttpOnly cookies для refresh token

3. Защита от атак
   - Rate limiting на endpoint аутентификации
   - Блокировка после N неудачных попыток
   - Проверка user agent

АРХИТЕКТУРА МОДУЛЯ:

src/modules/auth/
├── auth.controller.ts      # HTTP endpoints
├── auth.service.ts         # Business logic
├── auth.middleware.ts      # JWT middleware
├── auth.guard.ts           # Route guard
├── dto/
│   ├── login.dto.ts        # Login request schema
│   └── tokens.dto.ts       # Tokens response schema
└── types.ts                # Module types

ENDPOINTS:

POST /api/auth/telegram
- Body: { initData: string }
- Response: { accessToken: string, refreshToken: string, user: UserDto }
- Rate limit: 10 requests/minute

POST /api/auth/refresh
- Body: { refreshToken: string }
- Response: { accessToken: string, refreshToken: string }
- Rate limit: 30 requests/hour

POST /api/auth/logout
- Headers: Authorization
- Response: { success: true }

GET /api/auth/me
- Headers: Authorization
- Response: { user: UserDto }

ФУНКЦИИ ДЛЯ РЕАЛИЗАЦИИ:

1. validateTelegramInitData(initData: string, botToken: string): Promise<UserData>
   - Разбор initData
   - Проверка подписи
   - Проверка времени
   - Возврат данных пользователя

2. generateTokens(userId: string): Promise<{ accessToken: string, refreshToken: string }>
   - Генерация JWT access token
   - Генерация refresh token
   - Сохранение refresh token в БД

3. refreshTokens(refreshToken: string): Promise<{ accessToken: string, refreshToken: string }>
   - Валидация refresh token
   - Проверка на отзыв
   - Генерация новых токенов

4. revokeTokens(userId: string): Promise<void>
   - Отзыв всех refresh tokens пользователя

5. AuthGuard
   - Middleware для проверки JWT
   - Извлечение userId из токена
   - Добавление в request.user

РЕЗУЛЬТАТ:
- Полный код модуля auth
- Unit тесты для validateTelegramInitData
- Unit тесты для generateTokens
- Integration тесты для endpoints
- Документация по использованию
```

---

### 📝 Промпт 2.3: Модуль торговли акциями

```
Ты — senior backend разработчик с экспертизой в финансовых системах и high-load приложениях.

ЗАДАЧА: Реализовать модуль торговли акциями (buy/sell).

БИЗНЕС-ЛОГИКА:

1. Покупка акций
   - Проверка баланса пользователя
   - Проверка лимита трейдов (50/день для Free, ♾️ для Premium)
   - Расчёт комиссии (0.5%)
   - Расчёт рибэта (0.1-0.5% в зависимости от объёма)
   - Обновление портфеля
   - Обновление цены акции
   - Начисление реферального бонуса (5-20%)
   - Обновление прогресса квестов

2. Продажа акций
   - Проверка наличия акций
   - Проверка мин. времени удержания (1 минута)
   - Расчёт PNL
   - Начисление кармы за прибыль (10% от PNL)
   - Обновление портфеля
   - Обновление цены акции
   - Начисление реферального бонуса

3. Limit ордера (Premium)
   - Создание ордера
   - Проверка при обновлении цен
   - Исполнение ордера
   - Уведомление пользователя

АРХИТЕКТУРА МОДУЛЯ:

src/modules/trades/
├── trades.controller.ts    # HTTP endpoints
├── trades.service.ts       # Business logic
├── orders.service.ts       # Limit orders logic
├── dto/
│   ├── buy.dto.ts
│   ├── sell.dto.ts
│   └── order.dto.ts
└── types.ts

ENDPOINTS:

POST /api/trades/buy
- Headers: Authorization
- Body: { shareId: string, amount: number, type: 'MARKET' | 'LIMIT', limitPrice?: number }
- Response: { trade: TradeDto, holding: HoldingDto }
- Rate limit: 30 requests/minute

POST /api/trades/sell
- Headers: Authorization
- Body: { shareId: string, amount: number }
- Response: { trade: TradeDto, pnl: number }
- Rate limit: 30 requests/minute

GET /api/trades/history
- Headers: Authorization
- Query: { page?: number, limit?: number, type?: 'BUY' | 'SELL' }
- Response: { trades: TradeDto[], total: number, page: number }

POST /api/orders/create
- Headers: Authorization (Premium required)
- Body: { shareId: string, side: 'BUY' | 'SELL', amount: number, limitPrice: number }
- Response: { order: OrderDto }

POST /api/orders/cancel/:orderId
- Headers: Authorization
- Response: { success: true }

GET /api/orders/active
- Headers: Authorization
- Response: { orders: OrderDto[] }

ФОРМУЛЫ:

1. Цена акции:
   price = basePrice + (karma * 0.1) + (volume24h * 0.05) + hypeModifier

2. Комиссия:
   fee = totalCost * 0.005

3. Рибэт:
   rebateRate = dailyVol > 10000 ? 0.005 : dailyVol > 1000 ? 0.003 : 0.001
   rebate = totalCost * rebateRate

4. Реферальный бонус:
   bonusPercent = getReferralTier(referrer).bonusPercent
   bonus = totalCost * bonusPercent / 100

ТРАНЗАКЦИИ:

Все операции с балансом и портфелем должны быть в транзакции:
```typescript
await prisma.$transaction(async (tx) => {
  // 1. Проверка баланса
  // 2. Обновление баланса
  // 3. Создание/обновление holding
  // 4. Создание trade записи
  // 5. Обновление цены акции
  // 6. Начисление реферального бонуса
  // 7. Обновление прогресса квестов
});
```

РЕЗУЛЬТАТ:
- Полный код модуля trades
- Unit тесты для расчётов
- Integration тесты для endpoints
- Обработка race conditions
- Оптимистичные блокировки
```

---

### 📝 Промпт 2.4: Система дивидендов (cron jobs)

```
Ты — senior backend разработчик с экспертизой в распределённых системах и cron jobs.

ЗАДАЧА: Реализовать систему начисления дивидендов.

ТРЕБОВАНИЯ:

1. Интервалы начисления
   - Free: каждые 4 часа
   - Premium: каждые 2 часа
   - Тестовый режим: каждые 10 секунд

2. Условия получения
   - Акция куплена 24+ часа назад
   - Цена выросла за 24 часа
   - Несобранные дивиденды собраны

3. Формула расчёта
   div = amount × priceGrowth × 0.025 × бонусы
   бонусы: пул (1.2), уровень 10+ (1.05), буст (1 + level*0.05), Premium (1.25)

4. Background job
   - Запуск каждые 5 секунд
   - Проверка пользователей с подошедшим временем
   - Пакетная обработка (batch processing)
   - Логирование ошибок

АРХИТЕКТУРА:

src/modules/dividends/
├── dividends.service.ts    # Business logic
├── dividends.processor.ts  # Bull queue processor
├── dividends.cron.ts       # Cron job scheduler
└── dto/
    └── dividend.dto.ts

КОМПОНЕНТЫ:

1. DividendsService
   - calculateDividends(userId: string): Promise<number>
   - claimDividends(userId: string): Promise<void>
   - getUnclaimedDividends(userId: string): Promise<number>
   - getDividendHistory(userId: string): Promise<DividendRecord[]>

2. Cron Job (node-cron)
   - Запуск каждые 5 секунд
   - Выборка пользователей с nextDividendTime <= now
   - Пакетная обработка по 100 пользователей
   - Обновление nextDividendTime

3. Bull Queue (для отложенных задач)
   - Очередь 'dividends'
   - Job для каждого пользователя
   - Retry logic при ошибках
   - Dead letter queue

4. WebSocket уведомления
   - Уведомление о начислении дивидендов
   - Real-time обновление баланса

ОПТИМИЗАЦИЯ:

1. Индексы в БД:
   - (userId, nextDividendTime)
   - (userId, claimed)

2. Кэширование:
   - Кэш несобранных дивидендов (Redis)
   - TTL: 1 минута

3. Пакетная обработка:
   - Обработка по 100 пользователей за раз
   - Параллельное выполнение (Promise.all)

4. Rate limiting:
   - Максимум 1000 пользователей в минуту
   - Приоритет Premium пользователей

ОБРАБОТКА ОШИБОК:

1. Логирование всех ошибок
2. Retry с exponential backoff
3. Dead letter queue для failed jobs
4. Alert при превышении порога ошибок

РЕЗУЛЬТАТ:
- DividendsService с полной логикой
- Cron job конфигурация
- Bull queue processor
- WebSocket integration
- Unit тесты для формул
- Integration тесты для cron job
- Monitoring dashboard (количество начислений, ошибки)
```

---

### 📝 Промпт 2.5: WebSocket сервер для real-time обновлений

```
Ты — senior backend разработчик с экспертизой в WebSocket и real-time системах.

ЗАДАЧА: Реализовать WebSocket сервер для real-time обновлений.

ТРЕБОВАНИЯ:

1. Библиотека: Socket.io 4.x
2. Аутентификация через JWT
3. Rooms для пользователей
4. Rate limiting на WebSocket события

АРХИТЕКТУРА:

src/websocket/
├── websocket.gateway.ts    # Socket.io gateway
├── websocket.middleware.ts # Auth middleware
└── events.ts               # Event types

СОБЫТИЯ ОТ КЛИЕНТА:

1. 'subscribe' — подписка на обновления
   - Payload: { token: string }
   - Действие: Аутентификация,加入 room

2. 'unsubscribe' — отписка
   - Действие: Выход из room

3. 'ping' — keep-alive
   - Response: 'pong'

СОБЫТИЯ ОТ СЕРВЕРА:

1. 'price_update' — обновление цены акции
   - Payload: { shareId: string, price: number, change: number }
   - Частота: каждые 10 секунд

2. 'dividend_notification' — начисление дивидендов
   - Payload: { amount: number, shareTicker: string }

3. 'quest_progress' — прогресс квеста
   - Payload: { questId: string, progress: number, target: number, completed: boolean }

4. 'balance_update' — обновление баланса
   - Payload: { balance: number, karma: number }

5. 'trade_executed' — исполнение трейда
   - Payload: { trade: TradeDto }

6. 'order_filled' — исполнение limit ордера
   - Payload: { order: OrderDto }

7. 'notification' — общее уведомление
   - Payload: { type: string, message: string }

РЕАЛИЗАЦИЯ:

1. WebSocket Gateway:
```typescript
@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL },
  namespace: 'ws',
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  
  handleConnection(client: Socket) {
    // Аутентификация
  }
  
  handleDisconnect(client: Socket) {
    // Cleanup
  }
  
  // Методы для отправки событий
  sendPriceUpdate(shareId: string, data: PriceUpdateDto) {
    this.server.to(`share:${shareId}`).emit('price_update', data);
  }
  
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }
}
```

2. Middleware для аутентификации:
```typescript
export const websocketAuthMiddleware = (socket: Socket, next: NextFunction) => {
  const token = socket.handshake.auth.token;
  // Валидация JWT
  // Добавление userId в socket.data
};
```

3. Интеграция с сервисами:
```typescript
// В TradesService
constructor(
  private websocketGateway: WebsocketGateway,
) {}

async executeTrade(...) {
  // Логика трейда
  this.websocketGateway.sendToUser(userId, 'trade_executed', trade);
}
```

ОПТИМИЗАЦИЯ:

1. Rooms для эффективной рассылки
2. Throttling событий (максимум 10 событий/секунду)
3. Compression для больших сообщений
4. Heartbeat для обнаружения отключений

МОНИТОРИНГ:

1. Количество подключений
2. Количество событий в секунду
3. Latency
4. Ошибки подключения

РЕЗУЛЬТАТ:
- Полный код WebSocket gateway
- Middleware для аутентификации
- Интеграция с модулями (trades, dividends, quests)
- Unit тесты
- Load testing конфигурация
```

---

## Фаза 3: Telegram Bot интеграция

**Длительность:** 2 недели  
**Приоритет: Высокий**

### Задачи фазы 3

#### 3.1 Создание бота

**Действия:**
1. Создать бота через @BotFather
2. Получить токен
3. Настроить команды бота
4. Настроить Menu Button

#### 3.2 Bot API интеграция

**Библиотека:** Telegraf 4.x или Grammy

**Функционал:**
- Обработка команды /start
- Обработка команды /profile
- Обработка команды /help
- Inline клавиатуры
- Callback queries

#### 3.3 Web App интеграция

**Функционал:**
- Кнопка для открытия Web App
- Передача start_param
- Обработка web_app_data

#### 3.4 Платежи через Stars

**Функционал:**
- Создание инвойса
- Обработка pre_checkout_query
- Обработка successful_payment

---

### 📝 Промпт 3.1: Создание Telegram бота

```
Ты — senior разработчик с экспертизой в Telegram Bot API.

ЗАДАЧА: Создать Telegram бота для проекта KarmaMarket.

ШАГИ:

1. Регистрация бота
   - Команда /newbot в @BotFather
   - Название: KarmaMarket Bot
   - Username: KarmaMarketBot (или KarmaMarket_test_bot)
   - Сохранить токен

2. Настройка бота
   - /setdescription — описание бота
   - /setabouttext — текст about
   - /setuserpic — аватар бота
   - /setcommands — список команд

3. Команды бота:
   /start — Запустить бота
   /profile — Мой профиль
   /balance — Мой баланс
   /portfolio — Мой портфель
   /market — Рынок акций
   /rewards — Награды и квесты
   /referrals — Рефералы
   /premium — Premium подписка
   /help — Помощь

4. Menu Button:
   - Текст: "Открыть KarmaMarket"
   - Тип: web_app
   - URL: https://your-domain.com

5. Inline клавиатуры:
   - Главное меню
   - Навигация по разделам
   - Быстрые действия

РЕЗУЛЬТАТ:
- Токен бота (сохранить в .env)
- Список команд
- Конфигурация Menu Button
- Скриншоты настроек
```

---

### 📝 Промпт 3.2: Реализация бота на Telegraf

```
Ты — senior Node.js разработчик с экспертизой в Telegram Bot API и Telegraf.

ЗАДАЧА: Реализовать Telegram бота для KarmaMarket.

ТРЕБОВАНИЯ:

1. Библиотека: Telegraf 4.x
2. TypeScript
3. Middleware для логирования
4. Обработка ошибок

СТРУКТУРА ПРОЕКТА:

bot/
├── src/
│   ├── index.ts          # Entry point
│   ├── bot.ts            # Telegraf instance
│   ├── scenes/           # Wizard scenes
│   │   ├── onboarding.ts
│   │   └── premium.ts
│   ├── handlers/         # Message handlers
│   │   ├── start.ts
│   │   ├── profile.ts
│   │   └── menu.ts
│   ├── keyboards/        # Keyboard layouts
│   │   ├── main-menu.ts
│   │   └── inline-menu.ts
│   └── middleware/       # Custom middleware
│       ├── logging.ts
│       └── error.ts
├── .env
└── package.json

ФУНКЦИОНАЛ:

1. Start handler:
   - Приветственное сообщение
   - Проверка регистрации
   - Создание пользователя в БД (если новый)
   - Главное меню (inline keyboard)

2. Profile handler:
   - Информация о пользователе
   - Баланс, карма, уровень
   - Кнопки действий

3. Web App handler:
   - Обработка web_app_data
   - Синхронизация данных

4. Inline keyboards:
   - Главное меню
   - Навигация
   - Callback queries

5. Scenes:
   - Onboarding (для новых пользователей)
   - Premium purchase

ПРИМЕР КОДА:

```typescript
import { Telegraf, Markup } from 'telegraf';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

// Start handler
bot.start(async (ctx) => {
  const startParam = ctx.startPayload; // start_param из deep link
  
  await ctx.reply(
    '👋 Добро пожаловать в KarmaMarket!',
    Markup.inlineKeyboard([
      [Markup.button.webApp('🚀 Открыть приложение', process.env.WEB_APP_URL!)],
      [Markup.button.callback('📊 Профиль', 'profile')],
      [Markup.button.callback('📈 Рынок', 'market')],
    ]).resize()
  );
});

// Callback query handler
bot.action('profile', async (ctx) => {
  // Получить данные пользователя из БД
  const user = await getUserByTelegramId(ctx.from.id);
  
  await ctx.editMessageText(
    `👤 Профиль\n\n` +
    `💎 Баланс: ${user.balance} $KARMA\n` +
    `⭐ Карма: ${user.karma}\n` +
    `🏆 Уровень: ${user.level}`,
    Markup.inlineKeyboard([
      [Markup.button.webApp('Открыть профиль', `${process.env.WEB_APP_URL}/profile`)],
      [Markup.button.callback('⬅️ Назад', 'main_menu')],
    ])
  );
});

// Web app data handler
bot.on('web_app_data', async (ctx) => {
  const data = ctx.message.web_app_data.data;
  // Обработка данных из Web App
});

bot.launch();
```

РЕЗУЛЬТАТ:
- Полный код бота
- Обработчики команд
- Inline клавиатуры
- Scenes для onboarding
- Middleware для логирования
- Обработка ошибок
- Деплой бота
```

---

### 📝 Промпт 3.3: Интеграция платежей через Stars

```
Ты — senior разработчик с экспертизой в Telegram Payments и Telegram Stars.

ЗАДАЧА: Реализовать оплату Premium подписки через Telegram Stars.

ТРЕБОВАНИЯ:

1. Валюта: XTR (Telegram Stars)
2. Цена: 500 Stars за 30 дней
3. Поддержка refund

АРХИТЕКТУРА:

1. Создание инвойса
   - Метод: createInvoiceLink или sendInvoice
   - Валюта: XTR
   - Цена: 500

2. Обработка pre_checkout_query
   - Проверка доступности
   - Подтверждение

3. Обработка successful_payment
   - Активация Premium
   - Уведомление пользователя

4. Refund
   - Метод: refundStarPayment
   - Логирование

ПРИМЕР КОДА:

```typescript
// Создание инвойса
bot.command('premium', async (ctx) => {
  const invoice = {
    title: 'KarmaMarket Premium',
    description: '30 дней Premium подписки',
    payload: 'premium_30d',
    provider_token: '', // Пусто для Stars
    currency: 'XTR',
    prices: [{ label: 'Premium 30 дней', amount: 500 }],
  };
  
  await ctx.replyWithInvoice(invoice);
});

// Pre-checkout query
bot.on('pre_checkout_query', async (ctx) => {
  const ok = true; // Всегда OK для Stars
  await ctx.answerPreCheckoutQuery(ok);
});

// Successful payment
bot.on('successful_payment', async (ctx) => {
  const payment = ctx.message.successful_payment;
  const userId = ctx.from.id;
  
  // Активация Premium в БД
  await activatePremium(userId, 30);
  
  await ctx.reply(
    '✅ Premium активирован!\n\n' +
    'Спасибо за покупку! Ваша подписка активна 30 дней.'
  );
});
```

РЕЗУЛЬТАТ:
- Код для создания инвойсов
- Обработка pre_checkout_query
- Обработка successful_payment
- Логирование платежей
- Обработка refund
```

---

## Фаза 4: Telegram Web App интеграция

**Длительность:** 2 недели  
**Приоритет: Высокий**

### Задачи фазы 4

#### 4.1 Инициализация Web App

**Изменения в коде:**
- Импорт Telegram.WebApp
- Инициализация при загрузке
- Получение initData

#### 4.2 Аутентификация через Web App

**Функционал:**
- Отправка initData на бэкенд
- Валидация на бэкенде
- Получение JWT токенов
- Сохранение токенов

#### 4.3 Интеграция с Telegram API

**Функционал:**
- Main Button
- Back Button
- HapticFeedback
- CloudStorage
- Theme parameters

#### 4.4 Интеграция с ботом

**Функционал:**
- Отправка данных боту (web_app_data)
- Закрытие Web App
- Редирект в бот

---

### 📝 Промпт 4.1: Интеграция Telegram Web App SDK

```
Ты — senior frontend разработчик с экспертизой в Telegram Web Apps.

ЗАДАЧА: Интегрировать Telegram Web App SDK в проект KarmaMarket.

ТРЕБОВАНИЯ:

1. Установка SDK:
   npm install @telegram-apps/sdk

2. Инициализация при загрузке:
   - Telegram.WebApp.ready()
   - Telegram.WebApp.expand()
   - Получение initData

3. Типизация:
   - TypeScript типы для Telegram.WebApp
   - Типы для initData

4. Хук для доступа к Telegram:
   - useTelegram() хук
   - Доступ к user, theme, etc.

ПРИМЕР КОДА:

```typescript
// src/hooks/useTelegram.ts
import { useEffect, useState } from 'react';

export function useTelegram() {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [initData, setInitData] = useState<string>('');

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    
    tg.ready();
    tg.expand();
    
    setInitData(tg.initData);
    
    if (tg.initDataUnsafe?.user) {
      setUser(tg.initDataUnsafe.user);
    }
    
    // Theme
    const themeParams = tg.themeParams;
    setTheme(themeParams);
    
    // Настройка цветов
    tg.setHeaderColor(themeParams.bg_color || '#121212');
    tg.setBackgroundColor(themeParams.bg_color || '#121212');
    
    return () => {
      tg.close();
    };
  }, []);

  return {
    user,
    theme,
    initData,
    WebApp: window.Telegram.WebApp,
    MainButton: window.Telegram.WebApp.MainButton,
    BackButton: window.Telegram.WebApp.BackButton,
    HapticFeedback: window.Telegram.WebApp.HapticFeedback,
    CloudStorage: window.Telegram.WebApp.CloudStorage,
  };
}
```

РЕЗУЛЬТАТ:
- Установленный SDK
- Хук useTelegram
- Типы для Telegram объектов
- Инициализация в App.tsx
- Обработка темы
```

---

### 📝 Промпт 4.2: Аутентификация через Web App

```
Ты — senior frontend разработчик с экспертизой в безопасности и аутентификации.

ЗАДАЧА: Реализовать аутентификацию через Telegram Web App initData.

ТРЕБОВАНИЯ:

1. Отправка initData на бэкенд
2. Получение JWT токенов
3. Сохранение токенов (httpOnly cookie или localStorage)
4. Refresh token logic
5. Обработка ошибок

ПРИМЕР КОДА:

```typescript
// src/services/auth.ts
import { api } from './api';

export async function loginWithTelegram(initData: string) {
  try {
    const response = await api.post('/api/auth/telegram', { initData });
    const { accessToken, refreshToken, user } = response.data;
    
    // Сохранение токенов
    localStorage.setItem('accessToken', accessToken);
    // Refresh token должен быть в httpOnly cookie
    
    return { user, accessToken };
  } catch (error) {
    console.error('Telegram login failed:', error);
    throw error;
  }
}

export async function refreshToken(): Promise<string> {
  const response = await api.post('/api/auth/refresh');
  return response.data.accessToken;
}

// src/App.tsx
function App() {
  const { initData } = useTelegram();
  const { isAuthenticated, login } = useAuth();

  useEffect(() => {
    if (initData && !isAuthenticated) {
      loginWithTelegram(initData)
        .then(({ user, accessToken }) => {
          login(user, accessToken);
        })
        .catch((error) => {
          console.error('Login failed:', error);
        });
    }
  }, [initData]);

  // ...
}
```

РЕЗУЛЬТАТ:
- Auth service для работы с API
- Login функция с initData
- Refresh token logic
- Auth context/hook
- Обработка ошибок
- Loading states
```

---

### 📝 Промпт 4.3: Интеграция Main Button и Back Button

```
Ты — senior frontend разработчик с экспертизой в Telegram Web Apps UI.

ЗАДАЧА: Интеграция Main Button и Back Button в KarmaMarket.

ТРЕБОВАНИЯ:

1. Main Button:
   - Настройка текста
   - Обработка нажатий
   - Показ/скрытие
   - Enable/disable

2. Back Button:
   - Обработка нажатий
   - Навигация назад
   - Показ/скрытие

ПРИМЕР КОДА:

```typescript
// src/hooks/useMainButton.ts
import { useEffect } from 'react';
import { useTelegram } from './useTelegram';
import { useNavigate } from 'react-router-dom';

export function useMainButton(config?: {
  text: string;
  onClick: () => void;
  visible?: boolean;
  disabled?: boolean;
  color?: string;
  textColor?: string;
}) {
  const { MainButton, WebApp } = useTelegram();
  const navigate = useNavigate();

  useEffect(() => {
    if (!config) {
      MainButton.hide();
      return;
    }

    const { text, onClick, visible = true, disabled = false } = config;

    MainButton.setText(text);
    
    if (config.color) {
      MainButton.setParams({ color: config.color });
    }
    
    if (config.textColor) {
      MainButton.setParams({ text_color: config.textColor });
    }

    MainButton.offClick();
    MainButton.onClick(() => {
      onClick();
      // Haptic feedback
      WebApp.HapticFeedback.impactOccurred('medium');
    });

    if (visible) {
      MainButton.show();
    } else {
      MainButton.hide();
    }

    if (disabled) {
      MainButton.disable();
    } else {
      MainButton.enable();
    }

    return () => {
      MainButton.offClick();
      MainButton.hide();
    };
  }, [config, MainButton, WebApp]);
}

// Использование в компоненте
function TradeModal() {
  const { handleTrade } = useTrade();
  
  useMainButton({
    text: 'Подтвердить сделку',
    onClick: handleTrade,
    visible: true,
    color: '#00FF7F',
    textColor: '#000000',
  });

  // ...
}

// src/hooks/useBackButton.ts
export function useBackButton(config?: {
  onClick?: () => void;
  visible?: boolean;
}) {
  const { BackButton } = useTelegram();
  const navigate = useNavigate();

  useEffect(() => {
    if (config?.visible === false) {
      BackButton.hide();
      return;
    }

    BackButton.offClick();
    BackButton.onClick(() => {
      if (config?.onClick) {
        config.onClick();
      } else {
        navigate(-1);
      }
    });
    BackButton.show();

    return () => {
      BackButton.offClick();
      BackButton.hide();
    };
  }, [config, BackButton, navigate]);
}
```

РЕЗУЛЬТАТ:
- Хук useMainButton
- Хук useBackButton
- Примеры использования
- Haptic feedback интеграция
```

---

### 📝 Промпт 4.4: Интеграция CloudStorage

```
Ты — senior frontend разработчик с экспертизой в Telegram Web Apps.

ЗАДАЧА: Интеграция CloudStorage для хранения данных пользователя.

ТРЕБОВАНИЯ:

1. Сохранение настроек
2. Сохранение прогресса
3. Синхронизация с бэкендом

ПРИМЕР КОДА:

```typescript
// src/services/cloudStorage.ts
import { Telegram } from '../types/telegram';

export class CloudStorageService {
  private storage: Telegram.WebApp.CloudStorage;

  constructor() {
    this.storage = window.Telegram.WebApp.CloudStorage;
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage.setItem(key, JSON.stringify(value), (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  async getItem<T>(key: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
      this.storage.getItem(key, (error, value) => {
        if (error) reject(error);
        else if (value) {
          try {
            resolve(JSON.parse(value));
          } catch {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
  }

  async removeItem(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage.removeItem(key, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  async getKeys(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.storage.getKeys((error, keys) => {
        if (error) reject(error);
        else resolve(keys || []);
      });
    });
  }
}

// Использование
const cloudStorage = new CloudStorageService();

// Сохранение настроек
await cloudStorage.setItem('settings', {
  darkMode: true,
  notifications: true,
});

// Получение настроек
const settings = await cloudStorage.getItem('settings');
```

РЕЗУЛЬТАТ:
- CloudStorage service
- Методы для CRUD операций
- Типизация
- Примеры использования
```

---

## Фаза 5: Миграция данных

**Длительность:** 1 неделя  
**Приоритет: Критический**

### Задачи фазы 5

#### 5.1 Экспорт данных из LocalStorage

**Скрипт для экспорта:**
- Чтение всех ключей km_*
- Преобразование в JSON
- Сохранение в файл

#### 5.2 Импорт данных в PostgreSQL

**Скрипт для импорта:**
- Чтение JSON файла
- Валидация данных
- Вставка в БД с маппингом

#### 5.3 Синхронизация данных

**Функционал:**
- Сравнение данных
- Разрешение конфликтов
- Слияние данных

---

### 📝 Промпт 5.1: Скрипт для экспорта данных

```
Ты — senior разработчик с экспертизой в миграции данных.

ЗАДАЧА: Создать скрипт для экспорта данных из LocalStorage.

ТРЕБОВАНИЯ:

1. Чтение всех ключей с префиксом km_*
2. Преобразование в JSON формат
3. Сохранение в файл
4. Валидация данных

ПРИМЕР КОДА:

```typescript
// export-data.ts
const keys = [
  'km_user',
  'km_shares',
  'km_holdings',
  'km_trades',
  'km_unclaimed_div',
  'km_daily_quests',
  // ... все ключи
];

const exportData = () => {
  const data: Record<string, any> = {};
  
  keys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        data[key] = JSON.parse(value);
      } catch {
        data[key] = value;
      }
    }
  });
  
  // Скачивание файла
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `karmamarket-backup-${new Date().toISOString()}.json`;
  a.click();
  
  return data;
};
```

РЕЗУЛЬТАТ:
- Скрипт экспорта
- Формат JSON файла
- Валидация данных
```

---

### 📝 Промпт 5.2: Скрипт для импорта данных

```
Ты — senior backend разработчик с экспертизой в миграции данных.

ЗАДАЧА: Создать скрипт для импорта данных в PostgreSQL.

ТРЕБОВАНИЯ:

1. Чтение JSON файла
2. Валидация данных
3. Маппинг на новые модели
4. Вставка в БД с транзакциями
5. Обработка конфликтов

ПРИМЕР КОДА:

```typescript
// import-data.ts
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';

const prisma = new PrismaClient();

async function importData(filePath: string) {
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));
  
  await prisma.$transaction(async (tx) => {
    // Импорт пользователей
    for (const userData of data.km_user) {
      await tx.user.upsert({
        where: { telegramId: userData.id },
        update: {
          karma: userData.karma,
          balance: userData.balance,
          // ...
        },
        create: {
          telegramId: userData.id,
          username: userData.username,
          karma: userData.karma,
          balance: userData.balance,
          // ...
        },
      });
    }
    
    // Импорт акций
    // Импорт портфеля
    // Импорт трейдов
    // ...
  });
}
```

РЕЗУЛЬТАТ:
- Скрипт импорта
- Маппинг данных
- Обработка ошибок
- Логирование
```

---

## Фаза 6: Тестирование и запуск

**Длительность:** 2 недели  
**Приоритет: Критический**

### Задачи фазы 6

#### 6.1 Unit тестирование

**Фреймворк:** Jest  
**Покрытие:** >80%

#### 6.2 Integration тестирование

**Тестирование API endpoints**

#### 6.3 E2E тестирование

**Фреймворк:** Playwright  
**Сценарии:** Критические user flows

#### 6.4 Load тестирование

**Инструмент:** k6  
**Цель:** 1000 concurrent users

#### 6.5 Security аудит

**Проверки:**
- OWASP Top 10
- Валидация initData
- Rate limiting
- SQL injection

#### 6.6 Production деплой

**Чек-лист:**
- [ ] База данных настроена
- [ ] Redis настроен
- [ ] Бэкенд деплоен
- [ ] Бот запущен
- [ ] Web App доступен
- [ ] HTTPS настроен
- [ ] Мониторинг активен
- [ ] Бэкапы настроены

---

### 📝 Промпт 6.1: Unit тесты для бизнес-логики

```
Ты — QA инженер с экспертизой в Jest и тестировании Node.js приложений.

ЗАДАЧА: Написать unit тесты для бизнес-логики KarmaMarket.

ТРЕБУЕМЫЕ ТЕСТЫ:

1. Аутентификация
   - validateTelegramInitData (valid data)
   - validateTelegramInitData (invalid signature)
   - validateTelegramInitData (expired)

2. Торговля
   - calculateTradeFee
   - calculateRebate
   - calculateReferralBonus
   - executeTrade (buy)
   - executeTrade (sell)
   - executeTrade (insufficient balance)

3. Дивиденды
   - calculateDividends
   - claimDividends
   - getUnclaimedDividends

4. Стейкинг
   - calculateStakingReward
   - stake
   - unstake (with penalty)
   - unstake (without penalty)

5. Квесты
   - generateDailyQuests
   - updateQuestProgress
   - claimQuestReward

ПРИМЕР КОДА:

```typescript
// tests/unit/trades.test.ts
import { calculateTradeFee, calculateRebate } from '../../src/modules/trades/trades.service';

describe('Trades', () => {
  describe('calculateTradeFee', () => {
    it('should calculate 0.5% fee', () => {
      const fee = calculateTradeFee(1000);
      expect(fee).toBe(5);
    });
  });

  describe('calculateRebate', () => {
    it('should return 0.1% for low volume', () => {
      const rebate = calculateRebate(500, 100);
      expect(rebate).toBe(0.5);
    });

    it('should return 0.3% for medium volume', () => {
      const rebate = calculateRebate(5000, 2000);
      expect(rebate).toBe(15);
    });

    it('should return 0.5% for high volume', () => {
      const rebate = calculateRebate(15000, 5000);
      expect(rebate).toBe(25);
    });
  });
});
```

РЕЗУЛЬТАТ:
- Unit тесты для всех сервисов
- Покрытие >80%
- Mock для внешних зависимостей
```

---

### 📝 Промпт 6.2: E2E тесты с Playwright

```
Ты — QA инженер с экспертизой в Playwright и E2E тестировании.

ЗАДАЧА: Написать E2E тесты для критических user flows.

ТРЕБУЕМЫЕ СЦЕНАРИИ:

1. Аутентификация
   - Login через Telegram
   - Получение токенов
   - Доступ к защищённым routes

2. Торговля
   - Покупка акции
   - Продажа акции
   - Проверка баланса
   - Проверка портфеля

3. Дивиденды
   - Ожидание начисления
   - Сбор дивидендов
   - Проверка баланса

4. Стейкинг
   - Внесение в стейкинг
   - Проверка прогресса
   - Забор награды
   - Вывод из стейкинга

5. Квесты
   - Просмотр квестов
   - Выполнение квеста
   - Сбор награды

ПРИМЕР КОДА:

```typescript
// tests/e2e/trading.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Trading', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/');
    await page.evaluate(() => {
      window.Telegram = {
        WebApp: {
          initData: 'mock_init_data',
          initDataUnsafe: { user: { id: 123456 } },
        },
      };
    });
  });

  test('should buy shares', async ({ page }) => {
    // Navigate to market
    await page.click('[data-testid="market-tab"]');
    
    // Select share
    await page.click('[data-testid="share-1"]');
    
    // Enter amount
    await page.fill('[data-testid="amount-input"]', '10');
    
    // Click buy
    await page.click('[data-testid="buy-button"]');
    
    // Verify notification
    await expect(page.locator('[data-testid="notification"]'))
      .toContainText('Куплено 10 акций');
    
    // Verify balance updated
    const balance = await page.locator('[data-testid="balance"]').textContent();
    expect(parseFloat(balance!)).toBeLessThan(2000);
  });

  test('should sell shares', async ({ page }) => {
    // ... similar pattern
  });
});
```

РЕЗУЛЬТАТ:
- E2E тесты для всех сценариев
- Mock Telegram WebApp
- Скриншоты при ошибках
- Video записи тестов
```

---

## Приложения

### A. Глоссарий

| Термин | Определение |
|--------|-------------|
| Mini App | Веб-приложение внутри Telegram |
| Web App | То же что Mini App |
| Bot API | API для управления ботом |
| WebApp API | API для веб-приложений в Telegram |
| initData | Данные для аутентификации от Telegram |
| Stars | Внутренняя валюта Telegram для оплаты |
| Inline Keyboard | Клавиатура встроенная в сообщение |
| Callback Query | Запрос от нажатия inline кнопки |

### B. Полезные ссылки

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Web Apps](https://core.telegram.org/bots/webapps)
- [Telegram Games](https://core.telegram.org/api/bots/games)
- [Telegram Payments](https://core.telegram.org/bots/payments)
- [Telegram Stars](https://core.telegram.org/bots/stars)
- [Telegraf](https://telegraf.js.org/)
- [Prisma](https://www.prisma.io/)
- [Socket.io](https://socket.io/)

### C. Чек-лист готовности

#### Бэкенд
- [ ] База данных настроена
- [ ] Миграции применены
- [ ] Seed данные загружены
- [ ] Redis подключен
- [ ] WebSocket сервер запущен
- [ ] Cron jobs настроены
- [ ] Логирование работает
- [ ] Мониторинг настроен
- [ ] Бэкапы настроены

#### Telegram Bot
- [ ] Бот создан
- [ ] Токен получен
- [ ] Команды настроены
- [ ] Menu Button настроен
- [ ] Inline клавиатуры работают
- [ ] Платежи через Stars работают

#### Web App
- [ ] HTTPS настроен
- [ ] Telegram SDK интегрирован
- [ ] Аутентификация работает
- [ ] Main Button работает
- [ ] Back Button работает
- [ ] Тема применяется
- [ ] HapticFeedback работает

#### Тестирование
- [ ] Unit тесты пройдены
- [ ] Integration тесты пройдены
- [ ] E2E тесты пройдены
- [ ] Load тесты пройдены
- [ ] Security аудит пройден

#### Деплой
- [ ] Production сервер настроен
- [ ] Домен настроен
- [ ] SSL сертификат установлен
- [ ] CI/CD pipeline работает
- [ ] Мониторинг активен
- [ ] Alerting настроен

---

**Документ создан:** 6 марта 2026  
**Автор:** KarmaMarket Development Team  
**Статус:** План разработки

*Этот документ является руководством по переходу на полноценный бэкенд и интеграцию с Telegram API.*
