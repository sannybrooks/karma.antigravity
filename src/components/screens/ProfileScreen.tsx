/* ===== Экран Profile — Настройка карточки, буст, акционеры, графики, тема, Premium ===== */
import { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { useTheme } from '../../store/themeStore';
import { LEVEL_SYSTEM, getUserLevel } from '../../store/constants';
import { User, Shield, Bell, Eye, EyeOff, Crown, Moon, Sun, Rocket, Palette, Edit3, Users as UsersIcon, Sparkles } from 'lucide-react';

interface ProfileProps {
  onOpenPremium?: () => void;
}

const CARD_COLORS = ['#00FF7F', '#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA', '#F472B6', '#FBBF24', '#60A5FA'];
const CARD_BADGES = ['💎', '🔥', '⚡', '🦊', '🐉', '👑', '🌟', '🎯', '🚀', '🎮'];
const CARD_BACKGROUNDS = [
  { id: 'gradient1', label: 'Зелёный', from: '#00FF7F', to: '#00CC66' },
  { id: 'gradient2', label: 'Золотой', from: '#FFD700', to: '#FF8C00' },
  { id: 'gradient3', label: 'Неон', from: '#A78BFA', to: '#F472B6' },
  { id: 'gradient4', label: 'Океан', from: '#4ECDC4', to: '#60A5FA' },
  { id: 'gradient5', label: 'Огонь', from: '#FF6B6B', to: '#FBBF24' },
  { id: 'gradient6', label: 'Тёмный', from: '#374151', to: '#1F2937' },
];

export function ProfileScreen({ onOpenPremium }: ProfileProps) {
  const { user, updateUser, holdings, shares, addNotification, boostSelf, trades } = useGameStore();
  const { theme, mode, toggle: toggleTheme } = useTheme();
  const [editMode, setEditMode] = useState(false);
  const [showShareholders, setShowShareholders] = useState(false);
  const [bio, setBio] = useState(user.cardBio);
  const [username, setUsername] = useState(user.username);
  
  const levelInfo = getUserLevel(user.karma);
  const nextLevelInfo = levelInfo.nextLevel ? LEVEL_SYSTEM.find(l => l.level === levelInfo.level + 1) : null;
  
  const portfolioValue = holdings.reduce((sum, h) => {
    const share = shares.find(s => s.id === h.shareId);
    return sum + (share ? share.currentPrice * h.amount : 0);
  }, 0);
  
  const myShareholders = useMemo(() => {
    const holders = shares.slice(0, 6).map((s) => ({
      username: s.username, avatar: s.avatar,
      amount: 3 + Math.floor(Math.random() * 20),
      pct: '0',
    }));
    const total = holders.reduce((s, h) => s + h.amount, 0);
    return holders.map(h => ({ ...h, pct: total > 0 ? ((h.amount / total) * 100).toFixed(1) : '0' }));
  }, [shares]);
  
  const bgPreset = CARD_BACKGROUNDS.find(b => b.id === user.cardBackground) || CARD_BACKGROUNDS[0];
  const selfBoostActive = user.selfBoostExpiry > Date.now();
  const boostCost = (user.selfBoostLevel + 1) * 100;
  
  const handleSaveProfile = () => {
    updateUser({ cardBio: bio, username: username || 'you' });
    setEditMode(false);
    addNotification('Профиль обновлён!', 'success');
  };
  
  const handleSelfBoost = () => {
    const err = boostSelf();
    if (err) addNotification(err, 'warning');
  };

  const handlePremium = () => {
    if (onOpenPremium) onOpenPremium();
  };
  
  return (
    <div className="px-4 pb-4 space-y-4">
      {/* ===== Карточка пользователя ===== */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="rounded-2xl overflow-hidden transition-colors"
        style={{ border: `2px solid ${user.cardColor}40` }}>
        <div className="h-20 relative"
          style={{ background: `linear-gradient(135deg, ${bgPreset.from}, ${bgPreset.to})` }}>
          {selfBoostActive && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-black/40 text-white flex items-center gap-1">
              <Rocket size={10} /> Буст Lvl{user.selfBoostLevel}
            </motion.div>
          )}
          <div className="absolute -bottom-8 left-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg"
              style={{ backgroundColor: theme.bg, border: `3px solid ${user.cardColor}` }}>
              {user.cardBadge}
            </motion.div>
          </div>
        </div>
        
        <div className="p-4 pt-10" style={{ backgroundColor: theme.bgCard }}>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-bold text-lg" style={{ color: theme.textPrimary }}>@{user.username}</h2>
            {user.premium && <Crown size={14} style={{ color: theme.accentGold }} />}
            <button onClick={() => setEditMode(!editMode)} className="ml-auto p-1.5 rounded-lg transition-colors"
              style={{ backgroundColor: theme.inputBg }}>
              <Edit3 size={14} style={{ color: theme.accent }} />
            </button>
          </div>
          <p className="text-xs mb-3" style={{ color: theme.textSecondary }}>{user.cardBio}</p>
          
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { label: 'Карма', value: user.karma, color: theme.accent },
              { label: '$KARMA', value: user.balance.toFixed(0), color: theme.accentGold },
              { label: 'Портфель', value: `$${portfolioValue.toFixed(0)}`, color: theme.textPrimary },
              { label: 'Уровень', value: user.level, color: theme.accent },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="rounded-lg p-2 text-center" style={{ backgroundColor: theme.inputBg }}>
                <p className="text-[9px]" style={{ color: theme.textMuted }}>{s.label}</p>
                <p className="font-bold text-xs" style={{ color: s.color }}>{s.value}</p>
              </motion.div>
            ))}
          </div>
          
          {/* Система уровней */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold flex items-center gap-1.5" style={{ color: theme.textPrimary }}>
                <span className="text-lg">{levelInfo.icon}</span> {levelInfo.name}
                <span className="text-xs font-normal px-1.5 py-0.5 rounded-full" style={{ backgroundColor: theme.accent + '20', color: theme.accent }}>
                  Ур. {levelInfo.level}
                </span>
              </span>
              <span className="text-[10px]" style={{ color: theme.textMuted }}>
                {user.karma} / {nextLevelInfo ? nextLevelInfo.karmaRequired : 'MAX'} кармы
              </span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: theme.inputBg }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelInfo.progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentGold})` }} />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px]" style={{ color: theme.textMuted }}>{Math.round(levelInfo.progress)}%</span>
              {nextLevelInfo && (
                <span className="text-[10px]" style={{ color: theme.accentGold }}>
                  → {nextLevelInfo.icon} {nextLevelInfo.name} (ещё {nextLevelInfo.karmaRequired - user.karma} кармы)
                </span>
              )}
              {!nextLevelInfo && (
                <span className="text-[10px] font-bold" style={{ color: theme.accentGold }}>🌌 Максимальный уровень!</span>
              )}
            </div>
          </motion.div>
          
          {/* Бонусы уровня */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: '📈 Див.', value: `+${levelInfo.divBonus}%` },
              { label: '💼 Портфель', value: `${levelInfo.portfolioLimit}` },
              { label: '🏦 APY', value: `+${levelInfo.apyBonus}%` },
              { label: '💰 Ребейт', value: `+${(levelInfo.rebateBonus * 100).toFixed(0)}%` },
            ].map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="rounded-lg py-1.5 text-center" style={{ backgroundColor: theme.inputBg }}>
                <p className="text-[8px]" style={{ color: theme.textMuted }}>{b.label}</p>
                <p className="font-bold text-[10px]" style={{ color: theme.accent }}>{b.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* ===== Редактирование ===== */}
      {editMode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-2xl p-4 space-y-4 transition-colors"
          style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.bgCardBorder}` }}>
          <div className="flex items-center gap-2 mb-1">
            <Palette size={16} style={{ color: theme.accent }} />
            <span className="font-semibold text-sm" style={{ color: theme.textPrimary }}>Настройка карточки</span>
          </div>
          
          <div>
            <label className="text-xs mb-1 block" style={{ color: theme.textSecondary }}>Имя пользователя</label>
            <input value={username} onChange={e => setUsername(e.target.value)} maxLength={20}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{ backgroundColor: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.textPrimary }} />
          </div>
          
          <div>
            <label className="text-xs mb-1 block" style={{ color: theme.textSecondary }}>Описание</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={100} rows={2}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none"
              style={{ backgroundColor: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.textPrimary }} />
          </div>
          
          <div>
            <label className="text-xs mb-2 block" style={{ color: theme.textSecondary }}>Цвет карточки</label>
            <div className="flex gap-2 flex-wrap">
              {CARD_COLORS.map(c => (
                <motion.button key={c} whileTap={{ scale: 0.85 }} onClick={() => updateUser({ cardColor: c })}
                  className="w-8 h-8 rounded-full transition-all"
                  style={{ backgroundColor: c, border: user.cardColor === c ? '3px solid white' : '2px solid transparent', boxShadow: user.cardColor === c ? `0 0 10px ${c}60` : 'none' }} />
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-xs mb-2 block" style={{ color: theme.textSecondary }}>Бейдж (аватар)</label>
            <div className="flex gap-2 flex-wrap">
              {CARD_BADGES.map(b => (
                <motion.button key={b} whileTap={{ scale: 0.85 }} onClick={() => updateUser({ cardBadge: b })}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all"
                  style={{ backgroundColor: user.cardBadge === b ? theme.accent + '20' : theme.inputBg, border: user.cardBadge === b ? `2px solid ${theme.accent}` : `1px solid ${theme.inputBorder}` }}>
                  {b}
                </motion.button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-xs mb-2 block" style={{ color: theme.textSecondary }}>Фон баннера</label>
            <div className="grid grid-cols-3 gap-2">
              {CARD_BACKGROUNDS.map(bg => (
                <motion.button key={bg.id} whileTap={{ scale: 0.93 }} onClick={() => updateUser({ cardBackground: bg.id })}
                  className="h-10 rounded-xl transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${bg.from}, ${bg.to})`,
                    border: user.cardBackground === bg.id ? '2px solid white' : '2px solid transparent',
                    boxShadow: user.cardBackground === bg.id ? '0 0 8px rgba(255,255,255,0.3)' : 'none',
                  }}>
                  <span className="text-[9px] text-white font-bold drop-shadow">{bg.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
          
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleSaveProfile}
            className="w-full py-2.5 rounded-xl font-bold text-sm transition-all"
            style={{ backgroundColor: theme.accent, color: '#000' }}>
            ✅ Сохранить
          </motion.button>
        </motion.div>
      )}
      
      {/* ===== Буст своей карточки ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl p-4 transition-colors"
        style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.bgCardBorder}` }}>
        <div className="flex items-center gap-2 mb-3">
          <Rocket size={16} style={{ color: theme.accent }} />
          <span className="font-semibold text-sm" style={{ color: theme.textPrimary }}>Бустить свою карточку</span>
        </div>
        <p className="text-xs mb-3" style={{ color: theme.textSecondary }}>
          Буст увеличивает hype ваших акций, дивиденды и карму на 24ч.
        </p>
        
        <div className="flex gap-1 mb-3">
          {[1, 2, 3, 4, 5].map(lvl => (
            <motion.div
              key={lvl}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3 + lvl * 0.08 }}
              className="flex-1 h-2 rounded-full origin-left"
              style={{ backgroundColor: lvl <= user.selfBoostLevel ? theme.accent : theme.inputBg }} />
          ))}
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs" style={{ color: theme.textMuted }}>
              Текущий уровень: <span className="font-bold" style={{ color: theme.accent }}>{user.selfBoostLevel}/5</span>
            </p>
            {selfBoostActive && (
              <p className="text-[10px]" style={{ color: theme.accentGold }}>
                ⏳ Активен ещё {Math.max(0, Math.ceil((user.selfBoostExpiry - Date.now()) / 3600000))}ч
              </p>
            )}
          </div>
          <motion.button whileTap={{ scale: 0.92 }} onClick={handleSelfBoost} disabled={user.selfBoostLevel >= 5}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
            style={{ backgroundColor: theme.accent, color: '#000' }}>
            🚀 Буст ({boostCost} $K)
          </motion.button>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
          {[
            { label: 'Hype бонус', value: `+${user.selfBoostLevel * 3}`, color: theme.accent },
            { label: 'Дивиденды', value: `+${user.selfBoostLevel * 5}%`, color: theme.accentGold },
            { label: 'Карма бонус', value: '+20/ур', color: theme.accent },
          ].map((s, i) => (
            <div key={i} className="rounded-lg py-1.5" style={{ backgroundColor: theme.inputBg }}>
              <p style={{ color: theme.textMuted }}>{s.label}</p>
              <p className="font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      </motion.div>
      
      {/* ===== Акционеры ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl p-4 transition-colors"
        style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.bgCardBorder}` }}>
        <button onClick={() => setShowShareholders(!showShareholders)}
          className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UsersIcon size={16} style={{ color: theme.accentGold }} />
            <span className="font-semibold text-sm" style={{ color: theme.textPrimary }}>Мои акционеры</span>
          </div>
          <span className="text-xs" style={{ color: theme.accent }}>{showShareholders ? 'Скрыть' : 'Показать'}</span>
        </button>
        
        {showShareholders && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 space-y-2">
            <ShareholderBar holders={myShareholders} />
            {myShareholders.map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2 text-xs rounded-lg px-2 py-1.5"
                style={{ backgroundColor: theme.inputBg }}>
                <span className="text-lg">{h.avatar}</span>
                <span className="flex-1 truncate" style={{ color: theme.textPrimary }}>@{h.username}</span>
                <span className="font-bold" style={{ color: theme.textPrimary }}>{h.amount} шт</span>
                <span style={{ color: theme.textMuted }}>{h.pct}%</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
      
      {/* ===== Трейды история ===== */}
      {trades.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl p-4 transition-colors"
          style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.bgCardBorder}` }}>
          <p className="text-sm font-semibold mb-3" style={{ color: theme.textPrimary }}>📈 История трейдов</p>
          <TradeHistoryChart trades={trades} />
        </motion.div>
      )}
      
      {/* ===== Premium ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl overflow-hidden transition-colors"
        style={{
          backgroundColor: user.premium ? theme.accentGold + '06' : theme.bgCard,
          border: `1px solid ${user.premium ? theme.accentGold + '25' : theme.bgCardBorder}`,
        }}>
        {user.premium && (
          <div className="px-4 py-3"
            style={{ background: 'linear-gradient(135deg, #FFD70015, #FF8C0015)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} style={{ color: '#FFD700' }} />
              <span className="font-bold text-sm" style={{ color: '#FFD700' }}>Premium активен</span>
            </div>
            <p className="text-[10px]" style={{ color: theme.textSecondary }}>
              Осталось {Math.max(0, Math.ceil((user.premiumExpiresAt - Date.now()) / 86400000))} дней
            </p>
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown size={18} style={{ color: theme.accentGold }} />
            <span className="font-semibold text-sm" style={{ color: theme.textPrimary }}>Premium</span>
            {user.premium && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                style={{ backgroundColor: theme.accentGold + '20', color: theme.accentGold }}>ACTIVE</span>
            )}
          </div>
          {!user.premium ? (
            <>
              <ul className="text-xs space-y-1.5 mb-3" style={{ color: theme.textSecondary }}>
                <li>♾️ Безлимитные трейды/день</li>
                <li>📊 Advanced чарты (RSI, MA, PDF)</li>
                <li>⭐ VIP маркет</li>
                <li>💰 +25% дивиденды, APY 15-20%</li>
                <li>🚫 Без рекламы</li>
                <li>⚡ Приоритет ордеров</li>
                <li>🏆 VIP-квесты x2</li>
                <li>🤖 AI-советник</li>
                <li>👥 Создание пулов + ранги</li>
              </ul>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handlePremium}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                style={{ background: 'linear-gradient(135deg, #FFD700, #FF8C00)', color: '#000', boxShadow: '0 4px 15px rgba(255,215,0,0.3)' }}>
                👑 Подписаться — 500 $KARMA/мес
              </motion.button>
            </>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label: 'Дивиденды', value: '+25%', color: theme.accent },
                  { label: 'Трейды', value: '∞', color: theme.accentGold },
                  { label: 'APY', value: '15-20%', color: theme.accent },
                ].map((s, i) => (
                  <div key={i} className="rounded-lg py-2 text-center" style={{ backgroundColor: theme.inputBg }}>
                    <p className="text-[9px]" style={{ color: theme.textMuted }}>{s.label}</p>
                    <p className="font-bold text-xs" style={{ color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handlePremium}
                className="w-full py-2.5 rounded-xl text-xs font-medium transition-all"
                style={{ backgroundColor: theme.accentGold + '15', color: theme.accentGold }}>
                Управление подпиской →
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
      
      {/* ===== Настройки ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="rounded-2xl p-4 space-y-3 transition-colors"
        style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.bgCardBorder}` }}>
        <p className="font-semibold text-sm mb-1" style={{ color: theme.textPrimary }}>⚙️ Настройки</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm" style={{ color: theme.textPrimary }}>
            {mode === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
            <span>{mode === 'dark' ? 'Тёмная тема' : 'Светлая тема'}</span>
          </div>
          <button onClick={toggleTheme}
            className="w-10 h-5 rounded-full transition-all relative"
            style={{ backgroundColor: mode === 'dark' ? theme.accent : theme.inputBg }}>
            <div className="w-4 h-4 rounded-full bg-white shadow-sm absolute top-0.5 transition-all"
              style={{ left: mode === 'dark' ? 22 : 2 }} />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm" style={{ color: theme.textPrimary }}>
            <Bell size={14} /><span>Уведомления</span>
          </div>
          <button onClick={() => updateUser({ notifications: !user.notifications })}
            className="w-10 h-5 rounded-full transition-all relative"
            style={{ backgroundColor: user.notifications ? theme.accent : theme.inputBg }}>
            <div className="w-4 h-4 rounded-full bg-white shadow-sm absolute top-0.5 transition-all"
              style={{ left: user.notifications ? 22 : 2 }} />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm" style={{ color: theme.textPrimary }}>
            {user.privacyHidden ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>Скрыть мои акции</span>
          </div>
          <button onClick={() => updateUser({ privacyHidden: !user.privacyHidden })}
            className="w-10 h-5 rounded-full transition-all relative"
            style={{ backgroundColor: user.privacyHidden ? theme.accent : theme.inputBg }}>
            <div className="w-4 h-4 rounded-full bg-white shadow-sm absolute top-0.5 transition-all"
              style={{ left: user.privacyHidden ? 22 : 2 }} />
          </button>
        </div>
        
        <hr style={{ borderColor: theme.bgCardBorder }} />

        <div className="flex items-center gap-2 text-xs pt-1" style={{ color: theme.textMuted }}>
          <Shield size={12} /><span>TON Wallet: mock_0x...{user.id.slice(-4)}</span>
        </div>
      </motion.div>
    </div>
  );
}

/* === Shareholders bar chart === */
function ShareholderBar({ holders }: { holders: Array<{ username: string; avatar: string; amount: number; pct: string }> }) {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colors = ['#00FF7F', '#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA', '#F472B6'];
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = 24;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    
    const total = holders.reduce((s, h) => s + h.amount, 0);
    if (total === 0) return;
    let x = 0;
    holders.forEach((holder, i) => {
      const width = (holder.amount / total) * w;
      ctx.fillStyle = colors[i % colors.length];
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
  }, [holders]);
  void theme;
  
  return <canvas ref={canvasRef} className="w-full rounded-lg mb-2" style={{ height: 24 }} />;
}

/* === Trade History Chart === */
function TradeHistoryChart({ trades }: { trades: Array<{ timestamp: number; price: number; amount: number; side: string; fee: number }> }) {
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
    
    const recent = trades.slice(-20);
    const maxAmt = Math.max(...recent.map(t => t.price * t.amount));
    
    const barW = Math.max(4, (w / recent.length) - 2);
    recent.forEach((t, i) => {
      const val = t.price * t.amount;
      const barH = (val / maxAmt) * (h - 8);
      const x = (i / recent.length) * w + 1;
      const y = h - barH - 4;
      ctx.fillStyle = t.side === 'buy' ? theme.accent + 'AA' : theme.danger + 'AA';
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 2);
      ctx.fill();
    });
  }, [trades, theme]);
  
  return <canvas ref={canvasRef} className="w-full" style={{ height: 80 }} />;
}
