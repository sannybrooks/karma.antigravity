/* ===== Экран Rewards — Квесты (VIP x2), Дивиденды, Стейкинг, Premium ===== */
/* AI-советник вынесен на отдельный экран AdvisorScreen */
import { useState, useMemo, useRef, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useTheme } from '../../store/themeStore';
import { Gift, Lock, Unlock, Clock, Star, Target, CheckCircle, Crown, Sparkles, ChevronDown, ChevronUp, TrendingUp, Zap, History, Layer, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RewardsProps {
  onOpenPremium?: () => void;
}

import type { User, Share, Holding, Trade } from '../../types';

export function RewardsScreen({ onOpenPremium }: RewardsProps) {
  const {
    user, unclaimedDividends, dividendRecords, claimDividends, lastDividendCalc, nextDividendTime,
    stake, unstake, getStakingReward, holdings, shares,
    dailyQuests, claimQuestReward, trades, addNotification, referralRecords,
    stakingHistory, getStakingAPY, claimStakingReward, claimReferralEarnings,
  } = useGameStore();
  const { theme } = useTheme();

  const isPremium = user.premium && user.premiumExpiresAt > Date.now();

  const [stakeAmount, setStakeAmount] = useState(100);
  const [showStaking, setShowStaking] = useState(false);
  const [showDividendDetails, setShowDividendDetails] = useState(false);
  const [showStakingHistory, setShowStakingHistory] = useState(false);
  const [timeUntilDividends, setTimeUntilDividends] = useState('');
  const [showDailyQuests, setShowDailyQuests] = useState(false);
  const [showRefTasks, setShowRefTasks] = useState(false);
  
  // Реферальные челленджи
  const totalRefs = user.totalFriendsInvited || 0;
  const activeRefs = referralRecords.filter(r => r.isActive).length;
  const [claimedRefChallenges, setClaimedRefChallenges] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('km_ref_challenges');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  
  const refChallenges = [
    { id: 'rc1', title: 'Пригласи 3 друзей', target: 3, current: totalRefs, reward: 200, icon: '👥' },
    { id: 'rc2', title: 'Пригласи 5 друзей', target: 5, current: totalRefs, reward: 500, icon: '🌟', bonus: 'Premium день' },
    { id: 'rc3', title: 'Пригласи 10 друзей', target: 10, current: totalRefs, reward: 1000, icon: '👑', bonus: 'Бейдж King' },
    { id: 'rc4', title: '3 активных реферала', target: 3, current: activeRefs, reward: 300, icon: '🔥' },
    { id: 'rc5', title: 'Пригласи 15 друзей', target: 15, current: totalRefs, reward: 2000, icon: '💎' },
  ];

  // Получаем фиксированный APY (в день)
  const currentAPY = useMemo(() => getStakingAPY(), [getStakingAPY, user.staked, user.stakedAt, user.premium, user.premiumExpiresAt]);
  
  // APY в процентах (для отображения)
  const apyPercent = useMemo(() => (currentAPY * 100).toFixed(2), [currentAPY]);
  
  // Недельный APY (для отображения)
  const weeklyAPY = useMemo(() => (currentAPY * 7 * 100).toFixed(1), [currentAPY]);

  // Вычисляем стейкинг награду
  const stakingReward = useMemo(() => getStakingReward(), [getStakingReward, user.staked, user.stakedAt]);

  // Проверяем доступна ли награда (прошло 24 часа)
  const stakingRewardAvailable = useMemo(() => {
    if (user.staked <= 0) return false;
    const lastClaimTime = user.lastStakingClaim || user.stakedAt;
    if (!lastClaimTime) return false;
    const hoursSinceClaim = (Date.now() - lastClaimTime) / 3600000;
    return hoursSinceClaim >= 24;
  }, [user.staked, user.lastStakingClaim, user.stakedAt]);

  // Таймер до доступности награды (ЧЧ:ММ:СС)
  const [stakingTimer, setStakingTimer] = useState('');
  
  useEffect(() => {
    const updateTimer = () => {
      if (user.staked <= 0) {
        setStakingTimer('00:00:00');
        return;
      }
      
      // Используем lastStakingClaim или stakedAt (что новее)
      const lastClaimTime = user.lastStakingClaim || user.stakedAt;
      if (!lastClaimTime) {
        setStakingTimer('24:00:00');
        return;
      }
      
      const hoursSinceClaim = (Date.now() - lastClaimTime) / 3600000;
      
      if (hoursSinceClaim >= 24) {
        setStakingTimer('00:00:00');
      } else {
        const remainingHours = 24 - hoursSinceClaim;
        const hours = Math.floor(remainingHours);
        const minutes = Math.floor((remainingHours - hours) * 60);
        const seconds = Math.floor(((remainingHours - hours) * 60 - minutes) * 60);
        setStakingTimer(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [user.staked, user.lastStakingClaim, user.stakedAt]);

  // Прогресс кулдауна (7 дней = 604800000 мс)
  const cooldownProgress = useMemo(() => {
    if (!user.stakedAt || user.staked <= 0) return 0;
    const now = Date.now();
    const timePassed = now - user.stakedAt;
    const cooldownTime = 7 * 86400000;
    return Math.min(100, (timePassed / cooldownTime) * 100);
  }, [user.stakedAt, user.staked]);

  // Дней в стейке
  const daysStaked = useMemo(() => {
    if (!user.stakedAt) return 0;
    return Math.floor((Date.now() - user.stakedAt) / 86400000);
  }, [user.stakedAt]);

  // Уровень стейкинга
  const stakingTier = useMemo(() => {
    const staked = user.staked;
    if (staked >= 5000) return { name: 'Diamond', icon: '💎', color: '#B9F2FF' };
    if (staked >= 1000) return { name: 'Platinum', icon: '🥈', color: '#E5E4E2' };
    if (staked >= 500) return { name: 'Gold', icon: '🥇', color: '#FFD700' };
    if (staked >= 100) return { name: 'Silver', icon: '🥈', color: '#C0C0C0' };
    return { name: 'Bronze', icon: '🥉', color: '#CD7F32' };
  }, [user.staked]);

  // Таймер до следующих дивидендов (2 часа для Premium, 4 часа для Free)
  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const timeRemaining = nextDividendTime - now;

      if (timeRemaining <= 0) {
        if (unclaimedDividends > 0) {
          setTimeUntilDividends('🔒 Соберите дивиденды');
        } else if (nextDividendTime < now - 60000) {
          // Если время вышло более 1 минуты назад, но дивидендов нет
          setTimeUntilDividends('⏳ Начисление...');
        } else {
          setTimeUntilDividends('✅ Готовы к начислению!');
        }
      } else {
        const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
        const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);

        if (hours > 0) {
          setTimeUntilDividends(`${hours}ч ${minutes}м ${seconds}с`);
        } else if (minutes > 0) {
          setTimeUntilDividends(`${minutes}м ${seconds}с`);
        } else {
          setTimeUntilDividends(`${seconds}с`);
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [nextDividendTime, unclaimedDividends]);

  const unstakeCooldown = useMemo(() => {
    if (!user.stakedAt) return null;
    const remaining = 7 * 86400000 - (Date.now() - user.stakedAt);
    if (remaining <= 0) return 0;
    return Math.ceil(remaining / 86400000);
  }, [user.stakedAt]);

  const recentDividends = dividendRecords.slice(-10).reverse();
  const completedNotClaimed = dailyQuests.filter(q => q.completed && !q.claimed).length;

  /* handleDownloadReport убран — заменён на встроенный подробный отчёт */

  return (
    <div className="px-4 pb-4 space-y-4">
      {/* ===== ЕЖЕДНЕВНЫЕ КВЕСТЫ ===== */}
      <div className="rounded-2xl p-4 transition-colors glass-card"
        style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.bgCardBorder}` }}>
        <button
          onClick={() => setShowDailyQuests(!showDailyQuests)}
          className="w-full flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target size={18} style={{ color: theme.accentGold }} />
            <span className="font-semibold text-sm" style={{ color: theme.textPrimary }}>Ежедневные задания</span>
            {isPremium && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                style={{ backgroundColor: '#FFD70020', color: '#FFD700' }}>x2 награда</span>
            )}
            {completedNotClaimed > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse"
                style={{ backgroundColor: theme.accent + '20', color: theme.accent }}>{completedNotClaimed} 🎁</span>
            )}
          </div>
          {showDailyQuests ? <ChevronUp size={16} style={{ color: theme.textMuted }} /> : <ChevronDown size={16} style={{ color: theme.textMuted }} />}
        </button>

        <AnimatePresence>
        {showDailyQuests && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden">
            <div className="space-y-2">
          {dailyQuests.map((quest, idx) => {
            const progressPct = Math.min(100, (quest.progress / quest.target) * 100);
            const isVIPQuest = quest.icon === '👑' || quest.title.startsWith('👑');
            return (
              <motion.div key={quest.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                className="rounded-xl p-3 transition-colors"
                style={{
                  backgroundColor: isVIPQuest ? '#FFD70008' : (quest.claimed ? theme.accent + '08' : theme.inputBg),
                  border: isVIPQuest ? '1px solid #FFD70030' : (quest.completed && !quest.claimed ? `1px solid ${theme.accent}40` : '1px solid transparent'),
                }}>
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{quest.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold truncate" style={{ color: quest.claimed ? theme.textMuted : theme.textPrimary }}>{quest.title}</p>
                      {isVIPQuest && <span className="text-[7px] px-1 py-0.5 rounded font-bold shrink-0" style={{ backgroundColor: '#FFD70020', color: '#FFD700' }}>VIP</span>}
                      {isPremium && !isVIPQuest && <span className="text-[7px] px-1 py-0.5 rounded font-bold shrink-0" style={{ backgroundColor: theme.accent + '20', color: theme.accent }}>x2</span>}
                    </div>
                    <p className="text-[10px] truncate" style={{ color: theme.textMuted }}>{quest.description}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: theme.inputBg }}>
                        <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 0.5 }}
                          style={{ backgroundColor: isVIPQuest ? '#FFD700' : (quest.completed ? theme.accent : theme.accentGold) }} />
                      </div>
                      <span className="text-[9px] font-mono shrink-0" style={{ color: theme.textMuted }}>{quest.progress}/{quest.target}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    {quest.claimed ? (
                      <CheckCircle size={20} style={{ color: theme.accent }} />
                    ) : quest.completed ? (
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => claimQuestReward(quest.id)}
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold animate-pulse transition-all"
                        style={{ backgroundColor: isVIPQuest ? '#FFD700' : theme.accent, color: '#000' }}>
                        +{isPremium ? quest.reward * 2 : quest.reward} $K
                      </motion.button>
                    ) : (
                      <div className="text-right">
                        <p className="text-[10px] font-bold" style={{ color: isVIPQuest ? '#FFD700' : theme.accentGold }}>
                          {isPremium ? quest.reward * 2 : quest.reward} $K
                          {isPremium && !isVIPQuest && <span className="line-through text-[8px] ml-1" style={{ color: theme.textMuted }}>{quest.reward}</span>}
                        </p>
                        <p className="text-[8px]" style={{ color: theme.textMuted }}>+{isPremium ? quest.karmaReward * 2 : quest.karmaReward} карма</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* ===== РЕФЕРАЛЬНЫЕ ЗАДАНИЯ ===== */}
      <div className="rounded-2xl p-4 transition-colors glass-card"
        style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.bgCardBorder}` }}>
        <button
          onClick={() => setShowRefTasks(!showRefTasks)}
          className="w-full flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy size={18} style={{ color: theme.accentGold }} />
            <span className="font-semibold text-sm" style={{ color: theme.textPrimary }}>Реферальные задания</span>
            {isPremium && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                style={{ backgroundColor: '#FFD70020', color: '#FFD700' }}>x2 награда</span>
            )}
          </div>
          {showRefTasks ? <ChevronUp size={16} style={{ color: theme.textMuted }} /> : <ChevronDown size={16} style={{ color: theme.textMuted }} />}
        </button>

        <AnimatePresence>
        {showRefTasks && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden">
            <div className="space-y-2">
          {refChallenges.map((ch, ci) => {
            const progress = Math.min(ch.current / ch.target, 1);
            const done = ch.current >= ch.target;
            const isClaimed = claimedRefChallenges.has(ch.id);
            return (
              <motion.div key={ch.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: ci * 0.05 }}
                className="rounded-xl p-3 transition-colors"
                style={{
                  backgroundColor: isClaimed ? theme.accent + '08' : theme.inputBg,
                  border: done && !isClaimed ? `1px solid ${theme.accent}40` : '1px solid transparent',
                }}>
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{ch.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold truncate" style={{ color: isClaimed ? theme.textMuted : theme.textPrimary }}>
                        {ch.title}
                      </p>
                      {ch.bonus && (
                        <span className="text-[7px] px-1.5 py-0.5 rounded font-bold shrink-0"
                          style={{ backgroundColor: theme.accentGold + '20', color: theme.accentGold }}>
                          {ch.bonus}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: theme.inputBg }}>
                        <motion.div
                          className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress * 100}%` }}
                          transition={{ duration: 0.5 }}
                          style={{ backgroundColor: done ? theme.accent : theme.accentGold }} />
                      </div>
                      <span className="text-[9px] font-mono shrink-0" style={{ color: theme.textMuted }}>
                        {ch.current}/{ch.target}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    {isClaimed ? (
                      <CheckCircle size={20} style={{ color: theme.accent }} />
                    ) : done ? (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const cs = useGameStore.getState();
                          useGameStore.setState({
                            user: { ...cs.user, balance: cs.user.balance + ch.reward, karma: cs.user.karma + Math.floor(ch.reward * 0.1) },
                          });
                          const nc = new Set([...claimedRefChallenges, ch.id]);
                          setClaimedRefChallenges(nc);
                          localStorage.setItem('km_ref_challenges', JSON.stringify([...nc]));
                          addNotification(`🎉 +${ch.reward} $KARMA получено!`, 'success');
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold animate-pulse transition-all"
                        style={{ backgroundColor: theme.accent, color: '#000' }}>
                        +{ch.reward} $K
                      </motion.button>
                    ) : (
                      <div className="text-right">
                        <p className="text-[10px] font-bold" style={{ color: theme.accentGold }}>+{ch.reward} $K</p>
                        <p className="text-[8px]" style={{ color: theme.textMuted }}>+{Math.floor(ch.reward * 0.1)} карма</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* ===== РЕФЕРАЛЬНЫЕ ДОХОДЫ — КНОПКА ЗАБРАТЬ ===== */}
      {user.referralPendingEarnings > 0 && (
        <div className="rounded-2xl p-4 transition-colors glass-card"
          style={{ backgroundColor: theme.accentGold + '08', border: `1px solid ${theme.accentGold}30` }}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: theme.accentGold + '20' }}>
                <span className="text-xl">💰</span>
              </div>
              <div>
                <div className="text-xs font-bold" style={{ color: theme.textSecondary }}>РЕФЕРАЛЬНЫЕ ДОХОДЫ</div>
                <div className="text-lg font-bold" style={{ color: theme.accentGold }}>
                  {user.referralPendingEarnings.toFixed(1)} $K
                </div>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={claimReferralEarnings}
              className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all shrink-0"
              style={{ backgroundColor: theme.accentGold, color: '#000' }}>
              💸 Забрать
            </motion.button>
          </div>
        </div>
      )}

      {/* ===== CLAIM ALL — Дивиденды ===== */}
      <div className="rounded-2xl p-4 transition-colors glass-card"
        style={{ backgroundColor: theme.accent + '08', border: `1px solid ${theme.accent}30` }}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: theme.accent + '20' }}>
              <Gift size={20} style={{ color: theme.accent }} />
            </div>
            <div>
              <div className="text-xs font-bold" style={{ color: theme.textSecondary }}>ДИВИДЕНДЫ</div>
              <div className="text-lg font-bold" style={{ color: theme.accent }}>
                {unclaimedDividends.toFixed(2)} $K
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {isPremium && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                style={{ backgroundColor: '#FFD70020', color: '#FFD700' }}>👑 +25%</span>
            )}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={claimDividends}
              disabled={unclaimedDividends <= 0}
              className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 shrink-0"
              style={{ backgroundColor: unclaimedDividends > 0 ? theme.accent : theme.inputBg, color: unclaimedDividends > 0 ? '#000' : theme.textMuted }}>
              {unclaimedDividends > 0 ? '🎉 Забрать' : '⏳ Ожидание'}
            </motion.button>
          </div>
        </div>

        {/* Таймер до следующих дивидендов */}
        <div className="flex items-center gap-1 mt-3 pt-3" style={{ borderTop: `1px solid ${theme.accent}15` }}>
          <Clock size={12} style={{ color: theme.textMuted }} />
          <span className="text-xs" style={{ color: timeUntilDividends.includes('Готовы') || timeUntilDividends.includes('Соберите') || timeUntilDividends.includes('Начисление') ? theme.accent : theme.textMuted }}>
            {unclaimedDividends > 0
              ? '🔒 Соберите текущие дивиденды'
              : `Следующие через: ${timeUntilDividends}`}
          </span>
        </div>

        {recentDividends.length > 0 && (
          <button onClick={() => setShowDividendDetails(!showDividendDetails)}
            className="mt-2 text-xs flex items-center justify-center gap-1 w-full" style={{ color: theme.textMuted }}>
            Детализация {showDividendDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}

        <AnimatePresence>
          {showDividendDetails && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-3 space-y-1 text-left">
                {recentDividends.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: theme.inputBg }}>
                    <span style={{ color: theme.textSecondary }}>{d.shareTicker}</span>
                    <span className="font-medium" style={{ color: theme.accent }}>+{d.amount.toFixed(2)} $K</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===== СТЕЙКИНГ — НОВЫЙ UI ===== */}
      <div className="rounded-2xl p-4 transition-colors glass-card"
        style={{ backgroundColor: theme.bgCard, border: `1px solid ${stakingTier.color}30` }}>
        
        {/* Хэдер с уровнем */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${stakingTier.color}20` }}>
              <span className="text-lg">{stakingTier.icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm" style={{ color: theme.textPrimary }}>Стейкинг</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{ backgroundColor: `${stakingTier.color}20`, color: stakingTier.color }}>
                  {stakingTier.name}
                </span>
              </div>
              <p className="text-[10px]" style={{ color: theme.textMuted }}>APY: {apyPercent}%/день ({weeklyAPY}%/нед)</p>
            </div>
          </div>
          <button onClick={() => setShowStaking(!showStaking)} className="text-xs font-medium" style={{ color: theme.accent }}>
            {showStaking ? 'Скрыть' : 'Управление'}
          </button>
        </div>

        {/* Основная сумма */}
        <div className="rounded-2xl p-4 mb-4 text-center"
          style={{ background: `linear-gradient(135deg, ${stakingTier.color}15, ${stakingTier.color}05)` }}>
          <p className="text-[10px] mb-1" style={{ color: theme.textMuted }}>Застейкано</p>
          <p className="text-3xl font-bold" style={{ color: stakingTier.color }}>{user.staked > 0 ? user.staked.toFixed(2) : '0.00'} <span className="text-lg">$K</span></p>
          {user.staked > 0 && (
            <div className="flex items-center justify-center gap-3 mt-3 text-xs">
              <span style={{ color: theme.textMuted }}>📊 {daysStaked} дн.</span>
              <span style={{ color: theme.textMuted }}>💰 {stakingReward.toFixed(2)} $K</span>
              <span style={{ color: theme.textMuted }}>🔒 {cooldownProgress.toFixed(0)}%</span>
            </div>
          )}
        </div>

        {/* Прогресс-бар кулдауна */}
        {user.staked > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px]" style={{ color: theme.textMuted }}>Прогресс разблокировки</span>
              <span className="text-[10px] font-bold" style={{ color: cooldownProgress >= 100 ? theme.accent : theme.textMuted }}>
                {cooldownProgress >= 100 ? '✅ Готово' : `${(7 - Math.floor(cooldownProgress / 100 * 7)).toFixed(0)} дн. осталось`}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.inputBg }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${cooldownProgress}%`, backgroundColor: cooldownProgress >= 100 ? theme.accent : stakingTier.color }} />
            </div>
          </div>
        )}

        {/* Управление */}
        <AnimatePresence>
          {showStaking && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="space-y-3 pt-3" style={{ borderTop: `1px solid ${theme.bgCardBorder}` }}>
                
                {/* Внести в стейкинг */}
                {user.balance > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs" style={{ color: theme.textSecondary }}>Внести в стейкинг</label>
                      <span className="text-[10px]" style={{ color: theme.textMuted }}>Баланс: {user.balance.toFixed(1)} $K</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <input type="range" min={1} max={Math.max(1, Math.floor(user.balance))} value={stakeAmount}
                        onChange={e => setStakeAmount(Number(e.target.value))} className="flex-1" />
                      <input type="number" value={stakeAmount} onChange={e => setStakeAmount(Math.max(0, Number(e.target.value)))}
                        className="w-24 rounded-lg px-2 py-1 text-sm text-right outline-none"
                        style={{ backgroundColor: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.textPrimary }} />
                    </div>
                    <div className="flex gap-1 mb-2">
                      {[25, 50, 75, 100].map(pct => (
                        <button key={pct} onClick={() => setStakeAmount(Math.floor(user.balance * pct / 100))}
                          className="flex-1 py-1.5 rounded-lg text-[10px] font-bold"
                          style={{ backgroundColor: theme.inputBg, color: theme.textMuted }}>{pct}%</button>
                      ))}
                    </div>
                    <div className="rounded-lg p-2 mb-2" style={{ backgroundColor: theme.inputBg }}>
                      <div className="flex justify-between text-[10px]">
                        <span style={{ color: theme.textMuted }}>Доход/день</span>
                        <span className="font-bold" style={{ color: theme.accent }}>~{(stakeAmount * currentAPY).toFixed(2)} $K</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span style={{ color: theme.textMuted }}>Доход/неделю</span>
                        <span className="font-bold" style={{ color: theme.accent }}>~{(stakeAmount * currentAPY * 7).toFixed(2)} $K</span>
                      </div>
                    </div>
                    <motion.button whileTap={{ scale: 0.95 }}
                      onClick={() => { stake(stakeAmount); setStakeAmount(100); }}
                      disabled={stakeAmount > user.balance || stakeAmount <= 0}
                      className="w-full py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-30"
                      style={{ backgroundColor: stakingTier.color, color: '#000' }}>
                      🔒 Застейкать {stakeAmount} $K
                    </motion.button>
                  </div>
                )}

                {/* Забрать награду (только если прошло 24 часа) */}
                {user.staked > 0 && stakingReward > 0.01 && stakingRewardAvailable && (
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => claimStakingReward()}
                    className="w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                    style={{ backgroundColor: theme.accent + '20', color: theme.accent }}>
                    💰 {isPremium && user.autoCompound ? 'Реинвестировать' : 'Забрать'} награду (+{stakingReward.toFixed(2)} $K)
                  </motion.button>
                )}

                {/* Инфо если награда ещё не доступна */}
                {user.staked > 0 && !stakingRewardAvailable && (
                  <div className="rounded-xl p-3 text-center" style={{ backgroundColor: theme.inputBg }}>
                    <p className="text-xs" style={{ color: theme.textMuted }}>⏳ Награда будет доступна через</p>
                    <p className="text-lg font-mono font-bold" style={{ color: theme.accent }}>
                      {stakingTimer}
                    </p>
                    {isPremium && !user.autoCompound && (
                      <p className="text-[10px] mt-1" style={{ color: theme.textMuted }}>
                        Включите Auto-compound для авто-сбора каждые 24ч
                      </p>
                    )}
                  </div>
                )}

                {/* Auto-compound переключатель (только Premium) */}
                {user.staked > 0 && isPremium && (
                  <div className="flex items-center justify-between px-1 py-2 rounded-lg" style={{ backgroundColor: theme.inputBg }}>
                    <div className="flex items-center gap-2">
                      <Zap size={14} style={{ color: user.autoCompound ? theme.accent : theme.textMuted }} />
                      <span className="text-xs" style={{ color: theme.textSecondary }}>Auto-compound</span>
                    </div>
                    <button onClick={() => {
                        const { updateUser } = useGameStore.getState();
                        updateUser({ autoCompound: !user.autoCompound });
                        addNotification(user.autoCompound ? 'Auto-compound выключен' : 'Auto-compound включён', 'info');
                      }}
                      className="w-11 h-6 rounded-full transition-all relative"
                      style={{ backgroundColor: user.autoCompound ? theme.accent : theme.inputBg }}>
                      <div className="w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all"
                        style={{ left: user.autoCompound ? 24 : 2 }} />
                    </button>
                  </div>
                )}

                {/* Анстейк (только Premium) */}
                {user.staked > 0 && isPremium && (
                  <div className="rounded-xl p-3" style={{ backgroundColor: theme.danger + '06', border: `1px solid ${theme.danger}15` }}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs font-semibold" style={{ color: theme.textPrimary }}>Анстейк</p>
                        <p className="text-[10px]" style={{ color: theme.textMuted }}>
                          {user.staked.toFixed(1)} $K + {stakingReward.toFixed(2)} $K награда
                        </p>
                      </div>
                      {cooldownProgress < 100 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                          style={{ backgroundColor: theme.danger + '20', color: theme.danger }}>
                          Штраф 1%
                        </span>
                      )}
                    </div>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => unstake()}
                      className="w-full py-2 rounded-xl text-sm font-bold transition-all"
                      style={{ backgroundColor: theme.danger + '15', color: theme.danger }}>
                      🔓 Забрать всё ({(user.staked + stakingReward).toFixed(2)} $K)
                    </motion.button>
                  </div>
                )}

                {/* История */}
                {stakingHistory.length > 0 && (
                  <div>
                    <button onClick={() => setShowStakingHistory(!showStakingHistory)}
                      className="flex items-center justify-between w-full text-xs py-2"
                      style={{ color: theme.textMuted }}>
                      <span className="flex items-center gap-1"><History size={12} /> История операций</span>
                      {showStakingHistory ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                    {showStakingHistory && (
                      <div className="max-h-40 overflow-auto space-y-1 mt-1">
                        {stakingHistory.slice(-10).reverse().map((record, i) => (
                          <div key={i} className="flex items-center justify-between text-[10px] p-2 rounded-lg"
                            style={{ backgroundColor: theme.inputBg }}>
                            <div className="flex items-center gap-1">
                              <span>{record.type === 'stake' ? '🔒' : record.type === 'unstake' ? '🔓' : record.type === 'claim' ? '💰' : '🔄'}</span>
                              <span style={{ color: theme.textSecondary }}>{new Date(record.timestamp).toLocaleDateString()}</span>
                            </div>
                            <span className="font-bold" style={{ color: record.type === 'unstake' || record.type === 'claim' ? theme.accent : theme.textPrimary }}>
                              {record.type === 'stake' ? '-' : '+'}{record.amount.toFixed(1)} $K
                              {record.reward && ` (+${record.reward.toFixed(1)})`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===== Premium баннер (для Free) ===== */}
      {!isPremium && (
        <div className="rounded-2xl overflow-hidden transition-colors glass-card" style={{ border: '1px solid #FFD70025' }}>
          <div className="p-3 text-center" style={{ backgroundColor: '#FFD70008' }}>
            <p className="text-[9px] mb-1" style={{ color: theme.textMuted }}>📢 Реклама</p>
            <div className="rounded-xl p-3 mb-2" style={{ backgroundColor: theme.inputBg }}>
              <p className="text-xs" style={{ color: theme.textSecondary }}>
                🎁 Больше наград с Premium!<br />+25% дивиденды, APY 15-20%, VIP квесты x2, AI-советник
              </p>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={onOpenPremium}
              className="w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, #FFD700, #FF8C00)', color: '#000' }}>
              <Crown size={14} /> Убрать рекламу + Premium
            </motion.button>
          </div>
        </div>
      )}

      {/* ===== Premium бонусы (если активен) ===== */}
      {isPremium && (
        <div className="rounded-2xl p-4 transition-colors glass-card"
          style={{ background: 'linear-gradient(135deg, #FFD70008, #FF8C0008)', border: '1px solid #FFD70020' }}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} style={{ color: '#FFD700' }} />
            <span className="font-semibold text-sm" style={{ color: theme.textPrimary }}>Ваши Premium бонусы</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Дивиденды', value: '+25%', icon: '💰', active: true },
              { label: 'APY стейкинг', value: '15-20%', icon: '🔒', active: user.staked > 0 },
              { label: 'Квесты', value: 'x2 награда', icon: '🏆', active: true },
              { label: 'AI-советник', value: 'Активен', icon: '🤖', active: true },
              { label: 'Трейды/день', value: '♾️', icon: '♾️', active: true },
              { label: 'VIP маркет', value: 'Доступен', icon: '⭐', active: true },
            ].map((s, i) => (
              <div key={i} className="rounded-lg p-2 flex items-center gap-2" style={{ backgroundColor: theme.inputBg }}>
                <span className="text-sm">{s.icon}</span>
                <div>
                  <p className="text-[9px]" style={{ color: theme.textMuted }}>{s.label}</p>
                  <p className="font-bold text-[10px]" style={{ color: s.active ? theme.accent : theme.textMuted }}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
