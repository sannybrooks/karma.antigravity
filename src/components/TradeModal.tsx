/* ===== Модал торговли: Buy/Sell с графиком цены + RSI на отдельном canvas (Premium) ===== */
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { useTheme } from '../store/themeStore';
import { X, TrendingUp, TrendingDown, AlertTriangle, Clock, BarChart3, Crown, Lock } from 'lucide-react';
import type { PricePoint } from '../types';

/* ===== Основной график цен (свечи + MA7) ===== */
function PriceChart({ data, height = 130, accentUp = '#00FF7F', accentDown = '#FF4444' }: {
  data: PricePoint[];
  height?: number;
  accentUp?: string;
  accentDown?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || data.length < 2) return;
    const w = container.offsetWidth;
    if (w <= 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = height * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = height + 'px';
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, height);

    const closes = data.map(p => p.close);
    const min = Math.min(...data.map(p => p.low));
    const max = Math.max(...data.map(p => p.high));
    const range = max - min || 1;
    const isUp = closes[closes.length - 1] >= closes[0];
    const color = isUp ? accentUp : accentDown;

    // Сетка
    ctx.strokeStyle = 'rgba(128,128,128,0.1)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Свечи
    const candleW = Math.max(2, (w / data.length) * 0.6);
    data.forEach((p, i) => {
      const x = data.length === 1 ? w / 2 : (i / (data.length - 1)) * (w - candleW) + candleW / 2;
      const openY = height - ((p.open - min) / range) * (height - 16) - 8;
      const closeY = height - ((p.close - min) / range) * (height - 16) - 8;
      const highY = height - ((p.high - min) / range) * (height - 16) - 8;
      const lowY = height - ((p.low - min) / range) * (height - 16) - 8;
      const bullish = p.close >= p.open;

      ctx.strokeStyle = bullish ? accentUp : accentDown;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, highY); ctx.lineTo(x, lowY); ctx.stroke();

      ctx.fillStyle = bullish ? accentUp : accentDown;
      const bodyTop = Math.min(openY, closeY);
      const bodyH = Math.abs(closeY - openY) || 1;
      ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyH);
    });

    // MA(7)
    if (closes.length >= 7) {
      ctx.beginPath();
      ctx.strokeStyle = color + '60';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      for (let i = 6; i < closes.length; i++) {
        const ma = closes.slice(i - 6, i + 1).reduce((a, b) => a + b, 0) / 7;
        const x = (i / (closes.length - 1)) * w;
        const y = height - ((ma - min) / range) * (height - 16) - 8;
        if (i === 6) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Ценовые метки
    ctx.fillStyle = 'rgba(128,128,128,0.5)';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(max.toFixed(1), w - 2, 12);
    ctx.fillText(min.toFixed(1), w - 2, height - 4);
  }, [data, height, accentUp, accentDown]);

  useEffect(() => {
    const timer = setTimeout(draw, 60);
    window.addEventListener('resize', draw);
    return () => { clearTimeout(timer); window.removeEventListener('resize', draw); };
  }, [draw]);

  return (
    <div ref={containerRef} style={{ width: '100%', minHeight: height }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

/* ===== RSI(14) — ОТДЕЛЬНЫЙ canvas, только для Premium ===== */
function RSIChart({ data, height = 60, accentUp = '#00FF7F', accentDown = '#FF4444' }: {
  data: PricePoint[];
  height?: number;
  accentUp?: string;
  accentDown?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentRSI, setCurrentRSI] = useState<number | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || data.length < 16) return;
    const w = container.offsetWidth;
    if (w <= 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = height * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = height + 'px';
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, height);

    const closes = data.map(p => p.close);
    const period = 14;
    const rsiValues: number[] = [];

    for (let i = period; i < closes.length; i++) {
      let gains = 0, losses = 0;
      for (let j = i - period + 1; j <= i; j++) {
        const change = closes[j] - closes[j - 1];
        if (change > 0) gains += change; else losses -= change;
      }
      const avgGain = gains / period;
      const avgLoss = losses / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsiValues.push(100 - (100 / (1 + rs)));
    }

    if (rsiValues.length < 2) return;
    const lastRSI = rsiValues[rsiValues.length - 1];
    setCurrentRSI(lastRSI);

    const pad = 8;
    const chartH = height - pad * 2;

    // Фон
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0, 0, w, height);

    // Зона перекупленности (>70) — красный фон
    const y70 = pad + chartH * (1 - 70 / 100);
    ctx.fillStyle = accentDown + '08';
    ctx.fillRect(0, pad, w, y70 - pad);

    // Зона перепроданности (<30) — зелёный фон
    const y30 = pad + chartH * (1 - 30 / 100);
    ctx.fillStyle = accentUp + '08';
    ctx.fillRect(0, y30, w, height - pad - y30);

    // Линии 30 и 70
    ctx.strokeStyle = 'rgba(128,128,128,0.25)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(0, y70); ctx.lineTo(w, y70); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, y30); ctx.lineTo(w, y30); ctx.stroke();
    // Линия 50
    const y50 = pad + chartH * 0.5;
    ctx.strokeStyle = 'rgba(128,128,128,0.12)';
    ctx.beginPath(); ctx.moveTo(0, y50); ctx.lineTo(w, y50); ctx.stroke();
    ctx.setLineDash([]);

    // Метки
    ctx.fillStyle = 'rgba(128,128,128,0.5)';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('70', 2, y70 - 2);
    ctx.fillText('30', 2, y30 + 9);
    ctx.fillText('50', 2, y50 + 3);

    // Линия RSI
    ctx.beginPath();
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    rsiValues.forEach((rsi, i) => {
      const x = (i / (rsiValues.length - 1)) * w;
      const y = pad + chartH * (1 - rsi / 100);
      // Цвет в зависимости от зоны
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    const lineColor = lastRSI > 70 ? accentDown : lastRSI < 30 ? accentUp : '#A78BFA';
    ctx.strokeStyle = lineColor;
    ctx.stroke();

    // Точка текущего значения
    const lastX = w;
    const lastY = pad + chartH * (1 - lastRSI / 100);
    ctx.beginPath();
    ctx.arc(lastX - 2, lastY, 3, 0, Math.PI * 2);
    ctx.fillStyle = lineColor;
    ctx.fill();

    // Текущее значение справа
    ctx.fillStyle = lineColor;
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(lastRSI.toFixed(0), w - 4, lastY - 5);
  }, [data, height, accentUp, accentDown]);

  useEffect(() => {
    const timer = setTimeout(draw, 80);
    window.addEventListener('resize', draw);
    return () => { clearTimeout(timer); window.removeEventListener('resize', draw); };
  }, [draw]);

  const rsiLabel = currentRSI !== null
    ? (currentRSI > 70 ? 'Перекуплен' : currentRSI < 30 ? 'Перепродан' : 'Нейтрально')
    : '—';
  const rsiColor = currentRSI !== null
    ? (currentRSI > 70 ? accentDown : currentRSI < 30 ? accentUp : '#A78BFA')
    : '#888';

  return (
    <div>
      {/* Заголовок RSI */}
      <div className="flex items-center justify-between px-3 py-1.5"
        style={{ borderTop: '1px solid rgba(128,128,128,0.15)' }}>
        <span className="text-[10px] font-bold flex items-center gap-1" style={{ color: '#FFD700' }}>
          <Crown size={10} /> RSI(14)
        </span>
        <span className="text-[10px] font-bold" style={{ color: rsiColor }}>
          {currentRSI !== null ? `${currentRSI.toFixed(0)} — ${rsiLabel}` : '—'}
        </span>
      </div>
      <div ref={containerRef} style={{ width: '100%', minHeight: height }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

export function TradeModal() {
  const { tradeModalShareId, setTradeModal, shares, user, holdings, executeTrade, addNotification } = useGameStore();
  const { theme } = useTheme();
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState(1);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [chartPeriod, setChartPeriod] = useState<'1h' | '6h' | '24h'>('24h');
  const [success, setSuccess] = useState(false);

  // Проверка Premium для отображения переключателя ордеров
  const isPremium = user.premium && user.premiumExpiresAt > Date.now();

  const share = useMemo(() => {
    if (!tradeModalShareId) return null;
    return shares.find(s => s.id === tradeModalShareId) ?? null;
  }, [tradeModalShareId, shares]);

  const holding = useMemo(() => {
    if (!tradeModalShareId) return undefined;
    return holdings.find(h => h.shareId === tradeModalShareId);
  }, [tradeModalShareId, holdings]);

  const chartData = useMemo(() => {
    if (!share) return [];
    const now = Date.now();
    const periodMs = chartPeriod === '1h' ? 3600000 : chartPeriod === '6h' ? 6 * 3600000 : 24 * 3600000;
    const filtered = share.priceHistory.filter(p => p.time >= now - periodMs);
    return filtered.length >= 2 ? filtered : share.priceHistory;
  }, [share, chartPeriod]);

  const periodChange = useMemo(() => {
    if (chartData.length < 2) return 0;
    const first = chartData[0].close;
    const last = chartData[chartData.length - 1].close;
    return ((last - first) / first) * 100;
  }, [chartData]);

  const chartStats = useMemo(() => {
    if (chartData.length === 0) return { high: 0, low: 0, avg: 0 };
    return {
      high: Math.max(...chartData.map(p => p.high)),
      low: Math.min(...chartData.map(p => p.low)),
      avg: chartData.map(p => p.close).reduce((a, b) => a + b, 0) / chartData.length,
    };
  }, [chartData]);

  useEffect(() => {
    if (tradeModalShareId) {
      setSide('buy'); setAmount(1); setOrderType('market');
      setLimitPrice(0); setError(null); setSuccess(false); setChartPeriod('24h');
    }
  }, [tradeModalShareId]);

  if (!tradeModalShareId || !share) return null;

  const price = orderType === 'limit' && limitPrice > 0 ? limitPrice : share.currentPrice;
  const totalCost = price * amount;
  const fee = totalCost * 0.005;
  const total = side === 'buy' ? totalCost + fee : totalCost - fee;
  const pnl = side === 'sell' && holding ? (price - holding.avgBuyPrice) * amount : 0;
  const maxBuy = Math.max(0, Math.floor(user.balance / (price * 1.005)));
  const maxSell = holding?.amount ?? 0;
  const maxAmount = side === 'buy' ? maxBuy : maxSell;
  const canTrade = amount > 0 && amount <= maxAmount;
  const change24h = ((share.currentPrice - share.price24hAgo) / share.price24hAgo) * 100;
  const isUp24h = change24h >= 0;
  const isPeriodUp = periodChange >= 0;

  const handleTrade = () => {
    setError(null); setSuccess(false);
    if (amount <= 0) { setError('Укажите количество'); return; }
    if (side === 'buy' && amount > maxBuy) { setError('Недостаточно $KARMA'); return; }
    if (side === 'sell' && amount > maxSell) { setError('Недостаточно акций'); return; }
    const result = executeTrade(tradeModalShareId, side, amount, orderType, orderType === 'limit' ? limitPrice : undefined);
    if (result) { setError(result); } else { setSuccess(true); setTimeout(() => setTradeModal(null), 800); }
  };

  const handleClose = () => setTradeModal(null);
  const handleOverlayClick = (e: React.MouseEvent) => { if (e.target === e.currentTarget) handleClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={handleOverlayClick}>
      {/* Ограничение высоты: не заходить под верхние кнопки Telegram */}
      <div className="w-full max-w-md rounded-t-3xl pb-[calc(32px+env(safe-area-inset-bottom,0px))] animate-slideUp glass-modal"
        style={{
          backgroundColor: theme.bgSecondary,
          maxHeight: 'calc(var(--tg-viewport-stable-height, 100vh) - max(var(--tg-top-controls-height), env(safe-area-inset-top, 0px)) - 12px)',
          marginTop: 'max(var(--tg-top-controls-height), env(safe-area-inset-top, 0px))',
          overflowY: 'auto',
        }}>

        {/* Ручка */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: theme.textMuted + '40' }} />
        </div>

        {/* Заголовок */}
        <div className="px-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: theme.inputBg }}>{share.avatar}</div>
              <div>
                <h3 className="font-bold text-base" style={{ color: theme.textPrimary }}>{share.ticker}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold" style={{ color: theme.textPrimary }}>${share.currentPrice.toFixed(2)}</span>
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md"
                    style={{ backgroundColor: isUp24h ? theme.accent + '15' : theme.danger + '15', color: isUp24h ? theme.accent : theme.danger }}>
                    {isUp24h ? '+' : ''}{change24h.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            <button onClick={handleClose} className="p-2 rounded-full" style={{ backgroundColor: theme.inputBg }}>
              <X size={20} style={{ color: theme.textSecondary }} />
            </button>
          </div>
        </div>

        {/* ===== ГРАФИК ЦЕНЫ — отдельный canvas ===== */}
        <div className="px-4 mb-3">
          <div className="rounded-2xl overflow-hidden glass-card" style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.bgCardBorder}` }}>
            {/* Переключатель периодов */}
            <div className="flex items-center justify-between px-3 pt-3 pb-1">
              <div className="flex items-center gap-1">
                <BarChart3 size={12} style={{ color: theme.textMuted }} />
                <span className="text-[10px] font-medium" style={{ color: isPeriodUp ? theme.accent : theme.danger }}>
                  {isPeriodUp ? '+' : ''}{periodChange.toFixed(1)}% за {chartPeriod}
                </span>
              </div>
              <div className="flex gap-1">
                {(['1h', '6h', '24h'] as const).map(p => (
                  <button key={p} onClick={() => setChartPeriod(p)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all"
                    style={{ backgroundColor: chartPeriod === p ? theme.accent + '20' : 'transparent', color: chartPeriod === p ? theme.accent : theme.textMuted }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Индикатор Premium / Free */}
            <div className="flex items-center justify-between px-3 pb-1">
              {isPremium ? (
                <span className="text-[9px] flex items-center gap-1" style={{ color: '#FFD700' }}>
                  <Crown size={9} /> RSI + MA(7) — Premium
                </span>
              ) : (
                <button onClick={() => addNotification('🔒 RSI/MA доступны с Premium', 'warning')}
                  className="text-[9px] flex items-center gap-1" style={{ color: theme.textMuted }}>
                  <Lock size={9} /> RSI/MA — Premium
                </button>
              )}
              <span className="text-[9px]" style={{ color: theme.textMuted }}>{chartData.length} свечей</span>
            </div>

            {/* Основной свечной график (100% высоты — без RSI!) */}
            <div className="px-2 pb-1">
              {chartData.length >= 2 ? (
                <PriceChart data={chartData} height={130} accentUp={theme.accent} accentDown={theme.danger} />
              ) : (
                <div className="flex items-center justify-center" style={{ height: 130, color: theme.textMuted }}>
                  <span className="text-xs">Нет данных для графика</span>
                </div>
              )}
            </div>

            {/* ===== RSI — ОТДЕЛЬНЫЙ canvas, только для Premium ===== */}
            {isPremium && chartData.length >= 16 && (
              <div className="px-2 pb-2">
                <RSIChart data={chartData} height={60} accentUp={theme.accent} accentDown={theme.danger} />
              </div>
            )}

            {/* Мини-статистика */}
            <div className="grid grid-cols-3 gap-0 border-t" style={{ borderColor: theme.bgCardBorder }}>
              <div className="py-2 text-center border-r" style={{ borderColor: theme.bgCardBorder }}>
                <p className="text-[9px]" style={{ color: theme.textMuted }}>High</p>
                <p className="text-xs font-bold" style={{ color: theme.accent }}>${chartStats.high.toFixed(2)}</p>
              </div>
              <div className="py-2 text-center border-r" style={{ borderColor: theme.bgCardBorder }}>
                <p className="text-[9px]" style={{ color: theme.textMuted }}>Low</p>
                <p className="text-xs font-bold" style={{ color: theme.danger }}>${chartStats.low.toFixed(2)}</p>
              </div>
              <div className="py-2 text-center">
                <p className="text-[9px]" style={{ color: theme.textMuted }}>Avg</p>
                <p className="text-xs font-bold" style={{ color: theme.textPrimary }}>${chartStats.avg.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Метрики */}
        <div className="px-4 mb-3">
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Карма', value: share.karma.toString(), color: theme.accent },
              { label: 'Объём 24ч', value: share.volume24h.toString(), color: theme.textPrimary },
              { label: 'Hype', value: (share.hypeModifier >= 0 ? '+' : '') + share.hypeModifier.toFixed(0), color: share.hypeModifier >= 0 ? theme.accent : theme.danger },
              { label: 'Supply', value: share.totalSupply.toString(), color: theme.textMuted },
            ].map((s, i) => (
              <div key={i} className="rounded-xl py-1.5 px-1 text-center" style={{ backgroundColor: theme.inputBg }}>
                <p className="text-[8px]" style={{ color: theme.textMuted }}>{s.label}</p>
                <p className="text-[11px] font-bold" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 space-y-3">
          {/* Buy / Sell */}
          <div className="flex gap-2">
            <button onClick={() => { setSide('buy'); setAmount(1); setError(null); }}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1"
              style={{ backgroundColor: side === 'buy' ? theme.accent : theme.inputBg, color: side === 'buy' ? '#000' : theme.textSecondary }}>
              <TrendingUp size={16} /> Купить
            </button>
            <button onClick={() => { setSide('sell'); setAmount(1); setError(null); }}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1"
              style={{ backgroundColor: side === 'sell' ? theme.danger : theme.inputBg, color: side === 'sell' ? '#fff' : theme.textSecondary }}>
              <TrendingDown size={16} /> Продать
            </button>
          </div>

          {/* Мой холдинг */}
          {holding && (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl text-xs"
              style={{ backgroundColor: theme.accent + '08', border: `1px solid ${theme.accent}20` }}>
              <span style={{ color: theme.textSecondary }}>Ваша позиция</span>
              <span className="font-bold" style={{ color: theme.accent }}>{holding.amount} шт • Avg: ${holding.avgBuyPrice.toFixed(2)}</span>
            </div>
          )}

          {/* Тип ордера — только для Premium */}
          {isPremium && (
            <div className="flex gap-2">
              {(['market', 'limit'] as const).map(t => (
                <button key={t} onClick={() => { setOrderType(t); setError(null); }}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                  style={{ backgroundColor: orderType === t ? theme.accentGold + '20' : theme.inputBg, color: orderType === t ? theme.accentGold : theme.textMuted }}>
                  {t === 'market' ? '⚡ Market' : '🎯 Limit'}
                </button>
              ))}
            </div>
          )}

          {orderType === 'limit' && isPremium && (
            <div>
              <label className="text-xs mb-1 block" style={{ color: theme.textSecondary }}>Лимитная цена</label>
              <input type="number" value={limitPrice || ''} onChange={e => setLimitPrice(Number(e.target.value))}
                placeholder={share.currentPrice.toFixed(2)}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{ backgroundColor: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.textPrimary }} />
            </div>
          )}

          {/* Количество */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs" style={{ color: theme.textSecondary }}>Количество</label>
              <span className="text-xs" style={{ color: theme.textMuted }}>Макс: {maxAmount}</span>
            </div>
            {maxAmount > 0 && (
              <input type="range" min={1} max={maxAmount} value={Math.min(amount, maxAmount)}
                onChange={e => setAmount(Number(e.target.value))} className="w-full mb-1 accent-green-400" />
            )}
            <div className="flex items-center gap-2">
              <input type="number" value={amount}
                onChange={e => { setAmount(Math.max(0, Number(e.target.value))); setError(null); }}
                min={1} className="w-full min-w-0 rounded-xl px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.textPrimary }} />
              <div className="flex gap-1 shrink-0">
                {[25, 50, 100].map(pct => (
                  <button key={pct} onClick={() => { setAmount(Math.max(1, Math.floor(maxAmount * pct / 100))); setError(null); }}
                    className="w-9 h-9 rounded-xl text-[10px] font-bold shrink-0"
                    style={{ backgroundColor: theme.inputBg, color: theme.textMuted }}>{pct}%</button>
                ))}
                <button onClick={() => { setAmount(maxAmount); setError(null); }}
                  className="w-11 h-9 rounded-xl text-[10px] font-bold shrink-0"
                  style={{ backgroundColor: theme.accentGold + '20', color: theme.accentGold }}>MAX</button>
              </div>
            </div>
          </div>

          {/* Превью */}
          <div className="rounded-xl p-3 space-y-1.5" style={{ backgroundColor: theme.inputBg }}>
            <div className="flex justify-between text-sm">
              <span style={{ color: theme.textSecondary }}>Цена</span>
              <span style={{ color: theme.textPrimary }}>${price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: theme.textSecondary }}>Сумма</span>
              <span style={{ color: theme.textPrimary }}>{totalCost.toFixed(2)} $K</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: theme.textSecondary }}>Комиссия (0.5%)</span>
              <span style={{ color: theme.accentGold }}>{fee.toFixed(2)} $K</span>
            </div>
            <hr style={{ borderColor: theme.bgCardBorder }} />
            <div className="flex justify-between text-sm font-bold">
              <span style={{ color: theme.textSecondary }}>Итого</span>
              <span style={{ color: side === 'buy' ? theme.accent : theme.danger }}>
                {side === 'buy' ? '-' : '+'}{total.toFixed(2)} $K
              </span>
            </div>
            {side === 'sell' && pnl !== 0 && (
              <div className="flex justify-between text-sm">
                <span style={{ color: theme.textSecondary }}>PNL</span>
                <span style={{ color: pnl >= 0 ? theme.accent : theme.danger }}>
                  {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} $K
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs p-3 rounded-xl"
              style={{ backgroundColor: theme.danger + '15', color: theme.danger }}>
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-xs p-3 rounded-xl"
              style={{ backgroundColor: theme.accent + '15', color: theme.accent }}>
              ✅ Сделка выполнена!
            </div>
          )}

          <button onClick={handleTrade} disabled={!canTrade || success}
            className="w-full py-3.5 rounded-2xl font-bold text-base transition-all active:scale-95 disabled:opacity-50"
            style={{
              backgroundColor: side === 'buy' ? theme.accent : theme.danger,
              color: side === 'buy' ? '#000' : '#fff',
              boxShadow: canTrade ? `0 4px 15px ${side === 'buy' ? theme.accent : theme.danger}40` : 'none',
            }}>
            {success ? '✅ Готово!' : side === 'buy' ? `Купить ${amount} шт за ${total.toFixed(1)} $K` : `Продать ${amount} шт за ${(totalCost - fee).toFixed(1)} $K`}
          </button>

          <div className="flex items-center justify-center gap-2 text-[10px] pb-2" style={{ color: theme.textMuted }}>
            <Clock size={10} />
            <span>Баланс: {user.balance.toFixed(2)} $KARMA</span>
            <span>•</span>
            <span>Мин. удержание: 1 мин</span>
          </div>
        </div>
      </div>
    </div>
  );
}
