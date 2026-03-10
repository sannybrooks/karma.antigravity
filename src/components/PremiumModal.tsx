/* ===== PremiumModal — Полный экран премиум-подписки с перками и оплатой ===== */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useTheme } from '../store/themeStore';
import {
  X, Crown, Zap, BarChart3, Star, Shield, Palette, Rocket,
  Users, MessageCircle, Gift, Lock, Unlock, ChevronRight, Check,
  Sparkles, TrendingUp, Award
} from 'lucide-react';

/* 10 Premium Perks */
const PREMIUM_PERKS = [
  {
    id: 'unlimited_trades',
    icon: '♾️',
    lucideIcon: Zap,
    title: 'Безлимитные трейды',
    description: 'Без ограничения 50 сделок/день',
    free: '50/день',
    premium: 'Без лимита',
    color: '#00FF7F',
  },
  {
    id: 'advanced_charts',
    icon: '📊',
    lucideIcon: BarChart3,
    title: 'Advanced Charts & Analytics',
    description: 'RSI, MA индикаторы, PDF-отчёты, алерты',
    free: 'Базовые свечи',
    premium: 'RSI + MA + PDF',
    color: '#4ECDC4',
  },
  {
    id: 'vip_market',
    icon: '⭐',
    lucideIcon: Star,
    title: 'VIP Маркет',
    description: 'Эксклюзивные акции топ-инфлюенсеров',
    free: 'Стандартный маркет',
    premium: 'VIP акции',
    color: '#FFD700',
  },
  {
    id: 'boosted_dividends',
    icon: '💰',
    lucideIcon: TrendingUp,
    title: 'Бустнутые дивиденды',
    description: '+25% к дивидендам, APY стейкинга 15-20%',
    free: '1-5% дивиденды',
    premium: '+25% бонус',
    color: '#00FF7F',
  },
  {
    id: 'ad_free',
    icon: '🚫',
    lucideIcon: Shield,
    title: 'Без рекламы',
    description: 'Полностью без рекламных баннеров',
    free: 'С рекламой',
    premium: 'Без рекламы',
    color: '#A78BFA',
  },
  {
    id: 'custom_themes',
    icon: '🎨',
    lucideIcon: Palette,
    title: 'Кастомные аватары и темы',
    description: 'NFT-аватары, золотая/алмазная/неоновая темы',
    free: 'Базовые',
    premium: 'Gold, Diamond, Neon',
    color: '#F472B6',
  },
  {
    id: 'priority_orders',
    icon: '⚡',
    lucideIcon: Rocket,
    title: 'Приоритет ордеров',
    description: 'Ваши ордера исполняются первыми',
    free: 'Обычная очередь',
    premium: 'Front-of-line',
    color: '#FBBF24',
  },
  {
    id: 'exclusive_quests',
    icon: '🏆',
    lucideIcon: Award,
    title: 'Эксклюзивные квесты',
    description: 'VIP-квесты с x2 наградой, ранний доступ к событиям',
    free: 'Базовые квесты',
    premium: 'VIP x2 + early access',
    color: '#60A5FA',
  },
  {
    id: 'bigger_pools',
    icon: '👥',
    lucideIcon: Users,
    title: 'Создание пулов + ранги',
    description: 'Только Premium может создавать пулы. До 50 участников, ранги с бонусами, аналитика',
    free: 'Только вступление',
    premium: 'Создание + управление рангами',
    color: '#34D399',
  },
  {
    id: 'ai_advisor',
    icon: '🤖',
    lucideIcon: MessageCircle,
    title: 'AI-советник + инсайты',
    description: 'Персональные торговые советы и еженедельные отчёты',
    free: 'FAQ',
    premium: 'AI-tips + push',
    color: '#F97316',
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function PremiumModal({ isOpen, onClose }: Props) {
  const { user, subscribePremium } = useGameStore();
  const { theme } = useTheme();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPerk, setSelectedPerk] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Время до истечения
  const daysLeft = user.premium && user.premiumExpiresAt > 0
    ? Math.max(0, Math.ceil((user.premiumExpiresAt - Date.now()) / 86400000))
    : 0;

  useEffect(() => {
    if (isOpen) {
      setProcessing(false);
      setSuccess(false);
      setError(null);
    }
  }, [isOpen]);

  const handleSubscribe = async () => {
    setProcessing(true);
    setError(null);
    // Имитация TON-транзакции (2 секунды)
    await new Promise(r => setTimeout(r, 2000));
    
    const result = subscribePremium();
    setProcessing(false);
    
    if (result) {
      setError(result);
    } else {
      setSuccess(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
      // Авто-закрытие через 3 секунды после успешной покупки
      setTimeout(() => {
        onClose();
      }, 3500);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-end justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md rounded-t-3xl overflow-hidden glass-modal"
          style={{ backgroundColor: theme.bgSecondary, maxHeight: '95vh', overflowY: 'auto' }}
        >
          {/* Конфетти */}
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none z-[100]">
              {Array.from({ length: 50 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: -20,
                    rotate: 0,
                    scale: Math.random() * 0.5 + 0.5,
                  }}
                  animate={{
                    y: window.innerHeight + 20,
                    rotate: Math.random() * 720 - 360,
                    x: Math.random() * window.innerWidth,
                  }}
                  transition={{ duration: 2 + Math.random() * 2, ease: 'easeOut' }}
                  className="absolute w-3 h-3 rounded-sm"
                  style={{
                    backgroundColor: ['#FFD700', '#00FF7F', '#FF6B6B', '#A78BFA', '#4ECDC4', '#F472B6'][i % 6],
                  }}
                />
              ))}
            </div>
          )}

          {/* Ручка */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full" style={{ backgroundColor: theme.textMuted + '40' }} />
          </div>

          {/* Хэдер */}
          <div className="relative px-4 pb-4">
            <button onClick={onClose} className="absolute top-0 right-4 p-2 rounded-full z-10"
              style={{ backgroundColor: theme.inputBg }}>
              <X size={18} style={{ color: theme.textSecondary }} />
            </button>

            {/* Градиентный заголовок */}
            <div className="text-center pt-2 pb-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="inline-block"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: 'linear-gradient(135deg, #FFD700, #FF8C00)', boxShadow: '0 4px 20px rgba(255,215,0,0.3)' }}>
                  <Crown size={32} className="text-white" />
                </div>
              </motion.div>
              <h2 className="text-xl font-bold mb-1"
                style={{ background: 'linear-gradient(90deg, #FFD700, #FFA500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                KarmaMarket Premium
              </h2>
              <p className="text-xs" style={{ color: theme.textSecondary }}>
                Разблокируй все возможности биржи
              </p>
            </div>

            {/* Статус Premium */}
            {user.premium && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-xl p-3 mb-4 text-center"
                style={{ background: 'linear-gradient(135deg, #FFD70020, #FF8C0020)', border: '1px solid #FFD70030' }}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Sparkles size={16} style={{ color: '#FFD700' }} />
                  <span className="font-bold text-sm" style={{ color: '#FFD700' }}>Premium активен</span>
                </div>
                <p className="text-xs" style={{ color: theme.textSecondary }}>
                  Осталось {daysLeft} дней • Истекает {new Date(user.premiumExpiresAt).toLocaleDateString('ru')}
                </p>
              </motion.div>
            )}

            {/* Цена */}
            {!user.premium && (
              <div className="rounded-xl p-4 mb-4 text-center glass-card"
                style={{ backgroundColor: theme.inputBg, border: `1px solid ${theme.bgCardBorder}` }}>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div>
                    <span className="text-2xl font-bold" style={{ color: theme.accentGold }}>500</span>
                    <span className="text-sm font-medium ml-1" style={{ color: theme.accentGold }}>$KARMA</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: theme.accent + '15', color: theme.accent }}>
                    ~$5/мес
                  </span>
                </div>
                <p className="text-[10px]" style={{ color: theme.textMuted }}>
                  Баланс: {user.balance.toFixed(0)} $KARMA • Оплата через TON
                </p>
              </div>
            )}
          </div>

          {/* 10 Перков */}
          <div className="px-4 pb-4">
            <p className="text-sm font-semibold mb-3" style={{ color: theme.textPrimary }}>
              <Gift size={14} className="inline mr-1" /> 10 Premium привилегий
            </p>
            <div className="space-y-2">
              {PREMIUM_PERKS.map((perk, i) => {
                const isExpanded = selectedPerk === perk.id;
                const Icon = perk.lucideIcon;
                return (
                  <motion.div
                    key={perk.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl overflow-hidden glass-card"
                    style={{
                      backgroundColor: theme.bgCard,
                      border: `1px solid ${isExpanded ? perk.color + '40' : theme.bgCardBorder}`,
                    }}
                  >
                    <button
                      onClick={() => setSelectedPerk(isExpanded ? null : perk.id)}
                      className="w-full p-3 flex items-center gap-3 transition-all"
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: perk.color + '15' }}>
                        <Icon size={18} style={{ color: perk.color }} />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-xs font-semibold" style={{ color: theme.textPrimary }}>{perk.title}</p>
                        <p className="text-[10px] truncate" style={{ color: theme.textMuted }}>{perk.description}</p>
                      </div>
                      {user.premium ? (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: theme.accent + '20' }}>
                          <Check size={12} style={{ color: theme.accent }} />
                        </div>
                      ) : (
                        <ChevronRight size={14} style={{
                          color: theme.textMuted,
                          transform: isExpanded ? 'rotate(90deg)' : 'none',
                          transition: 'transform 0.2s',
                        }} />
                      )}
                    </button>

                    {/* Развёрнутое сравнение Free vs Premium */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-3 pt-0">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="rounded-lg p-2 text-center"
                                style={{ backgroundColor: theme.danger + '08', border: `1px solid ${theme.danger}15` }}>
                                <Lock size={12} className="mx-auto mb-1" style={{ color: theme.danger }} />
                                <p className="text-[9px] font-medium" style={{ color: theme.danger }}>Free</p>
                                <p className="text-[10px] font-bold" style={{ color: theme.textSecondary }}>{perk.free}</p>
                              </div>
                              <div className="rounded-lg p-2 text-center"
                                style={{ backgroundColor: perk.color + '08', border: `1px solid ${perk.color}20` }}>
                                <Unlock size={12} className="mx-auto mb-1" style={{ color: perk.color }} />
                                <p className="text-[9px] font-medium" style={{ color: perk.color }}>Premium</p>
                                <p className="text-[10px] font-bold" style={{ color: theme.textPrimary }}>{perk.premium}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Кнопка подписки */}
          <div className="px-4 pb-8 pt-2">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 p-3 rounded-xl text-xs text-center"
                style={{ backgroundColor: theme.danger + '15', color: theme.danger }}
              >
                ⚠️ {error}
              </motion.div>
            )}

            {success ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-4"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="text-5xl mb-3"
                >
                  👑
                </motion.div>
                <p className="text-lg font-bold mb-1"
                  style={{ background: 'linear-gradient(90deg, #FFD700, #FFA500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Добро пожаловать в Premium!
                </p>
                <p className="text-xs mb-4" style={{ color: theme.textSecondary }}>
                  Все 10 привилегий активированы
                </p>
                <button onClick={onClose}
                  className="w-full py-3 rounded-2xl font-bold text-sm active:scale-95 transition-all"
                  style={{ backgroundColor: theme.accent, color: '#000' }}>
                  Начать использовать ✨
                </button>
              </motion.div>
            ) : user.premium ? (
              <div className="text-center py-2">
                <p className="text-sm font-medium mb-3" style={{ color: theme.textSecondary }}>
                  Продлить на +30 дней?
                </p>
                <button onClick={handleSubscribe} disabled={processing}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm active:scale-95 transition-all disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #FFD700, #FF8C00)', color: '#000', boxShadow: '0 4px 15px rgba(255,215,0,0.3)' }}>
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        ⏳
                      </motion.div>
                      Обработка TON транзакции...
                    </span>
                  ) : (
                    '♻️ Продлить за 500 $KARMA'
                  )}
                </button>
              </div>
            ) : (
              <button onClick={handleSubscribe} disabled={processing || user.balance < 500}
                className="w-full py-3.5 rounded-2xl font-bold text-base active:scale-95 transition-all disabled:opacity-50"
                style={{
                  background: user.balance >= 500
                    ? 'linear-gradient(135deg, #FFD700, #FF8C00)'
                    : theme.inputBg,
                  color: user.balance >= 500 ? '#000' : theme.textMuted,
                  boxShadow: user.balance >= 500 ? '0 4px 20px rgba(255,215,0,0.3)' : 'none',
                }}>
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      ⏳
                    </motion.div>
                    Обработка TON...
                  </span>
                ) : user.balance < 500 ? (
                  `Нужно ещё ${(500 - user.balance).toFixed(0)} $KARMA`
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Crown size={18} /> Подписаться — 500 $KARMA
                  </span>
                )}
              </button>
            )}

            <p className="text-[10px] text-center mt-3" style={{ color: theme.textMuted }}>
              💎 Оплата через TON Connect • Auto-renew каждые 30 дней • 500 $KARMA = burn 40% + pool 60%
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
