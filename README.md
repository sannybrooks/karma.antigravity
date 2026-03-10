# KarmaMarket — Биржа кармы в Telegram 🚀

[![Deploy](https://github.com/your-username/karma.antigravity/actions/workflows/deploy.yml/badge.svg)](https://github.com/your-username/karma.antigravity/actions/workflows/deploy.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**KarmaMarket** — это Telegram Mini App, симулятор биржи социальной кармы. Покупай и продавай «акции» друзей, получай дивиденды, выполняй квесты и зарабатывай!

---

## 🎯 Возможности

- 📈 **Торговля акциями** — покупай и продавай акции друзей
- 💰 **Дивиденды** — пассивный доход каждые 2-4 часа
- 🔒 **Стейкинг** — застейкай $KARMA под 0.5-0.8%/день
- 👥 **Рефералы** — 2-уровневая система (5-20% бонус)
- 📋 **Квесты** — ежедневные задания с наградами
- ⚔️ **Пулы** — вступай в команды с бонусами
- 👑 **Premium** — расширенные возможности

---

## 🛠 Технологический стек

### Frontend
- **React 19** + **TypeScript 5.9**
- **Vite 7** — сборка
- **Tailwind CSS 4** — стили
- **Zustand 5** — состояние
- **Framer Motion** — анимации
- **Chart.js** — графики

### Backend
- **Node.js 22** + **Express.js**
- **PostgreSQL 17** — база данных
- **Prisma ORM** — работа с БД
- **Redis 7** — кэширование
- **Socket.io** — WebSocket
- **JWT** — аутентификация

### Infrastructure
- **Ubuntu 24.04** — ОС
- **Nginx** — reverse proxy
- **PM2** — процесс менеджер
- **Let's Encrypt** — SSL

---

## 🚀 Быстрый старт

### Требования

- Node.js 22+
- PostgreSQL 17
- Redis 7
- Ubuntu 24.04 (для production)

### Установка (локально)

```bash
# Клонирование
git clone https://github.com/your-username/karma.antigravity.git
cd karma.antigravity

# Установка зависимостей
npm install
cd backend && npm install && cd ..

# Настройка .env
cp .env.example .env
cp backend/.env.example backend/.env

# Запуск
npm run dev
```

---

## 📁 Структура проекта

```
karma.antigravity/
├── src/                    # Frontend исходники
│   ├── components/         # React компоненты
│   ├── store/              # Zustand сторы
│   ├── services/           # API сервисы
│   └── types.ts            # TypeScript типы
├── backend/                # Backend
│   ├── src/                # Исходники
│   ├── prisma/             # Prisma схема
│   └── .env                # Переменные окружения
├── .github/workflows/      # CI/CD
├── .gitignore              # Git ignore
├── package.json            # Зависимости
└── README.md               # Документация
```

---

## 📖 Документация

| Файл | Описание |
|------|----------|
| [DEPLOY_UBUNTU.md](./DEPLOY_UBUNTU.md) | Инструкция по развёртыванию на Ubuntu 24.04 |
| [TECHNICAL_DOCS.md](./TECHNICAL_DOCS.md) | Полная техническая документация |
| [CODEBASE.md](./CODEBASE.md) | Справочник разработчика |
| [TGandBack.md](./TGandBack.md) | План перехода на Telegram API |

---

## 🔧 Разработка

### Ветки

- `main` — production версия
- `develop` — разработка
- `feature/*` — новые фичи
- `fix/*` — исправления

### Коммиты

Используем [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: добавить новую фичу
fix: исправить баг
docs: обновить документацию
refactor: рефакторинг кода
test: добавить тесты
chore: обновить зависимости
```

### Примеры

```bash
git commit -m "feat: добавить AI-советник"
git commit -m "fix: исправить расчёт дивидендов"
git commit -m "docs: обновить README"
```

---

## 🚀 Деплой

### Production (Ubuntu 24.04)

См. [DEPLOY_UBUNTU.md](./DEPLOY_UBUNTU.md)

**Быстрый деплой:**

```bash
# На сервере
cd /home/karma/karmamarket
git pull origin main
npm run build
pm2 restart all
```

### CI/CD

Автоматический деплой при пуше в `main` ветку через GitHub Actions.

---

## 📊 Версии

| Версия | Дата | Описание |
|--------|------|----------|
| v1.0.0 | 06.03.2026 | Production MVP |
| v0.9.0 | 01.03.2026 | Beta: квесты, стейкинг |
| v0.8.0 | 25.02.2026 | Alpha: торговля акциями |

---

## 🤝 Вклад

1. Fork репозиторий
2. Создай ветку (`git checkout -b feature/amazing-feature`)
3. Закоммить изменения (`git commit -m 'feat: amazing feature'`)
4. Push в ветку (`git push origin feature/amazing-feature`)
5. Открой Pull Request

---

## 📝 License

MIT License — см. [LICENSE](LICENSE) файл.

---

## 📞 Контакты

- **Telegram:** [@yourusername](https://t.me/yourusername)
- **Email:** your@email.com
- **Project:** [KarmaMarket Bot](https://t.me/KarmaMarketBot)

---

## 🙏 Благодарности

- Telegram за платформу Mini Apps
- React сообществу
- Всем контрибьюторам

---

**KarmaMarket — Торгуй кармой, зарабатывай репутацию!** 💎
