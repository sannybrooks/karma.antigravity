/* ===== Экран Портфолио — Моя акция с графиком, позиции, PNL, Подробный отчёт ===== */
import { useMemo, useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { useTheme } from '../../store/themeStore';
import { FullChart, MiniChart } from '../MiniChart';
import { TrendingUp, TrendingDown, Wallet, ChevronDown, ChevronUp, Rocket, Crown, Users, FileText, BarChart3 } from 'lucide-react';
import type { PricePoint, User, Share, Holding, Trade } from '../../types';

/* === Подробный отчёт с раскрытием подробностей === */
function DailyReport({ user, holdings, shares, trades, isPremium, theme }: {
  user: User; holdings: Holding[]; shares: Share[]; trades: Trade[]; isPremium: boolean; theme: any;
}) {
  const [showDetails, setShowDetails] = useState(false);

  // Статистика за сегодня
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayMs = todayStart.getTime();

  const todayTrades = trades.filter(t => t.timestamp >= todayMs);
  const todayBuys = todayTrades.filter(t => t.side === 'buy');
  const todaySells = todayTrades.filter(t => t.side === 'sell');
  const todayVolume = todayTrades.reduce((s, t) => s + t.price * t.amount, 0);
  const todayFees = todayTrades.reduce((s, t) => s + t.fee, 0);
  const todayPNL = todaySells.reduce((s, t) => s + (t.price * t.amount - t.fee), 0) - todayBuys.reduce((s, t) => s + (t.price * t.amount + t.fee), 0);

  // Портфель
  const totalPortfolioValue = holdings.reduce((s, h) => {
    const share = shares.find(sh => sh.id === h.shareId);
    return s + (share ? share.currentPrice * h.amount : 0);
  }, 0);
  const totalUnrealizedPNL = holdings.reduce((s, h) => {
    const share = shares.find(sh => sh.id === h.shareId);
    return s + (share ? (share.currentPrice - h.avgBuyPrice) * h.amount : 0);
  }, 0);

  // Лучшая и худшая позиция
  const positionsWithPNL = holdings.map(h => {
    const share = shares.find(sh => sh.id === h.shareId);
    const pnl = share ? (share.currentPrice - h.avgBuyPrice) * h.amount : 0;
    const roi = h.avgBuyPrice > 0 ? ((share?.currentPrice ?? 0) - h.avgBuyPrice) / h.avgBuyPrice * 100 : 0;
    return { ...h, share, pnl, roi };
  }).sort((a, b) => b.pnl - a.pnl);

  const bestPosition = positionsWithPNL[0];
  const worstPosition = positionsWithPNL[positionsWithPNL.length - 1];

  return (
    <div className="rounded-2xl p-4 transition-colors glass-card"
      style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.bgCardBorder}` }}>
      {/* Стеклянная карточка ежедневного отчета (ключевой блок) */}
      <div className="flex items-center gap-2 mb-3">
        <FileText size={16} style={{ color: theme.accent }} />
        <span className="font-semibold text-sm" style={{ color: theme.textPrimary }}>Подробный отчёт</span>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: theme.accent + '15', color: theme.accent }}>
          {new Date().toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
        </span>
      </div>

      {/* Краткая сводка — всегда видна */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: 'Трейдов', value: todayTrades.length, color: theme.textPrimary },
          { label: 'Объём', value: `${todayVolume.toFixed(0)} $K`, color: theme.accent },
          { label: 'Комиссии', value: `${todayFees.toFixed(1)} $K`, color: theme.danger },
        ].map((s, i) => (
          <div key={i} className="rounded-lg py-2 text-center" style={{ backgroundColor: theme.inputBg }}>
            <p className="text-[9px]" style={{ color: theme.textMuted }}>{s.label}</p>
            <p className="font-bold text-xs" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Кнопка «Подробнее» */}
      <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowDetails(!showDetails)}
        className="w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
        style={{ backgroundColor: theme.accent + '12', color: theme.accent }}>
        <BarChart3 size={14} />
        {showDetails ? 'Скрыть' : 'Подробнее'}
        {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </motion.button>

      {/* Подробный отчёт — раскрывается */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden">
            <div className="mt-4 space-y-3">

              {/* PNL за день */}
              <div className="rounded-xl p-3" style={{ backgroundColor: theme.inputBg }}>
                <p className="text-[10px] mb-2" style={{ color: theme.textMuted }}>💹 PNL за сегодня</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold" style={{ color: todayPNL >= 0 ? theme.accent : theme.danger }}>
                      {todayPNL >= 0 ? '+' : ''}{todayPNL.toFixed(2)} $K
                    </p>
                    <p className="text-[9px]" style={{ color: theme.textMuted }}>Реализованный PNL</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: totalUnrealizedPNL >= 0 ? theme.accent : theme.danger }}>
                      {totalUnrealizedPNL >= 0 ? '+' : ''}{totalUnrealizedPNL.toFixed(2)} $K
                    </p>
                    <p className="text-[9px]" style={{ color: theme.textMuted }}>Нереализованный</p>
                  </div>
                </div>
              </div>

              {/* Детали трейдов */}
              <div className="rounded-xl p-3" style={{ backgroundColor: theme.inputBg }}>
                <p className="text-[10px] mb-2" style={{ color: theme.textMuted }}>📊 Детали торговли</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Покупок', value: todayBuys.length, sub: `${todayBuys.reduce((s, t) => s + t.price * t.amount, 0).toFixed(1)} $K`, color: theme.accent },
                    { label: 'Продаж', value: todaySells.length, sub: `${todaySells.reduce((s, t) => s + t.price * t.amount, 0).toFixed(1)} $K`, color: theme.danger },
                    { label: 'Сред. размер', value: todayTrades.length > 0 ? `${(todayVolume / todayTrades.length).toFixed(1)}` : '0', sub: '$K / трейд', color: theme.textPrimary },
                    { label: 'Ребейты', value: `${(todayFees * 0.3).toFixed(1)}`, sub: '$K возврат', color: theme.accentGold },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1" style={{ borderBottom: `1px solid ${theme.bgCardBorder}` }}>
                      <span style={{ color: theme.textMuted }}>{s.label}</span>
                      <div className="text-right">
                        <span className="font-bold" style={{ color: s.color }}>{s.value}</span>
                        <span className="text-[8px] ml-1" style={{ color: theme.textMuted }}>{s.sub}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Портфель */}
              <div className="rounded-xl p-3" style={{ backgroundColor: theme.inputBg }}>
                <p className="text-[10px] mb-2" style={{ color: theme.textMuted }}>💼 Состояние портфеля</p>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>{totalPortfolioValue.toFixed(2)} $K</p>
                    <p className="text-[9px]" style={{ color: theme.textMuted }}>Общая стоимость</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>{holdings.length}</p>
                    <p className="text-[9px]" style={{ color: theme.textMuted }}>Позиций</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: theme.accentGold }}>{user.staked.toFixed(0)} $K</p>
                    <p className="text-[9px]" style={{ color: theme.textMuted }}>Стейкинг</p>
                  </div>
                </div>

                {/* Лучшая / Худшая позиция */}
                {bestPosition && bestPosition.share && (
                  <div className="flex items-center justify-between text-xs py-1.5 rounded-lg px-2 mb-1"
                    style={{ backgroundColor: theme.accent + '08' }}>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">📈</span>
                      <span style={{ color: theme.textSecondary }}>Лучшая: {bestPosition.share.ticker}</span>
                    </div>
                    <span className="font-bold" style={{ color: theme.accent }}>
                      {bestPosition.pnl >= 0 ? '+' : ''}{bestPosition.pnl.toFixed(1)} $K ({bestPosition.roi >= 0 ? '+' : ''}{bestPosition.roi.toFixed(1)}%)
                    </span>
                  </div>
                )}
                {worstPosition && worstPosition.share && worstPosition !== bestPosition && (
                  <div className="flex items-center justify-between text-xs py-1.5 rounded-lg px-2"
                    style={{ backgroundColor: theme.danger + '08' }}>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">📉</span>
                      <span style={{ color: theme.textSecondary }}>Худшая: {worstPosition.share.ticker}</span>
                    </div>
                    <span className="font-bold" style={{ color: theme.danger }}>
                      {worstPosition.pnl >= 0 ? '+' : ''}{worstPosition.pnl.toFixed(1)} $K ({worstPosition.roi >= 0 ? '+' : ''}{worstPosition.roi.toFixed(1)}%)
                    </span>
                  </div>
                )}
              </div>

              {/* Все трейды сегодня */}
              {todayTrades.length > 0 && (
                <div className="rounded-xl p-3" style={{ backgroundColor: theme.inputBg }}>
                  <p className="text-[10px] mb-2" style={{ color: theme.textMuted }}>🕐 Сегодняшние сделки</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {todayTrades.slice(0, 20).map((t, i) => {
                      const share = shares.find(s => s.id === t.shareId);
                      return (
                        <div key={i} className="flex items-center justify-between text-[10px] py-1"
                          style={{ borderBottom: `1px solid ${theme.bgCardBorder}` }}>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold px-1 py-0.5 rounded text-[8px]"
                              style={{
                                backgroundColor: t.side === 'buy' ? theme.accent + '20' : theme.danger + '20',
                                color: t.side === 'buy' ? theme.accent : theme.danger
                              }}>
                              {t.side === 'buy' ? 'BUY' : 'SELL'}
                            </span>
                            <span style={{ color: theme.textSecondary }}>{share?.ticker ?? '???'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span style={{ color: theme.textMuted }}>{t.amount} шт × {t.price.toFixed(1)}</span>
                            <span className="font-bold" style={{ color: theme.textPrimary }}>
                              {(t.price * t.amount).toFixed(1)} $K
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Баланс дня */}
              <div className="rounded-xl p-3 text-center"
                style={{ background: `linear-gradient(135deg, ${theme.accent}10, ${theme.accentGold}10)` }}>
                <p className="text-[10px] mb-1" style={{ color: theme.textMuted }}>Баланс на конец дня</p>
                <p className="text-xl font-bold" style={{ color: theme.textPrimary }}>
                  {user.balance.toFixed(2)} <span className="text-sm" style={{ color: theme.accentGold }}>$KARMA</span>
                </p>
                <div className="flex items-center justify-center gap-3 mt-1">
                  <span className="text-[9px]" style={{ color: theme.textMuted }}>
                    Карма: {user.karma} • Уровень: {user.level}
                  </span>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PortfolioScreen() {
  const { holdings, shares, user, setTradeModal, trades } = useGameStore();
  const { theme } = useTheme();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showMyShareholders, setShowMyShareholders] = useState(false);

  const isPremium = user.premium && user.premiumExpiresAt > Date.now();
  
  const portfolio = useMemo(() => {
    return holdings.map(h => {
      const share = shares.find(s => s.id === h.shareId);
      if (!share) return null;
      const currentValue = share.currentPrice * h.amount;
      const costBasis = h.avgBuyPrice * h.amount;
      const pnl = currentValue - costBasis;
      const roi = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
      return { ...h, share, currentValue, costBasis, pnl, roi };
    }).filter(Boolean) as Array<{
      shareId: string; amount: number; avgBuyPrice: number; boughtAt: number;
      share: typeof shares[0]; currentValue: number; costBasis: number; pnl: number; roi: number;
    }>;
  }, [holdings, shares]);
  
  const totalValue = portfolio.reduce((s, p) => s + p.currentValue, 0);
  const totalPnl = portfolio.reduce((s, p) => s + p.pnl, 0);
  const totalCost = portfolio.reduce((s, p) => s + p.costBasis, 0);
  const totalRoi = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
  
  const mySharePrice = useMemo(() => {
    return Math.max(10, 100 + user.karma * 0.1 + (user.selfBoostLevel * 5));
  }, [user.karma, user.selfBoostLevel]);
  
  const mySharePriceHistory = useMemo((): PricePoint[] => {
    const points: PricePoint[] = [];
    const now = Date.now();
    let price = Math.max(50, mySharePrice - 80 - Math.random() * 40);
    for (let i = 47; i >= 0; i--) {
      const time = now - i * 30 * 60 * 1000;
      const volatility = (Math.random() - 0.42) * price * 0.06;
      const open = price;
      price = Math.max(10, price + volatility);
      const close = price;
      const high = Math.max(open, close) * (1 + Math.random() * 0.02);
      const low = Math.min(open, close) * (1 - Math.random() * 0.02);
      points.push({ time, open, high, low, close });
    }
    points[points.length - 1].close = mySharePrice;
    points[points.length - 1].high = Math.max(points[points.length - 1].high, mySharePrice);
    return points;
  }, [mySharePrice]);
  
  const myShareChange = useMemo(() => {
    if (mySharePriceHistory.length < 2) return 0;
    const first = mySharePriceHistory[0].close;
    return ((mySharePrice - first) / first) * 100;
  }, [mySharePriceHistory, mySharePrice]);
  
  const isMyShareUp = myShareChange >= 0;
  
  const myShareholders = useMemo(() => {
    return shares.slice(0, 5).map(s => ({
      username: s.username,
      avatar: s.avatar,
      amount: 3 + Math.floor(Math.random() * 25),
    }));
  }, [shares]);
  
  const totalMyShares = myShareholders.reduce((s, h) => s + h.amount, 0);
  const selfBoostActive = user.selfBoostExpiry > Date.now();
  
  return (
    <div className="px-4 pb-4 space-y-4">
      {/* ===== Моя акция ===== */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="rounded-2xl overflow-hidden transition-colors glass-card"
        style={{ border: `2px solid ${user.cardColor}40`, background: `linear-gradient(180deg, ${user.cardColor}08, ${theme.bgCard})` }}>
        
        <div className="p-4 pb-2">
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{ backgroundColor: theme.inputBg, border: `2px solid ${user.cardColor}` }}>
              {user.cardBadge}
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base" style={{ color: theme.textPrimary }}>@{user.username}.SHARE</h3>
                {user.premium && <Crown size={12} style={{ color: theme.accentGold }} />}
                {selfBoostActive && <Rocket size={12} style={{ color: theme.accent }} />}
              </div>
              <p className="text-[10px]" style={{ color: theme.textSecondary }}>{user.cardBio}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold" style={{ color: theme.textPrimary }}>${mySharePrice.toFixed(2)}</p>
              <p className="text-xs font-semibold"
                style={{ color: isMyShareUp ? theme.accent : theme.danger }}>
                {isMyShareUp ? '▲' : '▼'} {isMyShareUp ? '+' : ''}{myShareChange.toFixed(1)}%
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { label: 'Карма', value: user.karma.toString(), color: theme.accent },
              { label: 'Уровень', value: `Lvl ${user.level}`, color: theme.accentGold },
              { label: 'Буст', value: selfBoostActive ? `Lvl${user.selfBoostLevel}` : '—', color: selfBoostActive ? theme.accent : theme.textMuted },
              { label: 'Акционеры', value: myShareholders.length.toString(), color: theme.textPrimary },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="rounded-lg py-1.5 text-center" style={{ backgroundColor: theme.inputBg }}>
                <p className="text-[8px]" style={{ color: theme.textMuted }}>{s.label}</p>
                <p className="text-[11px] font-bold" style={{ color: s.color }}>{s.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="px-3 pb-2">
          <FullChart data={mySharePriceHistory} height={110} accentUp={theme.accent} accentDown={theme.danger} />
        </div>
        
        <div className="px-4 pb-3">
          <div className="rounded-xl p-2.5 text-[10px]" style={{ backgroundColor: theme.inputBg }}>
            <p className="font-medium mb-1" style={{ color: theme.textMuted }}>📐 Формула цены</p>
            <p style={{ color: theme.textSecondary }}>
              <span style={{ color: theme.accent }}>Base(100)</span> + 
              <span style={{ color: theme.accentGold }}> Karma({user.karma}) × 0.1</span> + 
              <span style={{ color: theme.textPrimary }}> Boost(+{user.selfBoostLevel * 5})</span> = 
              <span className="font-bold" style={{ color: theme.accent }}> ${mySharePrice.toFixed(2)}</span>
            </p>
          </div>
        </div>
        
        <button onClick={() => setShowMyShareholders(!showMyShareholders)}
          className="w-full py-2.5 border-t flex items-center justify-center gap-2 text-xs transition-colors"
          style={{ borderColor: theme.bgCardBorder, color: theme.accent }}>
          <Users size={13} />
          <span>{showMyShareholders ? 'Скрыть акционеров' : `Кто владеет моей акцией (${myShareholders.length})`}</span>
          {showMyShareholders ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        
        {showMyShareholders && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="px-4 pb-4 space-y-2">
            <ShareholderBar holders={myShareholders} totalShares={totalMyShares} />
            {myShareholders.map((h, i) => {
              const pct = totalMyShares > 0 ? ((h.amount / totalMyShares) * 100).toFixed(1) : '0';
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-2 text-xs rounded-lg px-2 py-1.5"
                  style={{ backgroundColor: theme.inputBg }}>
                  <span className="text-lg">{h.avatar}</span>
                  <span className="flex-1 truncate" style={{ color: theme.textPrimary }}>@{h.username}</span>
                  <span className="font-bold" style={{ color: theme.textPrimary }}>{h.amount} шт</span>
                  <span style={{ color: theme.textMuted }}>{pct}%</span>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>
      
      {/* ===== Сводка портфеля ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl p-4 transition-colors glass-card"
        style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.bgCardBorder}` }}>
        <div className="flex items-center gap-2 mb-3">
          <Wallet size={18} style={{ color: theme.accentGold }} />
          <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>Портфель</span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: theme.inputBg, color: theme.textMuted }}>
            {portfolio.length} позиций
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs" style={{ color: theme.textMuted }}>Общая стоимость</p>
            <p className="text-xl font-bold" style={{ color: theme.textPrimary }}>${totalValue.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: theme.textMuted }}>Баланс $KARMA</p>
            <p className="text-xl font-bold" style={{ color: theme.accentGold }}>{user.balance.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: theme.textMuted }}>PNL 24ч</p>
            <p className="text-lg font-bold flex items-center gap-1" style={{ color: totalPnl >= 0 ? theme.accent : theme.danger }}>
              {totalPnl >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs" style={{ color: theme.textMuted }}>ROI</p>
            <p className="text-lg font-bold" style={{ color: totalRoi >= 0 ? theme.accent : theme.danger }}>
              {totalRoi >= 0 ? '+' : ''}{totalRoi.toFixed(1)}%
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* ===== Pie Chart ===== */}
      {portfolio.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl p-4 transition-colors glass-card"
          style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.bgCardBorder}` }}>
          <p className="text-sm font-semibold mb-3" style={{ color: theme.textPrimary }}>📊 Распределение портфеля</p>
          <PieChartCanvas portfolio={portfolio} totalValue={totalValue} />
        </motion.div>
      )}

      {/* ===== PNL History ===== */}
      {trades.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-4 transition-colors glass-card"
          style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.bgCardBorder}` }}>
          <p className="text-sm font-semibold mb-3" style={{ color: theme.textPrimary }}>📈 История PNL</p>
          <PnlChart trades={trades} />
        </motion.div>
      )}

      {/* ===== ПОДРОБНЫЙ ОТЧЁТ ===== */}
      <DailyReport user={user} holdings={holdings} shares={shares} trades={trades} isPremium={isPremium} theme={theme} />

      {/* ===== Позиции ===== */}
      <div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-sm font-semibold mb-3" style={{ color: theme.textPrimary }}>💼 Позиции</motion.p>
        <div className="space-y-2">
          {portfolio.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10 rounded-2xl glass-card" style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.bgCardBorder}` }}>
              <p className="text-4xl mb-2">📭</p>
              <p className="text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Портфель пуст</p>
              <p className="text-xs" style={{ color: theme.textMuted }}>Купите акции на маркете!</p>
            </motion.div>
          )}
          
          {portfolio.map((p, index) => {
            const isUp = p.pnl >= 0;
            const isExpanded = expandedCard === p.shareId;
            const change24h = ((p.share.currentPrice - p.share.price24hAgo) / p.share.price24hAgo) * 100;
            const isUp24h = change24h >= 0;
            return (
              <motion.div
                key={p.shareId}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.06, type: 'spring', stiffness: 250, damping: 20 }}
                className="rounded-2xl overflow-hidden transition-colors glass-card"
                style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.bgCardBorder}` }}>
                <div className="p-3 flex items-center gap-3 cursor-pointer"
                  onClick={() => setExpandedCard(isExpanded ? null : p.shareId)}>
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: theme.inputBg }}>
                    {p.share.avatar}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: theme.textPrimary }}>{p.share.ticker}</p>
                    <p className="text-[10px]" style={{ color: theme.textMuted }}>
                      {p.amount} шт • Avg: ${p.avgBuyPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <MiniChart data={p.share.priceHistory} width={50} height={24} positive={isUp24h}
                      accentUp={theme.accent} accentDown={theme.danger} />
                  </div>
                  <div className="text-right shrink-0 min-w-[65px]">
                    <p className="text-sm font-semibold" style={{ color: theme.textPrimary }}>${p.currentValue.toFixed(2)}</p>
                    <div className="flex items-center justify-end gap-0.5 text-[10px] font-medium"
                      style={{ color: isUp ? theme.accent : theme.danger }}>
                      {isUp ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                      {isUp ? '+' : ''}{p.pnl.toFixed(1)} ({p.roi.toFixed(1)}%)
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={14} style={{ color: theme.textMuted }} /> : <ChevronDown size={14} style={{ color: theme.textMuted }} />}
                </div>
                
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="px-3 pb-3 space-y-3">
                    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: theme.inputBg }}>
                      <FullChart data={p.share.priceHistory} height={120} accentUp={theme.accent} accentDown={theme.danger} />
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                      {[
                        { label: 'Цена', value: `$${p.share.currentPrice.toFixed(2)}`, color: theme.textPrimary },
                        { label: '24ч', value: `${isUp24h ? '+' : ''}${change24h.toFixed(1)}%`, color: isUp24h ? theme.accent : theme.danger },
                        { label: 'Объём', value: p.share.volume24h.toString(), color: theme.textPrimary },
                        { label: 'Карма', value: p.share.karma.toString(), color: theme.accent },
                      ].map((stat, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="rounded-lg py-1.5" style={{ backgroundColor: theme.inputBg }}>
                          <p style={{ color: theme.textMuted }}>{stat.label}</p>
                          <p className="font-bold" style={{ color: stat.color }}>{stat.value}</p>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="rounded-xl p-2.5" style={{ backgroundColor: isUp ? theme.accent + '08' : theme.danger + '08' }}>
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: theme.textMuted }}>Средняя покупки</span>
                        <span style={{ color: theme.textPrimary }}>${p.avgBuyPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: theme.textMuted }}>Текущая стоимость</span>
                        <span style={{ color: theme.textPrimary }}>${p.currentValue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold">
                        <span style={{ color: theme.textMuted }}>Прибыль / Убыток</span>
                        <span style={{ color: isUp ? theme.accent : theme.danger }}>
                          {isUp ? '+' : ''}{p.pnl.toFixed(2)} $K ({p.roi.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.stopPropagation(); setTradeModal(p.shareId); }}
                        className="flex-1 py-2 rounded-xl text-xs font-bold"
                        style={{ backgroundColor: theme.accent, color: '#000' }}>
                        Купить ещё
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.stopPropagation(); setTradeModal(p.shareId); }}
                        className="flex-1 py-2 rounded-xl text-xs font-bold"
                        style={{ backgroundColor: theme.danger + '20', color: theme.danger }}>
                        Продать
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ===== Pie Chart ===== */
const COLORS = ['#00FF7F', '#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA', '#F472B6', '#FBBF24', '#60A5FA', '#34D399', '#F97316'];

function PieChartCanvas({ portfolio, totalValue }: { portfolio: Array<{ share: { ticker: string; avatar: string }; currentValue: number }>; totalValue: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || portfolio.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const size = 120;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2, cy = size / 2, r = size / 2 - 4;
    let startAngle = -Math.PI / 2;
    portfolio.forEach((p, i) => {
      const slice = (p.currentValue / totalValue) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, startAngle + slice);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      startAngle += slice;
    });
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = theme.bgCard === 'rgba(255,255,255,0.03)' ? '#1a1a2e' : '#F5F5F7';
    ctx.fill();
  }, [portfolio, totalValue, theme]);
  
  return (
    <div className="flex items-center gap-4">
      <canvas ref={canvasRef} style={{ width: 120, height: 120 }} className="shrink-0" />
      <div className="flex-1 space-y-1 max-h-[120px] overflow-y-auto">
        {portfolio.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <span className="truncate" style={{ color: theme.textSecondary }}>{p.share.avatar} {p.share.ticker}</span>
            <span className="ml-auto font-medium" style={{ color: theme.textPrimary }}>{((p.currentValue / totalValue) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== PNL History Chart ===== */
function PnlChart({ trades }: { trades: Array<{ timestamp: number; price: number; amount: number; side: string; fee: number }> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || trades.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = 80;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    
    let cumPnl = 0;
    const points = trades.slice(-30).map(t => {
      const val = t.side === 'sell' ? t.price * t.amount - t.fee : -(t.price * t.amount + t.fee);
      cumPnl += val;
      return cumPnl;
    });
    
    const min = Math.min(0, ...points);
    const max = Math.max(0, ...points);
    const range = max - min || 1;
    
    const isPositive = points[points.length - 1] >= 0;
    
    // Gradient fill
    const grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, (isPositive ? theme.accent : theme.danger) + '20');
    grd.addColorStop(1, 'transparent');
    
    ctx.beginPath();
    points.forEach((v, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 8) - 4;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = isPositive ? theme.accent : theme.danger;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = grd;
    ctx.fill();
    
    // Zero line
    const zeroY = h - ((0 - min) / range) * (h - 8) - 4;
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = 'rgba(128,128,128,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, zeroY);
    ctx.lineTo(w, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [trades, theme]);
  
  return <canvas ref={canvasRef} className="w-full" style={{ height: 80 }} />;
}

/* ===== Shareholders Bar ===== */
function ShareholderBar({ holders, totalShares }: { holders: Array<{ username: string; avatar: string; amount: number }>; totalShares: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = 20;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    
    if (totalShares === 0) return;
    let x = 0;
    holders.forEach((holder, i) => {
      const width = (holder.amount / totalShares) * w;
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.beginPath();
      if (i === 0) {
        ctx.roundRect(x, 0, width, h, [6, 0, 0, 6]);
      } else if (i === holders.length - 1) {
        ctx.roundRect(x, 0, width, h, [0, 6, 6, 0]);
      } else {
        ctx.rect(x, 0, width, h);
      }
      ctx.fill();
      x += width;
    });
  }, [holders, totalShares]);
  
  return <canvas ref={canvasRef} className="w-full rounded-lg mb-2" style={{ height: 20 }} />;
}
