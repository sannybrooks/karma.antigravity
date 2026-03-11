/* ===== Экран AI-Советника — Умный анализ портфеля, рынка, рисков ===== */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useTheme } from '../../store/themeStore';
import { Bot, Send, TrendingUp, Wallet, Lock as LockIcon, Zap, Shield, PieChart, ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIMessage {
  role: 'ai' | 'user';
  text: string;
  type?: 'normal' | 'insight' | 'alert' | 'strategy';
}

interface Insight {
  id: string;
  type: 'profit' | 'loss' | 'opportunity' | 'risk' | 'staking' | 'social';
  icon: string;
  title: string;
  text: string;
  priority: 'high' | 'medium' | 'low';
  actionLabel?: string;
}

export function AdvisorScreen() {
  const { user, holdings, shares, trades, referralRecords } = useGameStore();
  const { theme } = useTheme();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [showInsights, setShowInsights] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isPremium = user.premium && user.premiumExpiresAt > Date.now();

  /* ===== Полная аналитика портфеля ===== */
  const analytics = useMemo(() => {
    const positions = holdings.map(h => {
      const share = shares.find(sh => sh.id === h.shareId);
      if (!share) return null;
      const value = share.currentPrice * h.amount;
      const cost = h.avgBuyPrice * h.amount;
      const pnl = value - cost;
      const roi = cost > 0 ? (pnl / cost) * 100 : 0;
      const change24h = ((share.currentPrice - share.price24hAgo) / share.price24hAgo) * 100;
      return { share, holding: h, value, cost, pnl, roi, change24h };
    }).filter(Boolean) as Array<{
      share: typeof shares[0]; holding: typeof holdings[0];
      value: number; cost: number; pnl: number; roi: number; change24h: number;
    }>;

    const totalValue = positions.reduce((s, p) => s + p.value, 0);
    const totalCost = positions.reduce((s, p) => s + p.cost, 0);
    const totalPnl = totalValue - totalCost;
    const totalRoi = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

    const sorted = [...positions].sort((a, b) => b.pnl - a.pnl);
    const best = sorted[0] || null;
    const worst = sorted[sorted.length - 1] || null;

    const maxConcentration = positions.reduce((max, p) => {
      const pct = totalValue > 0 ? (p.value / totalValue) * 100 : 0;
      return Math.max(max, pct);
    }, 0);

    const marketTrends = shares.map(s => ({
      ...s,
      change24h: ((s.currentPrice - s.price24hAgo) / s.price24hAgo) * 100
    })).sort((a, b) => b.change24h - a.change24h);

    const hotShares = marketTrends.filter(s => s.change24h > 5);
    const coldShares = marketTrends.filter(s => s.change24h < -5);
    const topGainers = marketTrends.slice(0, 3);
    const topLosers = marketTrends.slice(-3).reverse();

    const undervalued = shares
      .map(s => ({ ...s, karmaPerPrice: s.karma / Math.max(s.currentPrice, 1) }))
      .sort((a, b) => b.karmaPerPrice - a.karmaPerPrice)
      .slice(0, 3);

    const todayTrades = trades.filter(t => Date.now() - t.timestamp < 86400000);
    const weekTrades = trades.filter(t => Date.now() - t.timestamp < 7 * 86400000);
    const avgTradeSize = todayTrades.length > 0
      ? todayTrades.reduce((s, t) => s + t.price * t.amount, 0) / todayTrades.length : 0;

    const dailyDivEstimate = positions.reduce((s, p) => {
      return s + p.value * 0.03 / 365;
    }, 0);

    const freeBalance = user.balance;
    const totalWealth = freeBalance + totalValue + user.staked;
    const liquidityRatio = totalWealth > 0 ? (freeBalance / totalWealth) * 100 : 100;

    return {
      positions, totalValue, totalCost, totalPnl, totalRoi,
      best, worst, maxConcentration,
      hotShares, coldShares, topGainers, topLosers, undervalued,
      todayTrades: todayTrades.length, weekTrades: weekTrades.length, avgTradeSize,
      dailyDivEstimate, freeBalance, totalWealth, liquidityRatio
    };
  }, [holdings, shares, trades, user.balance, user.staked]);

  /* ===== Генерация автоматических инсайтов ===== */
  const generateInsights = useCallback((): Insight[] => {
    const result: Insight[] = [];

    analytics.positions.filter(p => p.roi > 20).forEach(p => {
      result.push({
        id: `profit_${p.share.id}`, type: 'profit', icon: '📈',
        title: `@${p.share.username} +${p.roi.toFixed(0)}%`,
        text: `Прибыль ${p.pnl.toFixed(0)} $K. Рассмотрите частичную фиксацию.`,
        priority: p.roi > 50 ? 'high' : 'medium', actionLabel: 'Подробнее'
      });
    });

    analytics.positions.filter(p => p.roi < -15).forEach(p => {
      result.push({
        id: `loss_${p.share.id}`, type: 'loss', icon: '📉',
        title: `@${p.share.username} ${p.roi.toFixed(0)}%`,
        text: `Убыток ${Math.abs(p.pnl).toFixed(0)} $K. Усреднить или зафиксировать?`,
        priority: p.roi < -30 ? 'high' : 'medium', actionLabel: 'Совет'
      });
    });

    analytics.undervalued.forEach(s => {
      if (!holdings.some(h => h.shareId === s.id)) {
        result.push({
          id: `opp_${s.id}`, type: 'opportunity', icon: '💎',
          title: `@${s.username} — недооценён`,
          text: `Карма ${s.karma}, цена ${s.currentPrice.toFixed(0)} $K. Высокий потенциал.`,
          priority: 'medium', actionLabel: 'Анализ'
        });
      }
    });

    if (analytics.maxConcentration > 40 && holdings.length > 1) {
      result.push({
        id: 'risk_concentration', type: 'risk', icon: '⚠️',
        title: 'Высокая концентрация',
        text: `${analytics.maxConcentration.toFixed(0)}% портфеля в одном активе.`,
        priority: 'high', actionLabel: 'Подробнее'
      });
    }

    if (holdings.length < 3 && holdings.length > 0) {
      result.push({
        id: 'risk_diversification', type: 'risk', icon: '🔀',
        title: 'Мало позиций',
        text: `Только ${holdings.length} акций. Рекомендуется 5+ для снижения рисков.`,
        priority: 'medium', actionLabel: 'Что купить?'
      });
    }

    if (user.staked < user.balance * 0.15 && user.balance > 100) {
      result.push({
        id: 'staking_low', type: 'staking', icon: '🏦',
        title: 'Увеличьте стейкинг',
        text: `Застейкано ${user.staked.toFixed(0)} из ${user.balance.toFixed(0)} $K. Рекомендация: 20-40%.`,
        priority: 'low', actionLabel: 'Расчёт'
      });
    }

    if (!user.poolId) {
      result.push({
        id: 'social_squad', type: 'social', icon: '👥',
        title: 'Вступите в пул',
        text: 'Пул даёт +20% к дивидендам и совместные квесты.',
        priority: 'medium', actionLabel: 'Подробнее'
      });
    }

    if (analytics.liquidityRatio > 60 && user.balance > 500) {
      result.push({
        id: 'idle_balance', type: 'opportunity', icon: '💤',
        title: 'Деньги простаивают',
        text: `${analytics.liquidityRatio.toFixed(0)}% средств не работают. Инвестируйте!`,
        priority: 'medium', actionLabel: 'Стратегия'
      });
    }

    if (analytics.hotShares.length >= 3) {
      result.push({
        id: 'market_hot', type: 'opportunity', icon: '🔥',
        title: `${analytics.hotShares.length} акций растут`,
        text: `Бычий рынок! Топ: ${analytics.topGainers.slice(0, 2).map(s => `@${s.username}`).join(', ')}`,
        priority: 'low', actionLabel: 'Обзор'
      });
    }

    if (referralRecords.length === 0) {
      result.push({
        id: 'social_referral', type: 'social', icon: '🤝',
        title: 'Приглашайте друзей',
        text: '5% от трейдов и дивидендов рефералов — постоянный доход.',
        priority: 'low', actionLabel: 'Подробнее'
      });
    }

    return result.sort((a, b) => {
      const p = { high: 0, medium: 1, low: 2 };
      return p[a.priority] - p[b.priority];
    }).slice(0, 5);
  }, [analytics, holdings, user, referralRecords]);

  /* ===== Умный генератор ответов ===== */
  const generateSmartResponse = useCallback((question: string): string => {
    const q = question.toLowerCase();

    if (q.includes('купить') || q.includes('buy') || q.includes('что купить')) {
      const notOwned = shares
        .filter(s => !holdings.some(h => h.shareId === s.id))
        .map(s => ({
          ...s,
          score: s.karma * 0.4 + s.hypeModifier * 10 + ((s.currentPrice - s.price24hAgo) / s.price24hAgo * 100) * 0.3,
          change: ((s.currentPrice - s.price24hAgo) / s.price24hAgo * 100)
        }))
        .sort((a, b) => b.score - a.score);

      const owned = holdings.map(h => {
        const s = shares.find(sh => sh.id === h.shareId);
        return s ? { ...s, change: ((s.currentPrice - s.price24hAgo) / s.price24hAgo * 100) } : null;
      }).filter(Boolean);

      let response = '📊 РЕКОМЕНДАЦИИ К ПОКУПКЕ\n\n';
      if (notOwned.length > 0) {
        response += '🆕 Новые позиции:\n';
        notOwned.slice(0, 3).forEach((s, i) => {
          response += `${i + 1}. @${s.username} — ${s.currentPrice.toFixed(0)} $K`;
          response += ` | карма ${s.karma} | 24ч: ${s.change >= 0 ? '+' : ''}${s.change.toFixed(1)}%\n`;
        });
      }
      const toDCA = (owned as any[]).filter(s => s && s.change < -5);
      if (toDCA.length > 0) {
        response += '\n📉 Усреднение (DCA):\n';
        toDCA.slice(0, 2).forEach((s: any) => {
          response += `• @${s.username} упал ${s.change.toFixed(1)}% — хорошая цена для докупки\n`;
        });
      }
      response += `\n💰 Свободный баланс: ${user.balance.toFixed(0)} $K`;
      response += `\n💡 Совет: не вкладывайте >30% баланса в одну акцию`;
      return response;
    }

    if (q.includes('продать') || q.includes('sell') || q.includes('что продать')) {
      let response = '📊 АНАЛИЗ ПОЗИЦИЙ ДЛЯ ПРОДАЖИ\n\n';
      const profitable = analytics.positions.filter(p => p.roi > 15);
      const losing = analytics.positions.filter(p => p.roi < -10);
      const stagnant = analytics.positions.filter(p => Math.abs(p.roi) < 3 && Math.abs(p.change24h) < 2);

      if (profitable.length > 0) {
        response += '✅ Зафиксировать прибыль:\n';
        profitable.forEach(p => {
          response += `• @${p.share.username}: +${p.roi.toFixed(1)}% (+${p.pnl.toFixed(0)} $K) — продайте 50%\n`;
        });
      }
      if (losing.length > 0) {
        response += '\n⚠️ Зафиксировать убыток:\n';
        losing.forEach(p => {
          response += `• @${p.share.username}: ${p.roi.toFixed(1)}% (${p.pnl.toFixed(0)} $K)`;
          response += p.change24h < -10 ? ' — ПРОДАТЬ\n' : ' — подождать\n';
        });
      }
      if (stagnant.length > 0) {
        response += '\n😴 Застой:\n';
        stagnant.forEach(p => {
          response += `• @${p.share.username}: ${p.roi.toFixed(1)}% — переложить?\n`;
        });
      }
      if (profitable.length === 0 && losing.length === 0) {
        response += '✅ Все позиции в нормальном диапазоне. Держите!';
      }
      return response;
    }

    if (q.includes('портфел') || q.includes('portfolio') || q.includes('обзор')) {
      let response = '📊 ПОЛНЫЙ АНАЛИЗ ПОРТФЕЛЯ\n\n';
      response += `💼 Стоимость: ${analytics.totalValue.toFixed(0)} $K\n`;
      response += `📈 PNL: ${analytics.totalPnl >= 0 ? '+' : ''}${analytics.totalPnl.toFixed(0)} $K (${analytics.totalRoi.toFixed(1)}%)\n`;
      response += `📊 Позиций: ${holdings.length}\n`;
      response += `💰 Свободно: ${analytics.freeBalance.toFixed(0)} $K\n`;
      response += `🔒 Стейкинг: ${user.staked.toFixed(0)} $K\n`;
      response += `🏦 Состояние: ${analytics.totalWealth.toFixed(0)} $K\n\n`;
      if (analytics.best) response += `🏆 Лучший: @${analytics.best.share.username} (+${analytics.best.roi.toFixed(1)}%)\n`;
      if (analytics.worst && analytics.worst.pnl < 0) response += `📉 Худший: @${analytics.worst.share.username} (${analytics.worst.roi.toFixed(1)}%)\n`;
      response += `\n📐 Концентрация: ${analytics.maxConcentration.toFixed(0)}%${analytics.maxConcentration > 40 ? ' ⚠️' : ' ✅'}`;
      response += `\n💧 Ликвидность: ${analytics.liquidityRatio.toFixed(0)}%${analytics.liquidityRatio > 60 ? ' ⚠️' : ' ✅'}`;
      response += `\n💰 Дивиденды/день: ~${analytics.dailyDivEstimate.toFixed(1)} $K`;
      let health = 0;
      if (holdings.length >= 3) health += 25;
      if (analytics.maxConcentration < 40) health += 25;
      if (analytics.totalPnl >= 0) health += 25;
      if (user.staked > 0) health += 15;
      if (user.poolId) health += 10;
      response += `\n\n❤️ Здоровье: ${health}% ${health >= 80 ? 'Отлично!' : health >= 50 ? 'Неплохо' : 'Нужны улучшения'}`;
      return response;
    }

    if (q.includes('стейк') || q.includes('stake') || q.includes('стейкинг')) {
      const apy = isPremium ? 17.5 : 11.5;
      const dailyRate = apy / 365;
      const dailyIncome = user.staked * dailyRate / 100;
      const monthlyIncome = dailyIncome * 30;
      const yearlyIncome = user.staked * apy / 100;
      const optimalStake = (user.balance + user.staked) * 0.3;

      let response = '🔒 АНАЛИЗ СТЕЙКИНГА\n\n';
      response += `📊 Застейкано: ${user.staked.toFixed(0)} $K\n`;
      response += `📈 APY: ${apy.toFixed(1)}% ${isPremium ? '(Premium +5%)' : ''}\n`;
      response += `💰 Доход/день: ${dailyIncome.toFixed(2)} $K\n`;
      response += `💰 Доход/месяц: ${monthlyIncome.toFixed(1)} $K\n`;
      response += `💰 Доход/год: ${yearlyIncome.toFixed(0)} $K\n\n`;
      if (user.staked < optimalStake * 0.5) {
        response += `⚡ Увеличьте стейк до ${optimalStake.toFixed(0)} $K\n`;
      } else {
        response += '✅ Хороший уровень стейкинга!\n';
      }
      response += `\n⚠️ Кулдаун: 7 дней | Штраф: 1%`;
      return response;
    }

    if (q.includes('риск') || q.includes('risk') || q.includes('безопасн')) {
      let response = '🛡️ АНАЛИЗ РИСКОВ\n\n';
      const divScore = holdings.length >= 5 ? '✅ Отлично' : holdings.length >= 3 ? '⚡ Средне' : '⚠️ Низкая';
      response += `📊 Диверсификация: ${holdings.length} позиций — ${divScore}\n`;
      response += `📐 Концентрация: ${analytics.maxConcentration.toFixed(0)}%${analytics.maxConcentration > 40 ? ' ⚠️' : ' ✅'}\n`;
      const avgVolatility = analytics.positions.reduce((s, p) => s + Math.abs(p.change24h), 0) / Math.max(analytics.positions.length, 1);
      response += `📉 Волатильность: ${avgVolatility.toFixed(1)}%${avgVolatility > 15 ? ' ⚠️' : ' ✅'}\n`;
      const losers = analytics.positions.filter(p => p.roi < -10);
      response += `📛 Убыточных (>10%): ${losers.length}\n`;
      response += `💧 Свободные: ${analytics.liquidityRatio.toFixed(0)}%${analytics.liquidityRatio < 10 ? ' ⚠️' : ' ✅'}\n`;
      let riskScore = 0;
      if (holdings.length < 3) riskScore += 30;
      if (analytics.maxConcentration > 40) riskScore += 25;
      if (avgVolatility > 15) riskScore += 15;
      if (losers.length > 2) riskScore += 20;
      if (analytics.liquidityRatio < 10) riskScore += 10;
      response += `\n⚡ Риск: ${riskScore}% ${riskScore > 50 ? '🔴 ВЫСОКИЙ' : riskScore > 25 ? '🟡 СРЕДНИЙ' : '🟢 НИЗКИЙ'}`;
      return response;
    }

    if (q.includes('дивиденд') || q.includes('dividend') || q.includes('пассив')) {
      let response = '💰 АНАЛИЗ ДИВИДЕНДОВ\n\n';
      const eligible = holdings.filter(h => Date.now() - h.boughtAt >= 86400000);
      response += `📊 С дивидендами (>24ч): ${eligible.length}/${holdings.length}\n`;
      response += `💰 Доход/день: ~${analytics.dailyDivEstimate.toFixed(1)} $K\n`;
      response += `💰 Доход/месяц: ~${(analytics.dailyDivEstimate * 30).toFixed(0)} $K\n\n`;
      if (holdings.length > 0) {
        response += 'По позициям:\n';
        analytics.positions.slice(0, 5).forEach(p => {
          const dailyDiv = p.value * 0.03 / 365;
          response += `• @${p.share.username}: ~${dailyDiv.toFixed(2)} $K/день\n`;
        });
      }
      const totalMulti = (isPremium ? 1.25 : 1) * (user.poolId ? 1.2 : 1);
      response += `\n🔥 Множитель: x${totalMulti.toFixed(2)}`;
      response += `\n💰 Реальный доход: ~${(analytics.dailyDivEstimate * totalMulti).toFixed(1)} $K/день`;
      return response;
    }

    if (q.includes('тренд') || q.includes('trend') || q.includes('рынок')) {
      let response = '📈 ОБЗОР РЫНКА\n\n';
      response += `�� Растущие:\n`;
      analytics.topGainers.forEach((s, i) => {
        response += `${i + 1}. @${s.username}: +${s.change24h.toFixed(1)}% | ${s.currentPrice.toFixed(0)} $K\n`;
      });
      response += `\n❄️ Падающие:\n`;
      analytics.topLosers.forEach((s, i) => {
        response += `${i + 1}. @${s.username}: ${s.change24h.toFixed(1)}% | ${s.currentPrice.toFixed(0)} $K\n`;
      });
      response += `\n💎 Недооценённые:\n`;
      analytics.undervalued.slice(0, 3).forEach(s => {
        response += `• @${s.username}: карма ${s.karma}, цена ${s.currentPrice.toFixed(0)} $K\n`;
      });
      const bullish = analytics.hotShares.length > analytics.coldShares.length;
      response += `\n📊 ${bullish ? '📈 Бычий тренд' : '📉 Медвежий тренд'}`;
      return response;
    }

    if (q.includes('стратег') || q.includes('strategy') || q.includes('план') || q.includes('совет')) {
      const wealth = analytics.totalWealth;
      let tier = '';
      let tips: string[] = [];
      if (wealth < 500) {
        tier = '🌱 Новичок';
        tips = ['Купите 3-5 акций', 'Выполняйте квесты', 'Бустайте друзей', 'Вступите в пул', 'Приглашайте друзей'];
      } else if (wealth < 2000) {
        tier = '📈 Трейдер';
        tips = ['Застейкайте 25-30%', 'Фиксируйте >20%', 'Диверсификация 5-7 позиций', 'Ищите недооценённые', 'Усредняйте при -10%'];
      } else {
        tier = '🐋 Кит';
        tips = ['40% акции, 35% стейк, 25% свободные', 'Лимитные ордера', 'Реферальная сеть', 'VIP акции Premium', 'Лидер пула +25%'];
      }
      let response = `🎯 СТРАТЕГИЯ\n\nПрофиль: ${tier}\nСостояние: ${wealth.toFixed(0)} $K\n\nПлан:\n`;
      tips.forEach((t, i) => { response += `${i + 1}. ${t}\n`; });
      response += `\nЕжедневно:\n□ Забрать дивиденды\n□ 5 квестов\n□ Бустнуть друзей\n□ Проверить позиции`;
      return response;
    }

    if (q.includes('прогноз') || q.includes('forecast')) {
      let response = '🔮 ПРОГНОЗ 24Ч\n\n';
      analytics.positions.forEach(p => {
        const momentum = p.change24h;
        const prediction = momentum > 5 ? '📈 Рост' : momentum < -5 ? '📉 Коррекция' : '➡️ Боковик';
        response += `@${p.share.username}: ${prediction} (${momentum >= 0 ? '+' : ''}${momentum.toFixed(1)}%)\n`;
      });
      if (analytics.positions.length === 0) response += 'Нет позиций. Купите акции!';
      response += '\n⚠️ Прогнозы не гарантируют результат.';
      return response;
    }

    if (q.includes('алерт') || q.includes('alert') || q.includes('предупрежд')) {
      let response = '🚨 АЛЕРТЫ\n\n';
      let count = 0;
      analytics.positions.filter(p => p.roi < -20).forEach(p => {
        response += `🔴 @${p.share.username} ${p.roi.toFixed(1)}% — продавайте\n`; count++;
      });
      analytics.positions.filter(p => p.roi > 30).forEach(p => {
        response += `🟡 @${p.share.username} +${p.roi.toFixed(1)}% — фиксируйте\n`; count++;
      });
      if (analytics.liquidityRatio < 5) { response += '🔴 Ликвидность <5%\n'; count++; }
      if (analytics.maxConcentration > 50) { response += `🟡 Концентрация ${analytics.maxConcentration.toFixed(0)}%\n`; count++; }
      if (count === 0) response += '✅ Всё в порядке!';
      return response;
    }

    if (q.includes('реферал') || q.includes('referral') || q.includes('пригласить')) {
      let response = '🤝 РЕФЕРАЛЫ\n\n';
      response += `👥 Рефералов: ${referralRecords.length}\n`;
      response += `💰 Доход: ${user.referralTotalEarnings.toFixed(0)} $K\n\n`;
      response += `Ставки: 5% трейды, 5% дивиденды, 2% суб-рефералы\n`;
      if (referralRecords.length > 0) {
        const avg = user.referralTotalEarnings / referralRecords.length;
        response += `\nСредний: ${avg.toFixed(0)} $K/реферал`;
      } else {
        response += '\n💡 Пригласите 5 друзей = ~50-100 $K/день пассивно!';
      }
      return response;
    }

    if (q.includes('premium') || q.includes('преми')) {
      let response = '👑 PREMIUM\n\n';
      if (isPremium) {
        response += '✅ Premium активен!\n\nВаши бонусы:\n';
        response += '• +25% дивиденды\n• Безлимит трейдов\n• RSI/MA графики\n• VIP акции\n';
        response += '• AI-советник\n• Создание пулов\n• APY 15-20%\n• x2 награды квестов';
      } else {
        response += '❌ Не активен\n\n500 $KARMA/мес:\n';
        response += '• +25% дивиденды\n• Безлимит трейдов\n• Advanced графики\n';
        response += '• VIP маркет\n• AI-советник\n• Создание пулов';
      }
      return response;
    }

    // Общий ответ
    const tips = [
      `Портфель: ${analytics.totalValue.toFixed(0)} $K (${analytics.totalPnl >= 0 ? '+' : ''}${analytics.totalPnl.toFixed(0)} PNL)`,
      `Пассивный доход: ~${analytics.dailyDivEstimate.toFixed(1)} $K/день`,
      `На рынке ${analytics.hotShares.length} растущих акций`,
      `Карма ${user.karma}, уровень ${user.level}`,
    ];
    return '💡 ' + tips[Math.floor(Math.random() * tips.length)] + '\n\nЗадайте конкретный вопрос: "что купить", "риски", "стратегия" и т.д.';
  }, [shares, holdings, user, analytics, isPremium, referralRecords]);

  /* Инициализация */
  useEffect(() => {
    if (messages.length === 0 && isPremium) {
      const greeting: AIMessage[] = [
        { role: 'ai', text: `👋 Привет, @${user.username}! Я ваш AI-советник.`, type: 'normal' },
        { role: 'ai', text: `📊 Портфель: ${analytics.totalValue.toFixed(0)} $K | PNL: ${analytics.totalPnl >= 0 ? '+' : ''}${analytics.totalPnl.toFixed(0)} $K | ${holdings.length} позиций`, type: 'normal' },
      ];
      if (holdings.length === 0) {
        greeting.push({ role: 'ai', text: '📌 Портфель пуст. Купите 3-5 акций на маркете!', type: 'strategy' });
      } else if (analytics.totalPnl < 0) {
        greeting.push({ role: 'ai', text: `⚠️ Портфель в минусе (${analytics.totalPnl.toFixed(0)} $K). Спросите "что продать?"`, type: 'alert' });
      } else {
        greeting.push({ role: 'ai', text: `✅ Портфель в плюсе! Спросите "стратегия" для плана действий.`, type: 'insight' });
      }
      greeting.push({ role: 'ai', text: '💬 Выберите тему ниже или задайте вопрос!', type: 'normal' });
      setMessages(greeting);
      setInsights(generateInsights());
    }
  }, [isPremium]); // eslint-disable-line

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = useCallback(() => {
    if (!input.trim() || typing) return;
    const question = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: question, type: 'normal' }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const response = generateSmartResponse(question);
      setMessages(prev => [...prev, { role: 'ai', text: response, type: 'normal' }]);
      setTyping(false);
    }, 800 + Math.random() * 1200);
  }, [input, typing, generateSmartResponse]);

  const handleInsightClick = useCallback((insight: Insight) => {
    setMessages(prev => [...prev, { role: 'user', text: insight.title, type: 'normal' }]);
    setTyping(true);
    setTimeout(() => {
      let response = '';
      switch (insight.type) {
        case 'profit': response = generateSmartResponse('что продать'); break;
        case 'loss': response = generateSmartResponse('риски'); break;
        case 'opportunity': response = generateSmartResponse('что купить'); break;
        case 'risk': response = generateSmartResponse('риски'); break;
        case 'staking': response = generateSmartResponse('стейкинг'); break;
        case 'social': response = generateSmartResponse('реферал'); break;
        default: response = generateSmartResponse('стратегия');
      }
      setMessages(prev => [...prev, { role: 'ai', text: response, type: 'insight' }]);
      setTyping(false);
      setShowInsights(false);
    }, 600 + Math.random() * 800);
  }, [generateSmartResponse]);

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

  const insightColors: Record<string, string> = {
    profit: '#00FF7F', loss: '#FF4444', opportunity: '#4488FF',
    risk: '#FFD700', staking: '#9966FF', social: '#FF69B4',
  };

  if (!isPremium) {
    return (
      <div className="px-4 pb-4 flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
          style={{ backgroundColor: theme.inputBg }}>
          <LockIcon size={36} style={{ color: theme.textMuted }} />
        </motion.div>
        <h2 className="text-lg font-bold mb-2" style={{ color: theme.textPrimary }}>AI-Советник</h2>
        <p className="text-sm text-center mb-4" style={{ color: theme.textSecondary }}>
          Персональные рекомендации, анализ рисков и стратегии. Доступно только с Premium.
        </p>
        {/* Стеклянная карточка с промо Premium */}
        <div className="rounded-xl p-3 w-full glass-card" style={{ backgroundColor: theme.inputBg }}>
          <p className="text-xs text-center" style={{ color: theme.textMuted }}>
            👑 Premium: 500 $KARMA/мес — AI-советник, +25% дивиденды, безлимит трейдов
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 pb-3 flex flex-col" style={{ minHeight: 'calc(100vh - 140px)' }}>
      {/* Аналитические карточки */}
      <div className="grid grid-cols-4 gap-1.5 mb-2">
        {[
          { icon: <Wallet size={12} />, label: 'Портфель', value: `${analytics.totalValue.toFixed(0)}`, color: theme.accent },
          { icon: <TrendingUp size={12} />, label: 'PNL', value: `${analytics.totalPnl >= 0 ? '+' : ''}${analytics.totalPnl.toFixed(0)}`, color: analytics.totalPnl >= 0 ? theme.accent : theme.danger },
          { icon: <PieChart size={12} />, label: 'Позиции', value: `${holdings.length}`, color: theme.accentGold },
          { icon: <Shield size={12} />, label: 'Стейк', value: `${user.staked.toFixed(0)}`, color: '#9966FF' },
        ].map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-lg p-2 text-center glass-card" style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.bgCardBorder}` }}>
            <div className="flex justify-center mb-0.5" style={{ color: card.color }}>{card.icon}</div>
            <p className="text-[9px]" style={{ color: theme.textMuted }}>{card.label}</p>
            <p className="text-xs font-bold" style={{ color: card.color }}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Кнопка показать/скрыть инсайты */}
      {insights.length > 0 && (
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={() => setShowInsights(!showInsights)}
          className="w-full rounded-xl px-3 py-2 mb-2 flex items-center justify-between active:scale-[0.98] transition-transform glass-card"
          style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.bgCardBorder}` }}>
          <div className="flex items-center gap-2">
            <Zap size={14} style={{ color: theme.accentGold }} />
            <span className="text-xs font-bold" style={{ color: theme.textPrimary }}>
              Инсайты
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
              style={{ backgroundColor: theme.accentGold + '20', color: theme.accentGold }}>
              {insights.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px]" style={{ color: theme.textMuted }}>
              {showInsights ? 'Скрыть' : 'Показать'}
            </span>
            {showInsights ? <ChevronUp size={14} style={{ color: theme.textMuted }} /> : <ChevronDown size={14} style={{ color: theme.textMuted }} />}
          </div>
        </motion.button>
      )}

      {/* Список инсайтов (скрыт по умолчанию) */}
      <AnimatePresence>
        {showInsights && insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2 space-y-1 overflow-hidden">
            {insights.map((insight, i) => (
              <motion.button key={insight.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => handleInsightClick(insight)}
                className="w-full rounded-lg p-2 flex items-start gap-2 text-left active:scale-[0.98] transition-transform"
                style={{
                  backgroundColor: (insightColors[insight.type] || theme.accent) + '10',
                  border: `1px solid ${(insightColors[insight.type] || theme.accent)}20`,
                }}>
                <span className="text-sm mt-0.5">{insight.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold truncate" style={{ color: theme.textPrimary }}>{insight.title}</span>
                    <span className="text-[8px] px-1 rounded-full shrink-0" style={{
                      backgroundColor: insight.priority === 'high' ? '#FF444430' : insight.priority === 'medium' ? '#FFD70030' : '#00FF7F30',
                      color: insight.priority === 'high' ? '#FF4444' : insight.priority === 'medium' ? '#FFD700' : '#00FF7F',
                    }}>
                      {insight.priority === 'high' ? '🔴' : insight.priority === 'medium' ? '🟡' : '🟢'}
                    </span>
                  </div>
                  <p className="text-[10px] mt-0.5" style={{ color: theme.textSecondary }}>{insight.text}</p>
                </div>
                <ArrowUpRight size={12} style={{ color: theme.textMuted }} className="shrink-0 mt-1" />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Чат */}
      <div className="flex-1 rounded-2xl overflow-hidden flex flex-col glass-card"
        style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.bgCardBorder}` }}>

        {/* Хэдер чата */}
        <div className="px-3 py-2 flex items-center gap-2"
          style={{ borderBottom: `1px solid ${theme.bgCardBorder}`, background: 'linear-gradient(135deg, #F9731608, #FFD70008)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #F97316, #FFD700)' }}>
            <Bot size={14} className="text-white" />
          </div>
          <div>
            <p className="text-[11px] font-bold" style={{ color: theme.textPrimary }}>AI-Советник</p>
            <p className="text-[8px]" style={{ color: theme.textMuted }}>Анализ • Стратегии • Прогнозы</p>
          </div>
          <span className="ml-auto px-1.5 py-0.5 rounded-full text-[8px] font-bold"
            style={{ backgroundColor: '#FFD70020', color: '#FFD700' }}>PRO</span>
        </div>

        {/* Сообщения */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2 scrollbar-hide" style={{ maxHeight: '35vh', minHeight: '180px' }}>
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[88%] rounded-2xl px-3 py-2 text-[11px] whitespace-pre-line leading-relaxed"
                  style={{
                    backgroundColor: msg.role === 'user' ? theme.accent + '20' : theme.inputBg,
                    color: msg.role === 'user' ? theme.accent : theme.textPrimary,
                    borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                    borderBottomLeftRadius: msg.role === 'ai' ? 4 : 16,
                  }}>
                  {msg.role === 'ai' && <span className="text-[10px] mr-1">🤖</span>}
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {typing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="rounded-2xl px-4 py-2 text-xs flex items-center gap-2"
                style={{ backgroundColor: theme.inputBg, color: theme.textMuted }}>
                <span>🤖</span>
                <span className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: theme.accent, animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: theme.accent, animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: theme.accent, animationDelay: '300ms' }} />
                </span>
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Быстрые вопросы */}
        <div className="px-2.5 py-1.5 flex gap-1 overflow-x-auto scrollbar-hide"
          style={{ borderTop: `1px solid ${theme.bgCardBorder}` }}>
          {quickQuestions.map(qq => (
            <motion.button key={qq.label}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                if (typing) return;
                setMessages(prev => [...prev, { role: 'user', text: qq.query, type: 'normal' }]);
                setTyping(true);
                setTimeout(() => {
                  const resp = generateSmartResponse(qq.query);
                  setMessages(prev => [...prev, { role: 'ai', text: resp, type: 'normal' }]);
                  setTyping(false);
                }, 600 + Math.random() * 800);
              }}
              className="shrink-0 px-2 py-1 rounded-lg text-[9px] font-medium transition-all"
              style={{ backgroundColor: theme.inputBg, color: theme.textMuted }}>
              {qq.label}
            </motion.button>
          ))}
        </div>

        {/* Ввод */}
        <div className="p-2.5 flex gap-2" style={{ borderTop: `1px solid ${theme.bgCardBorder}` }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            placeholder="Задайте вопрос AI..."
            className="flex-1 rounded-xl px-3 py-2 text-[11px] outline-none"
            style={{ backgroundColor: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.textPrimary }}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!input.trim() || typing}
            className="px-3 rounded-xl transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #F97316, #FFD700)', color: '#fff' }}>
            <Send size={14} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
