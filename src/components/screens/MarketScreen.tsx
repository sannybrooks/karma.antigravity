/* ===== Экран Маркет — Список акций, фильтры, поиск, order book, акционеры ===== */
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { useTheme } from '../../store/themeStore';
import { MiniChart } from '../MiniChart';
import { generateOrderBook } from '../../data/seed';
import { Search, Zap, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import type { MarketFilter, Share } from '../../types';

type ExtFilter = MarketFilter | 'vip';

export function MarketScreen() {
  const { shares, setTradeModal, activeEvent, holdings, user, addNotification } = useGameStore();
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ExtFilter>('all');
  const [expandedOrderBook, setExpandedOrderBook] = useState<string | null>(null);
  const [showShareholders, setShowShareholders] = useState<string | null>(null);
  
  const filtered = useMemo(() => {
    let list = shares.filter(s => !s.hidden);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.username.toLowerCase().includes(q) || s.ticker.toLowerCase().includes(q));
    }
    switch (filter) {
      case 'hot':
        list = list.filter(s => ((s.currentPrice - s.price24hAgo) / s.price24hAgo) > 0.1);
        break;
      case 'friends':
        list = list.filter(s => holdings.some(h => h.shareId === s.id));
        break;
      case 'undervalued':
        list = list.filter(s => s.karma > 200 && s.currentPrice < 200);
        break;
      case 'vip':
        list = list.filter(s => s.isVIP);
        break;
    }
    return list.sort((a, b) => b.volume24h - a.volume24h);
  }, [shares, search, filter, holdings]);
  
  return (
    <div className="pb-4">
      {/* Активное событие */}
      {activeEvent && Date.now() < activeEvent.endsAt && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="mx-4 mb-3 bg-gradient-to-r from-[#FFD700]/20 to-[#FF6B00]/20 rounded-2xl p-3 flex items-center gap-2 border border-[#FFD700]/30">
          <Zap size={18} className="text-[#FFD700] shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold" style={{ color: theme.accentGold }}>{activeEvent.name}</p>
            <p className="text-xs" style={{ color: theme.textMuted }}>
              Осталось: {Math.max(0, Math.ceil((activeEvent.endsAt - Date.now()) / 60000))} мин
            </p>
          </div>
        </motion.div>
      )}
      
      {/* Поиск */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-4 mb-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.textMuted }} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск @user..."
            className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-colors"
            style={{ backgroundColor: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.textPrimary }}
          />
        </div>
      </motion.div>
      
      {/* Фильтры */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 }}
        className="px-4 mb-4 flex gap-2 overflow-x-auto scrollbar-hide">
        {([
          { key: 'all' as const, label: 'Все' },
          { key: 'hot' as const, label: 'Hot 🔥' },
          { key: 'friends' as const, label: 'Мои' },
          { key: 'undervalued' as const, label: 'Undervalued' },
        ]).map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{
              backgroundColor: filter === f.key ? theme.accent + '20' : theme.inputBg,
              color: filter === f.key ? theme.accent : theme.textSecondary,
              border: `1px solid ${filter === f.key ? theme.accent + '40' : theme.inputBorder}`,
            }}>
            {f.label}
          </button>
        ))}
        <button onClick={() => {
            if (user.premium) {
              setFilter(filter === 'vip' ? 'all' : 'vip');
            } else {
              addNotification('🔒 VIP маркет доступен с Premium подпиской', 'warning');
            }
          }}
          className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1"
          style={{
            backgroundColor: filter === 'vip' ? '#FFD70030' : '#FFD70015',
            color: user.premium ? '#FFD700' : theme.textMuted,
            border: `1px solid ${filter === 'vip' ? '#FFD70060' : '#FFD70030'}`,
          }}>
          {user.premium ? '⭐' : '🔒'} VIP
        </button>
      </motion.div>
      
      {/* Баннер Premium */}
      {!user.premium && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mx-4 mb-3 rounded-xl p-2.5 text-center"
          style={{ backgroundColor: '#FFD70008', border: '1px solid #FFD70020' }}>
          <p className="text-[10px]" style={{ color: theme.textMuted }}>
            🔒 VIP акции и приоритет ордеров доступны с <span style={{ color: '#FFD700', fontWeight: 700 }}>Premium</span>
          </p>
        </motion.div>
      )}
      
      {user.premium && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mx-4 mb-3 rounded-xl p-2.5 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #FFD70010, #FF8C0010)', border: '1px solid #FFD70025' }}>
          <div className="flex items-center gap-2">
            <span className="text-sm">👑</span>
            <span className="text-[10px] font-bold" style={{ color: '#FFD700' }}>Premium активен</span>
          </div>
          <div className="flex items-center gap-3 text-[10px]" style={{ color: theme.textMuted }}>
            <span>Трейды: ♾️</span>
            <span>Приоритет: ✅</span>
            <span>VIP: ✅</span>
          </div>
        </motion.div>
      )}
      
      {/* Список акций */}
      <div className="px-4 space-y-3">
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10" style={{ color: theme.textMuted }}>
            <p className="text-lg mb-1">Ничего не найдено</p>
            <p className="text-sm">Попробуйте другой фильтр</p>
          </motion.div>
        )}
        
        {filtered.map((share, index) => {
          const change24h = ((share.currentPrice - share.price24hAgo) / share.price24hAgo) * 100;
          const isUp = change24h >= 0;
          const priceJustChanged = Math.abs(share.currentPrice - share.previousPrice) > 0.01;
          const priceFlash = priceJustChanged
            ? (share.currentPrice > share.previousPrice ? 'animate-flashGreen' : 'animate-flashRed') : '';
          const myHolding = holdings.find(h => h.shareId === share.id);
          
          return (
            <motion.div
              key={share.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, type: 'spring', stiffness: 260, damping: 20 }}
              className="rounded-2xl overflow-hidden transition-all"
              style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.bgCardBorder}` }}>
              
              {/* === Верхняя строка: аватар + имя + бейджи === */}
              <div className="px-4 pt-4 pb-2 flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 shadow-lg"
                  style={{ 
                    backgroundColor: isUp ? theme.accent + '15' : theme.danger + '15',
                    border: `2px solid ${isUp ? theme.accent + '40' : theme.danger + '40'}`
                  }}>
                  {share.avatar}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-base" style={{ color: theme.textPrimary }}>
                      @{share.username}
                    </span>
                    {share.isVIP && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold tracking-wide"
                        style={{ backgroundColor: theme.accentGold + '25', color: theme.accentGold, border: `1px solid ${theme.accentGold}40` }}>
                        ⭐ VIP
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono mt-0.5 block" style={{ color: theme.textMuted }}>
                    {share.ticker}
                  </span>
                </div>
              </div>
              
              {/* === График по всей ширине === */}
              <div className="px-4 py-1">
                <div className="w-full rounded-xl overflow-hidden"
                  style={{ backgroundColor: isUp ? theme.accent + '08' : theme.danger + '08' }}>
                  <MiniChart 
                    data={share.priceHistory} 
                    positive={isUp} 
                    accentUp={theme.accent} 
                    accentDown={theme.danger}
                    height={56}
                    fullWidth
                  />
                </div>
              </div>
              
              {/* === Нижняя строка: цена + метрики + кнопка === */}
              <div className="px-4 pt-2 pb-3 flex items-end justify-between gap-2">
                <div className="flex-1">
                  <div className={`text-xl font-bold tracking-tight ${priceFlash}`}
                    style={{ color: theme.textPrimary }}>
                    ${share.currentPrice.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md"
                      style={{ 
                        backgroundColor: isUp ? theme.accent + '18' : theme.danger + '18',
                        color: isUp ? theme.accent : theme.danger 
                      }}>
                      {isUp ? '▲' : '▼'} {isUp ? '+' : ''}{change24h.toFixed(1)}%
                    </span>
                    <span className="text-[10px]" style={{ color: theme.textMuted }}>24ч</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: theme.textMuted }}>Карма</p>
                    <p className="text-xs font-bold" style={{ color: theme.textPrimary }}>{share.karma}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: theme.textMuted }}>Объём</p>
                    <p className="text-xs font-bold" style={{ color: theme.textPrimary }}>{share.volume24h > 999 ? (share.volume24h / 1000).toFixed(1) + 'k' : share.volume24h}</p>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setTradeModal(share.id)}
                  className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg"
                  style={{ 
                    backgroundColor: theme.accent, 
                    color: '#000',
                    boxShadow: `0 4px 15px ${theme.accent}40`
                  }}>
                  Trade
                </motion.button>
              </div>
              
              {/* === Индикатор позиции === */}
              {myHolding && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mx-4 mb-3 px-3 py-2 rounded-xl flex items-center justify-between"
                  style={{ backgroundColor: theme.accent + '10', border: `1px solid ${theme.accent}20` }}>
                  <span className="text-xs" style={{ color: theme.accent }}>📦 Ваша позиция</span>
                  <span className="text-xs font-bold" style={{ color: theme.accent }}>
                    {myHolding.amount} шт • ${(myHolding.amount * share.currentPrice).toFixed(0)}
                  </span>
                </motion.div>
              )}
              
              {/* === Кнопки OrderBook / Акционеры === */}
              <div className="flex border-t" style={{ borderColor: theme.bgCardBorder }}>
                <button onClick={() => { setExpandedOrderBook(expandedOrderBook === share.id ? null : share.id); setShowShareholders(null); }}
                  className="flex-1 px-3 py-2 flex items-center justify-center gap-1.5 text-xs font-medium transition-colors"
                  style={{ color: expandedOrderBook === share.id ? theme.accent : theme.textMuted }}>
                  📊 Order Book {expandedOrderBook === share.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                <div style={{ width: 1, backgroundColor: theme.bgCardBorder }} />
                <button onClick={() => { setShowShareholders(showShareholders === share.id ? null : share.id); setExpandedOrderBook(null); }}
                  className="flex-1 px-3 py-2 flex items-center justify-center gap-1.5 text-xs font-medium transition-colors"
                  style={{ color: showShareholders === share.id ? theme.accent : theme.textMuted }}>
                  <Eye size={12} /> Акционеры
                </button>
              </div>
              
              {expandedOrderBook === share.id && <OrderBookView price={share.currentPrice} />}
              {showShareholders === share.id && <ShareholdersView share={share} />}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* Компонент Order Book */
function OrderBookView({ price }: { price: number }) {
  const { theme } = useTheme();
  const { bids, asks } = useMemo(() => generateOrderBook(price), [price]);
  const maxTotal = Math.max(bids[bids.length - 1]?.total ?? 1, asks[asks.length - 1]?.total ?? 1);
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="px-3 pb-3 grid grid-cols-2 gap-2">
      <div>
        <div className="grid grid-cols-3 text-[10px] mb-1 font-medium" style={{ color: theme.textMuted }}>
          <span>Цена</span><span className="text-center">Кол-во</span><span className="text-right">Всего</span>
        </div>
        {bids.map((b, i) => (
          <div key={i} className="relative grid grid-cols-3 text-[10px] py-0.5">
            <div className="absolute inset-0 rounded-sm" style={{ backgroundColor: theme.accent + '10', width: `${(b.total / maxTotal) * 100}%` }} />
            <span className="relative z-10" style={{ color: theme.accent }}>{b.price.toFixed(2)}</span>
            <span className="text-center relative z-10" style={{ color: theme.textSecondary }}>{b.amount}</span>
            <span className="text-right relative z-10" style={{ color: theme.textMuted }}>{b.total}</span>
          </div>
        ))}
      </div>
      <div>
        <div className="grid grid-cols-3 text-[10px] mb-1 font-medium" style={{ color: theme.textMuted }}>
          <span>Цена</span><span className="text-center">Кол-во</span><span className="text-right">Всего</span>
        </div>
        {asks.map((a, i) => (
          <div key={i} className="relative grid grid-cols-3 text-[10px] py-0.5">
            <div className="absolute inset-0 right-0 rounded-sm" style={{ backgroundColor: theme.danger + '10', width: `${(a.total / maxTotal) * 100}%`, marginLeft: 'auto' }} />
            <span className="relative z-10" style={{ color: theme.danger }}>{a.price.toFixed(2)}</span>
            <span className="text-center relative z-10" style={{ color: theme.textSecondary }}>{a.amount}</span>
            <span className="text-right relative z-10" style={{ color: theme.textMuted }}>{a.total}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* Компонент Акционеры */
function ShareholdersView({ share }: { share: Share }) {
  const { theme } = useTheme();
  const { holdings, user } = useGameStore();
  
  const myHolding = holdings.find(h => h.shareId === share.id);
  
  const allHolders = [
    ...(myHolding ? [{ userId: user.id, username: user.username, avatar: user.avatar, amount: myHolding.amount, boughtAt: myHolding.boughtAt }] : []),
    ...share.shareholders,
  ].sort((a, b) => b.amount - a.amount);
  
  const totalHeld = allHolders.reduce((s, h) => s + h.amount, 0);
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="px-3 pb-3">
      <p className="text-[10px] mb-2" style={{ color: theme.textMuted }}>
        Всего акционеров: {allHolders.length} • Объём: {totalHeld} шт
      </p>
      <div className="space-y-1.5">
        {allHolders.map((h, i) => {
          const pct = totalHeld > 0 ? ((h.amount / totalHeld) * 100).toFixed(1) : '0';
          const isMe = h.userId === user.id;
          return (
            <motion.div
              key={`${h.userId}-${i}`}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 text-xs rounded-lg px-2 py-1.5"
              style={{ backgroundColor: isMe ? theme.accent + '10' : 'transparent', border: isMe ? `1px solid ${theme.accent}30` : 'none' }}>
              <span className="text-lg">{h.avatar}</span>
              <span className="flex-1 truncate" style={{ color: isMe ? theme.accent : theme.textPrimary }}>
                @{h.username} {isMe && '(вы)'}
              </span>
              <span className="font-bold" style={{ color: theme.textPrimary }}>{h.amount} шт</span>
              <span style={{ color: theme.textMuted }}>{pct}%</span>
            </motion.div>
          );
        })}
        {allHolders.length === 0 && (
          <p className="text-center text-xs py-3" style={{ color: theme.textMuted }}>Пока нет акционеров</p>
        )}
      </div>
    </motion.div>
  );
}
