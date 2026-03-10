/* =====================================================
   FriendsScreen.tsx — Друзья, Пулы, Рефералы
   С анимациями framer-motion + Фаза 1 (статистика, активность, история)
   ===================================================== */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Shield, ChevronDown, ChevronUp,
  Copy, Check, LogOut, Send, Zap, Heart,
  RefreshCw, Trophy, X
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useTheme } from '../../store/themeStore';
import { REFERRAL_TIERS } from '../../store/constants';

/* === Стикер-приглашение друга (Canvas) === */
function InviteStickerCanvas({ username, karma, level }: {
  username: string; karma: number; level: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = 280, h = 200;
    canvas.width = w * 2; canvas.height = h * 2; ctx.scale(2, 2);
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#0a1a0f'); grad.addColorStop(0.5, '#0d2818'); grad.addColorStop(1, '#1a0a2e');
    ctx.fillStyle = grad; ctx.beginPath(); ctx.roundRect(0, 0, w, h, 16); ctx.fill();
    const borderGrad = ctx.createLinearGradient(0, 0, w, h);
    borderGrad.addColorStop(0, '#00FF7F'); borderGrad.addColorStop(1, '#FFD700');
    ctx.strokeStyle = borderGrad; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(1, 1, w - 2, h - 2, 16); ctx.stroke();
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = `rgba(255,215,0,${Math.random() * 0.5 + 0.2})`;
      ctx.beginPath(); ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.5 + 0.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.font = '36px serif'; ctx.textAlign = 'center'; ctx.fillText('🚀', w / 2, 45);
    ctx.font = 'bold 18px system-ui'; ctx.fillStyle = '#00FF7F'; ctx.fillText('KarmaMarket', w / 2, 72);
    ctx.font = '12px system-ui'; ctx.fillStyle = '#9CA3AF'; ctx.fillText('Биржа социальной кармы', w / 2, 90);
    ctx.strokeStyle = 'rgba(0,255,127,0.3)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(40, 100); ctx.lineTo(w - 40, 100); ctx.stroke();
    ctx.font = 'bold 14px system-ui'; ctx.fillStyle = '#FFF';
    ctx.fillText(`@${username} приглашает тебя!`, w / 2, 122);
    ctx.font = '11px system-ui'; ctx.fillStyle = '#FFD700';
    ctx.fillText(`⭐ Карма: ${karma}  •  🏆 Уровень: ${level}`, w / 2, 142);
    ctx.fillStyle = '#121212'; ctx.beginPath(); ctx.roundRect(30, 152, w - 60, 30, 8); ctx.fill();
    ctx.strokeStyle = '#00FF7F'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(30, 152, w - 60, 30, 8); ctx.stroke();
    ctx.font = 'bold 12px system-ui'; ctx.fillStyle = '#00FF7F';
    ctx.fillText('🎁 Бонус: 100 $KARMA + 10 акций', w / 2, 172);
  }, [username, karma, level]);
  return <canvas ref={canvasRef} style={{ width: 280, height: 200, borderRadius: 16 }} />;
}

/* === Стикер-приглашение в ПУЛ (Canvas) === */
function PoolStickerCanvas({ poolName, username, memberCount }: {
  poolName: string; username: string; memberCount: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = 280, h = 200;
    canvas.width = w * 2; canvas.height = h * 2; ctx.scale(2, 2);
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#0a0f1a'); grad.addColorStop(0.5, '#0d1828'); grad.addColorStop(1, '#1a0a2e');
    ctx.fillStyle = grad; ctx.beginPath(); ctx.roundRect(0, 0, w, h, 16); ctx.fill();
    const borderGrad = ctx.createLinearGradient(0, 0, w, h);
    borderGrad.addColorStop(0, '#FFD700'); borderGrad.addColorStop(1, '#FF9500');
    ctx.strokeStyle = borderGrad; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(2, 2, w - 4, h - 4, 14); ctx.stroke();
    for (let i = 0; i < 25; i++) {
      ctx.fillStyle = `rgba(255,215,0,${Math.random() * 0.4 + 0.1})`;
      ctx.beginPath(); ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.5 + 0.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.font = '36px serif'; ctx.textAlign = 'center'; ctx.fillText('⚔️', w / 2, 42);
    ctx.font = 'bold 16px system-ui'; ctx.fillStyle = '#FFD700'; ctx.fillText('KarmaMarket Pool', w / 2, 68);
    ctx.strokeStyle = 'rgba(255,215,0,0.3)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(40, 80); ctx.lineTo(w - 40, 80); ctx.stroke();
    ctx.font = 'bold 18px system-ui'; ctx.fillStyle = '#FFFFFF';
    const displayName = poolName.length > 18 ? poolName.slice(0, 18) + '...' : poolName;
    ctx.fillText(`«${displayName}»`, w / 2, 106);
    ctx.font = '12px system-ui'; ctx.fillStyle = '#9CA3AF';
    ctx.fillText(`@${username} приглашает тебя!`, w / 2, 126);
    ctx.font = '11px system-ui'; ctx.fillStyle = '#FFD700';
    ctx.fillText(`👥 ${memberCount} участников в пуле`, w / 2, 146);
    ctx.fillStyle = '#1a1a2e'; ctx.beginPath(); ctx.roundRect(30, 156, w - 60, 28, 8); ctx.fill();
    ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(30, 156, w - 60, 28, 8); ctx.stroke();
    ctx.font = 'bold 11px system-ui'; ctx.fillStyle = '#FFD700';
    ctx.fillText('🎁 200 $KARMA + Буст 24ч', w / 2, 175);
  }, [poolName, username, memberCount]);
  return <canvas ref={canvasRef} style={{ width: 280, height: 200, borderRadius: 16 }} />;
}

/* === Мок контактов === */
const MOCK_CONTACTS = [
  { id: 'c1', name: 'Алексей', username: 'alexey_dev', avatar: '👨‍💻' },
  { id: 'c2', name: 'Мария', username: 'masha_cool', avatar: '👩‍🎨' },
  { id: 'c3', name: 'Дмитрий', username: 'dima_pro', avatar: '🧑‍🚀' },
  { id: 'c4', name: 'Елена', username: 'elena_star', avatar: '👩‍⚕️' },
  { id: 'c5', name: 'Иван', username: 'ivan_trade', avatar: '👨‍💼' },
  { id: 'c6', name: 'Ольга', username: 'olga_fun', avatar: '👩‍🔬' },
  { id: 'c7', name: 'Сергей', username: 'sergey_88', avatar: '🧑‍🎓' },
  { id: 'c8', name: 'Анна', username: 'anna_vip', avatar: '👩‍🏫' },
];

/* === Тексты приглашения друзей === */
const INVITE_MESSAGES = [
  (u: string, code: string) =>
    `🚀 Привет! Я играю в KarmaMarket — биржу социальной кармы в Telegram!\n\nТоргуй акциями друзей, получай дивиденды и бусти карму! 📈\n\n🎁 Тебя ждёт: 100 $KARMA + 10 бесплатных акций\n\nПрисоединяйся: https://t.me/KarmaMarketBot?start=${code}\n\nОт @${u} с ❤️`,
  (u: string, code: string) =>
    `💎 @${u} зовёт тебя в KarmaMarket!\n\nПокупай «акции» друзей и зарабатывай на их карме! 🔥\n\n✅ Пассивный доход\n✅ Торговля как на бирже\n✅ Бусты и пулы\n\n🎁 Бонус: 100 $KARMA + 10 акций\n\n👉 https://t.me/KarmaMarketBot?start=${code}`,
  (u: string, code: string) =>
    `📊 Хочешь стать трейдером?\n\nВ KarmaMarket торгуй акциями друзей и зарабатывай дивиденды! 💰\n\n@${u} уже в игре.\n\n🎁 За вход: 100 $KARMA + 10 shares\n⏰ Бонус ограничен!\n\nЗаходи: https://t.me/KarmaMarketBot?start=${code}`,
];

/* ====================================================== */
export default function FriendsScreen() {
  const {
    user, shares, pools,
    boostFriend, voteFriend, joinPool, createPool, leavePool, boostPool,
    inviteToPool, addNotification, referralRecords, boostCooldowns,
    claimReferralEarnings, getReferralTier, getReferralStats, getReferralAchievements,
  } = useGameStore();
  const { theme } = useTheme();

  const friendsList = shares.filter(s => !s.hidden && s.ownerId !== user.id);
  const myPool = pools.find(p => p.id === user.poolId);

  // Получаем данные рефералов
  const referralTier = getReferralTier();
  const referralStats = getReferralStats();
  const achievements = getReferralAchievements();

  const [tab, setTab] = useState<'friends' | 'pool' | 'referral'>('friends');
  const [newPoolName, setNewPoolName] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [poolBoostCooldown, setPoolBoostCooldown] = useState<number | null>(null);
  const [poolBoostTimer, setPoolBoostTimer] = useState('');
  const [copied, setCopied] = useState(false);
  const [editingCode, setEditingCode] = useState(false);
  const [customCode, setCustomCode] = useState('');
  const [showRefDetails, setShowRefDetails] = useState(false);

  const [claimedChallenges, setClaimedChallenges] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('km_claimed_challenges');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  const [showRefDashboard, setShowRefDashboard] = useState(false);
  const [showRefAchievements, setShowRefAchievements] = useState(false);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showPoolInviteModal, setShowPoolInviteModal] = useState(false);
  const [sentInvites, setSentInvites] = useState<Set<string>>(new Set());
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [inviteMsgIndex, setInviteMsgIndex] = useState(0);

  const inviteCode = customCode || user.referralCode;
  const inviteLink = `https://t.me/KarmaMarketBot?start=${inviteCode}`;
  const inviteText = INVITE_MESSAGES[inviteMsgIndex](user.username, inviteCode);

  const poolMemberIds = new Set(myPool?.members.map(m => m.userId) || []);
  const availableForPool = shares.filter(s =>
    s.ownerId !== user.id && !poolMemberIds.has(s.ownerId)
  );

  useEffect(() => {
    const saved = localStorage.getItem('km_pool_boost_cd');
    if (saved) { const t = parseInt(saved); if (t > Date.now()) setPoolBoostCooldown(t); }
  }, []);

  useEffect(() => {
    if (!poolBoostCooldown) return;
    const tick = () => {
      const rem = poolBoostCooldown - Date.now();
      if (rem <= 0) { setPoolBoostCooldown(null); setPoolBoostTimer(''); return; }
      const m = Math.floor(rem / 60000);
      const s = Math.floor((rem % 60000) / 1000);
      setPoolBoostTimer(`${m}:${s.toString().padStart(2, '0')}`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [poolBoostCooldown]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(inviteLink).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }, [inviteLink]);

  const handleSendInvite = useCallback((contactId: string, contactUsername: string) => {
    setSendingId(contactId);
    const text = encodeURIComponent(inviteText);
    window.open(`https://t.me/${contactUsername}?text=${text}`, '_blank');
    setTimeout(() => {
      setSentInvites(prev => new Set([...prev, contactId]));
      setSendingId(null);
      addNotification(`📨 Приглашение отправлено @${contactUsername}!`, 'success');
    }, 1000);
  }, [inviteText, addNotification]);

  const handlePoolInvite = useCallback((ownerId: string) => {
    const err = inviteToPool(ownerId);
    if (err) { addNotification(err, 'warning'); }
  }, [inviteToPool, addNotification]);

  const handlePoolBoost = useCallback(() => {
    const err = boostPool();
    if (err) { addNotification(err, 'warning'); }
    else {
      const cd = Date.now() + 3600000;
      setPoolBoostCooldown(cd);
      localStorage.setItem('km_pool_boost_cd', cd.toString());
    }
  }, [boostPool, addNotification]);

  const totalRefs = user.totalFriendsInvited || 0;
  const activeRefs = referralRecords.filter(r => r.isActive).length;
  const challenges = [
    { id: 'rc1', title: 'Пригласи 3 друзей', target: 3, current: totalRefs, reward: 200, icon: '👥' },
    { id: 'rc2', title: 'Пригласи 5 друзей', target: 5, current: totalRefs, reward: 500, icon: '🌟', bonus: 'Premium день' },
    { id: 'rc3', title: 'Пригласи 10 друзей', target: 10, current: totalRefs, reward: 1000, icon: '👑', bonus: 'Бейдж King' },
    { id: 'rc4', title: '3 активных реферала', target: 3, current: activeRefs, reward: 300, icon: '🔥' },
    { id: 'rc5', title: 'Пригласи 15 друзей', target: 15, current: totalRefs, reward: 2000, icon: '💎' },
  ];

  const ROLE_INFO: Record<string, { label: string; icon: string; color: string; divBonus: string; karmaBonus: string }> = {
    leader:  { label: 'Лидер',    icon: '👑', color: '#FFD700', divBonus: '+25%', karmaBonus: '+50/день' },
    admin:   { label: 'Админ',    icon: '⭐', color: '#FF9500', divBonus: '+20%', karmaBonus: '+30/день' },
    officer: { label: 'Офицер',   icon: '🎖️', color: '#00BFFF', divBonus: '+15%', karmaBonus: '+20/день' },
    member:  { label: 'Участник', icon: '👤', color: '#00FF7F', divBonus: '+10%', karmaBonus: '+10/день' },
    recruit: { label: 'Новичок',  icon: '🆕', color: '#9CA3AF', divBonus: '+5%',  karmaBonus: '+5/день' },
  };
  const isLeaderOrAdmin = myPool?.members.some(m => m.userId === user.id && (m.role === 'leader' || m.role === 'admin'));
  const myRole = myPool?.members.find(m => m.userId === user.id)?.role || 'recruit';

  /* ====================================================== */
  return (
    <div className="pb-4 px-3 space-y-3">

      {/* ===== Вкладки с анимацией ===== */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex gap-1 p-1 rounded-xl glass-card"
        style={{ backgroundColor: theme.bgCard }}>
        {([
          { key: 'friends' as const, label: 'Друзья', icon: <Users size={14} /> },
          { key: 'pool' as const, label: 'Пул', icon: <Shield size={14} /> },
          { key: 'referral' as const, label: 'Рефералы', icon: <UserPlus size={14} /> },
        ]).map(t => (
          <motion.button key={t.key}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTab(t.key)}
            className="flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all"
            style={{
              backgroundColor: tab === t.key ? theme.accent + '30' : 'transparent',
              color: tab === t.key ? theme.accent : theme.textSecondary,
            }}>
            {t.icon} {t.label}
          </motion.button>
        ))}
      </motion.div>

      {/* ========== ДРУЗЬЯ ========== */}
      <AnimatePresence mode="wait">
      {tab === 'friends' && (
        <motion.div
          key="friends"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.25 }}
          className="space-y-1.5">
          {friendsList.length === 0 ? (
            <div className="text-center py-10 opacity-50" style={{ color: theme.textSecondary }}>
              <Users size={40} className="mx-auto mb-2" /><p>Пока нет друзей</p>
            </div>
          ) : friendsList.map((share, i) => {
            const change24h = share.price24hAgo > 0
              ? ((share.currentPrice - share.price24hAgo) / share.price24hAgo * 100) : 0;
            const isUp = change24h >= 0;
            const boostOnCooldown = !!(boostCooldowns[share.id] && (Date.now() - boostCooldowns[share.id]) < 3600000);
            return (
              <motion.div key={share.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl glass-card"
                style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.bgCardBorder}` }}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
                  style={{ border: `2px solid ${isUp ? theme.accent : theme.danger}`, backgroundColor: theme.bg }}>
                  {share.avatar}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-[13px] truncate" style={{ color: theme.textPrimary }}> @{share.username}</span>
                    {share.isVIP && (
                      <span className="text-[7px] px-1 py-0 rounded font-bold shrink-0"
                        style={{ backgroundColor: theme.accentGold + '25', color: theme.accentGold }}>VIP</span>
                    )}
                  </div>
                  <span className="text-[11px]" style={{ color: theme.textSecondary }}>{share.currentPrice.toFixed(1)} $K</span>
                </div>
                <div className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold"
                  style={{
                    backgroundColor: isUp ? theme.accent + '15' : theme.danger + '15',
                    color: isUp ? theme.accent : theme.danger,
                  }}>
                  {isUp ? '▲' : '▼'}{Math.abs(change24h).toFixed(1)}%
                </div>
                <motion.button whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (boostOnCooldown) { addNotification('⏳ Буст на кулдауне (1ч)', 'warning'); return; }
                    const r = boostFriend(share.id); if (r) addNotification(r, 'warning');
                  }}
                  className="shrink-0 px-2 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1"
                  style={{
                    backgroundColor: boostOnCooldown ? theme.bgCardBorder : theme.accent + '15',
                    color: boostOnCooldown ? theme.textMuted : theme.accent,
                    opacity: boostOnCooldown ? 0.5 : 1,
                  }}>
                  <Zap size={11} />{boostOnCooldown ? 'КД' : 'Буст'}
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }}
                  onClick={() => { const r = voteFriend(share.id); if (r) addNotification(r, 'warning'); }}
                  className="shrink-0 px-2 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1"
                  style={{ backgroundColor: '#FF6B6B12', color: '#FF6B6B' }}>
                  <Heart size={11} />Голос
                </motion.button>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ========== ПУЛЫ ========== */}
      {tab === 'pool' && (
        <motion.div
          key="pool"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.25 }}
          className="space-y-3">
          {myPool ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, type: 'spring' }}
              className="rounded-xl overflow-hidden" style={{ backgroundColor: theme.bgCard }}>
              {/* Заголовок пула */}
              <div className="p-4" style={{ borderBottom: `1px solid ${theme.bgCardBorder}` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Shield size={18} style={{ color: theme.accent }} />
                      <span className="font-bold" style={{ color: theme.textPrimary }}>{myPool.name}</span>
                    </div>
                    <div className="text-xs mt-1" style={{ color: theme.textSecondary }}>
                      {myPool.members.length}/{myPool.maxMembers} участников • +20% дивиденды
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{ backgroundColor: ROLE_INFO[myRole].color + '20', color: ROLE_INFO[myRole].color }}>
                    {ROLE_INFO[myRole].icon} {ROLE_INFO[myRole].label}
                  </span>
                </div>
              </div>

              {/* Дашборд статистики */}
              <div className="p-4" style={{ borderBottom: `1px solid ${theme.bgCardBorder}` }}>
                <div className="text-[10px] font-bold mb-2" style={{ color: theme.textSecondary }}>📊 СТАТИСТИКА ПУЛА</div>
                <div className="grid grid-cols-2 gap-2">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2.5 rounded-lg"
                    style={{ backgroundColor: theme.accent + '10', border: `1px solid ${theme.accent}30` }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-lg">💰</span>
                      <span className="text-[9px] font-bold" style={{ color: theme.accent }}>ДИВИДЕНДЫ</span>
                    </div>
                    <div className="text-lg font-bold" style={{ color: theme.accentGold }}>
                      {(myPool.stats?.totalDividends || 0).toFixed(0)} <span className="text-xs">$K</span>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="p-2.5 rounded-lg"
                    style={{ backgroundColor: theme.accentGold + '10', border: `1px solid ${theme.accentGold}30` }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-lg">⚡</span>
                      <span className="text-[9px] font-bold" style={{ color: theme.accentGold }}>БУСТЫ</span>
                    </div>
                    <div className="text-lg font-bold" style={{ color: theme.accentGold }}>
                      {myPool.stats?.totalBoosts || 0}
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-2.5 rounded-lg"
                    style={{ backgroundColor: '#34D39910', border: `1px solid #34D39930` }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-lg">📈</span>
                      <span className="text-[9px] font-bold" style={{ color: '#34D399' }}>РОСТ</span>
                    </div>
                    <div className="text-lg font-bold" style={{ color: '#34D399' }}>
                      +{(myPool.stats?.weeklyGrowth || 0).toFixed(1)}%
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="p-2.5 rounded-lg"
                    style={{ backgroundColor: '#60A5FA10', border: `1px solid #60A5FA30` }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-lg">🎯</span>
                      <span className="text-[9px] font-bold" style={{ color: '#60A5FA' }}>СРЕДНИЙ</span>
                    </div>
                    <div className="text-lg font-bold" style={{ color: '#60A5FA' }}>
                      {myPool.stats?.averageScore || 0}
                    </div>
                  </motion.div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[9px]" style={{ color: theme.textMuted }}>
                  <span>🟢 Активных: {myPool.stats?.activeMembers || 0}/{myPool.members.length}</span>
                  <span>📊 Трейдов: {myPool.stats?.totalTrades || 0}</span>
                </div>
              </div>

              {/* Таблица бонусов рангов */}
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${theme.bgCardBorder}` }}>
                <div className="text-[10px] font-bold mb-2" style={{ color: theme.textSecondary }}>БОНУСЫ РАНГОВ</div>
                <div className="grid grid-cols-5 gap-1">
                  {Object.entries(ROLE_INFO).map(([key, info]) => (
                    <motion.div key={key}
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-1.5 rounded-lg"
                      style={{
                        backgroundColor: myRole === key ? info.color + '15' : 'transparent',
                        border: myRole === key ? `1px solid ${info.color}40` : '1px solid transparent',
                      }}>
                      <div className="text-sm">{info.icon}</div>
                      <div className="text-[8px] font-bold mt-0.5" style={{ color: info.color }}>{info.label}</div>
                      <div className="text-[8px] mt-0.5" style={{ color: theme.textSecondary }}>{info.divBonus}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Лента активности */}
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${theme.bgCardBorder}` }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] font-bold" style={{ color: theme.textSecondary }}>📈 АКТИВНОСТЬ</div>
                  <div className="text-[9px]" style={{ color: theme.textMuted }}>Последние 5</div>
                </div>
                <div className="space-y-1.5">
                  {(myPool.activities || []).slice(-5).reverse().map((activity, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-2 py-1.5 px-2 rounded-lg"
                      style={{ backgroundColor: theme.inputBg }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0"
                        style={{
                          backgroundColor: activity.action === 'boost' ? theme.accent + '20' :
                                          activity.action === 'trade' ? '#60A5FA20' :
                                          activity.action === 'join' ? '#34D39920' : theme.bgCardBorder,
                        }}>
                        {activity.action === 'boost' ? '⚡' :
                         activity.action === 'trade' ? '📊' :
                         activity.action === 'join' ? '👋' : '👤'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] truncate" style={{ color: theme.textPrimary }}>
                          {activity.username || 'Участник'}
                        </div>
                        <div className="text-[9px]" style={{ color: theme.textMuted }}>
                          {activity.description}
                        </div>
                      </div>
                      <div className="text-[8px]" style={{ color: theme.textMuted }}>
                        {new Date(activity.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </motion.div>
                  ))}
                  {(!myPool.activities || myPool.activities.length === 0) && (
                    <div className="text-center py-4 text-[10px]" style={{ color: theme.textMuted }}>
                      Пока нет активности
                    </div>
                  )}
                </div>
              </div>

              {/* Участники */}
              <div style={{ borderBottom: `1px solid ${theme.bgCardBorder}` }}>
                <button onClick={() => setShowMembers(!showMembers)}
                  className="w-full px-4 py-2.5 flex items-center justify-between"
                  style={{ color: theme.textPrimary }}>
                  <span className="text-sm font-medium">Участники ({myPool.members.length})</span>
                  <div className="flex items-center gap-2">
                    {!showMembers && (
                      <div className="flex -space-x-1.5">
                        {myPool.members.slice(0, 4).map((m, i) => {
                          const ms = shares.find(s => s.ownerId === m.userId);
                          return (
                            <div key={i} className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] border"
                              style={{ backgroundColor: theme.accent + '30', borderColor: theme.bgCard }}>
                              {m.userId === user.id ? '😎' : (ms?.avatar || '👤')}
                            </div>
                          );
                        })}
                        {myPool.members.length > 4 && (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] border font-bold"
                            style={{ backgroundColor: theme.bgCardBorder, borderColor: theme.bgCard, color: theme.textSecondary }}>
                            +{myPool.members.length - 4}
                          </div>
                        )}
                      </div>
                    )}
                    {showMembers ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>
                <AnimatePresence>
                {showMembers && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden">
                    <div className="px-4 pb-3 space-y-1.5">
                      {myPool.members.map((member, mi) => {
                        const ms = shares.find(s => s.ownerId === member.userId);
                        const isMe = member.userId === user.id;
                        const roleInfo = ROLE_INFO[member.role] || ROLE_INFO.recruit;
                        return (
                          <motion.div key={member.userId}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: mi * 0.05 }}
                            className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg"
                            style={{ backgroundColor: isMe ? theme.accent + '10' : 'transparent' }}>
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
                              style={{ backgroundColor: roleInfo.color + '20' }}>
                              {isMe ? '😎' : (ms?.avatar || '👤')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-medium truncate" style={{ color: theme.textPrimary }}>
                                  {isMe ? ` @${user.username}` : ` @${ms?.username || member.userId.slice(-6)}`}
                                </span>
                                {isMe && <span className="text-[9px] opacity-60" style={{ color: theme.textSecondary }}>(Вы)</span>}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px]" style={{ color: roleInfo.color }}>
                                  {roleInfo.icon} {roleInfo.label}
                                </span>
                                <span className="text-[8px]" style={{ color: theme.accentGold }}>
                                  🏆 {member.contributionScore || 0}
                                </span>
                                <span className="text-[8px]" style={{ color: 
                                  (Date.now() - member.lastActiveAt) < 86400000 ? theme.accent :
                                  (Date.now() - member.lastActiveAt) < 7 * 86400000 ? theme.accentGold : theme.textMuted
                                }}>
                                  {(Date.now() - member.lastActiveAt) < 60000 ? '🟢' :
                                   (Date.now() - member.lastActiveAt) < 3600000 ? '🟡' :
                                   (Date.now() - member.lastActiveAt) < 86400000 ? '🟠' : '⚪'}
                                </span>
                              </div>
                            </div>
                            {isLeaderOrAdmin && !isMe && member.role !== 'leader' && (
                              <motion.button whileTap={{ scale: 0.85 }}
                                onClick={() => {
                                  const roles = ['recruit', 'member', 'officer', 'admin'] as const;
                                  const ci = roles.indexOf(member.role as typeof roles[number]);
                                  if (ci < roles.length - 1) {
                                    const nr = roles[ci + 1];
                                    const us = pools.map(p => p.id !== myPool.id ? p : {
                                      ...p, members: p.members.map(sm => sm.userId === member.userId ? { ...sm, role: nr } : sm),
                                    });
                                    useGameStore.setState({ pools: us });
                                    addNotification(`⬆️ ${ms?.username || member.userId} повышен до ${ROLE_INFO[nr].label}!`, 'success');
                                  }
                                }}
                                className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                                style={{ backgroundColor: theme.accentGold + '20', color: theme.accentGold }}>
                                ⬆️
                              </motion.button>
                            )}
                            {!isMe && (
                              <span className="text-[10px]" style={{ color: theme.textSecondary }}>⚡{ms?.karma || 0}</span>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>

              {/* Квесты пула */}
              <div className="p-4 space-y-2">
                <div className="text-xs font-bold mb-2" style={{ color: theme.textSecondary }}>КВЕСТЫ ПУЛА</div>
                <div className="p-2.5 rounded-lg flex items-center justify-between" style={{ backgroundColor: theme.bg }}>
                  <div className="flex items-center gap-2">
                    <span>⚡</span>
                    <span className="text-xs font-medium" style={{ color: theme.textPrimary }}>Буст всему пулу → x2</span>
                  </div>
                  {poolBoostCooldown && poolBoostCooldown > Date.now() ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold"
                        style={{ backgroundColor: theme.accent + '20', color: theme.accent }}>✓ Готово</span>
                      <span className="text-[10px] font-mono" style={{ color: theme.accentGold }}>⏱ {poolBoostTimer}</span>
                    </div>
                  ) : (
                    <motion.button whileTap={{ scale: 0.92 }}
                      onClick={handlePoolBoost}
                      className="px-3 py-1 rounded-lg font-bold text-[10px]"
                      style={{ backgroundColor: theme.accentGold + '20', color: theme.accentGold }}>
                      ⚡ Выполнить
                    </motion.button>
                  )}
                </div>

                {isLeaderOrAdmin && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-2.5 rounded-lg flex items-center justify-between" style={{ backgroundColor: theme.bg }}>
                    <div className="flex items-center gap-2">
                      <span>👥</span>
                      <div>
                        <span className="text-xs font-medium" style={{ color: theme.textPrimary }}>Пригласить в пул</span>
                        <div className="text-[9px]" style={{ color: theme.accentGold }}>Бонус: +200 $K другу, +100 $K вам</div>
                      </div>
                    </div>
                    <motion.button whileTap={{ scale: 0.92 }}
                      onClick={() => setShowPoolInviteModal(true)}
                      className="px-3 py-1.5 rounded-lg font-bold text-[10px] flex items-center gap-1"
                      style={{ backgroundColor: theme.accent + '20', color: theme.accent }}>
                      <Send size={11} /> Пригласить
                    </motion.button>
                  </motion.div>
                )}
              </div>

              {/* История событий */}
              <div className="px-4 py-3" style={{ borderTop: `1px solid ${theme.bgCardBorder}`, borderBottom: `1px solid ${theme.bgCardBorder}` }}>
                <div className="text-[10px] font-bold mb-2" style={{ color: theme.textSecondary }}>📜 ИСТОРИЯ ПУЛА</div>
                <div className="space-y-1.5">
                  {(myPool.history || []).slice(-5).reverse().map((event, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-2 py-1.5 px-2 rounded-lg"
                      style={{ backgroundColor: theme.inputBg }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0"
                        style={{ backgroundColor: theme.accentGold + '20' }}>
                        {event.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold" style={{ color: theme.textPrimary }}>
                          {event.title}
                        </div>
                        <div className="text-[9px]" style={{ color: theme.textMuted }}>
                          {event.description}
                        </div>
                      </div>
                      <div className="text-[8px]" style={{ color: theme.textMuted }}>
                        {new Date(event.timestamp).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })}
                      </div>
                    </motion.div>
                  ))}
                  {(!myPool.history || myPool.history.length === 0) && (
                    <div className="text-center py-3 text-[10px]" style={{ color: theme.textMuted }}>
                      История пуста
                    </div>
                  )}
                </div>
              </div>

              {/* Выход */}
              <div className="px-4 pb-4">
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => { if (window.confirm('Покинуть пул?')) leavePool(); }}
                  className="w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: '#FF6B6B15', color: '#FF6B6B' }}>
                  <LogOut size={13} /> Покинуть пул
                </motion.button>
                {myPool.leaderId === user.id && (
                  <p className="text-[10px] text-center mt-1" style={{ color: theme.textSecondary }}>
                    Лидерство перейдёт следующему участнику
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl" style={{ backgroundColor: theme.bgCard }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-bold" style={{ color: theme.textPrimary }}>Создать пул</div>
                  {!user.premium && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                      style={{ backgroundColor: theme.accentGold + '20', color: theme.accentGold }}>👑 Premium</span>
                  )}
                </div>
                {!user.premium && (
                  <p className="text-[10px] mb-2" style={{ color: theme.accentGold }}>
                    Создание пулов доступно только Premium подписчикам
                  </p>
                )}
                <div className="flex gap-2">
                  <input value={newPoolName} onChange={e => setNewPoolName(e.target.value)}
                    placeholder="Название пула..."
                    className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: theme.inputBg, color: theme.textPrimary, border: `1px solid ${theme.inputBorder}` }} />
                  <motion.button whileTap={{ scale: 0.92 }}
                    onClick={() => { if (newPoolName.trim()) { createPool(newPoolName.trim()); setNewPoolName(''); } }}
                    className="px-4 py-2 rounded-lg font-bold text-sm"
                    style={{
                      backgroundColor: user.premium ? theme.accent : theme.bgCardBorder,
                      color: user.premium ? '#000' : theme.textSecondary,
                      opacity: user.premium ? 1 : 0.6,
                    }}>
                    Создать
                  </motion.button>
                </div>
              </motion.div>
              <div className="text-xs font-bold" style={{ color: theme.textSecondary }}>ДОСТУПНЫЕ ПУЛЫ</div>
              {pools.length === 0 ? (
                <div className="text-center py-6 opacity-50 text-xs" style={{ color: theme.textSecondary }}>Нет пулов</div>
              ) : pools.map((pool, si) => (
                <motion.div key={pool.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: si * 0.08 }}
                  className="p-3 rounded-xl flex items-center justify-between"
                  style={{ backgroundColor: theme.bgCard }}>
                  <div>
                    <div className="font-bold text-sm" style={{ color: theme.textPrimary }}>{pool.name}</div>
                    <div className="text-xs" style={{ color: theme.textSecondary }}>
                      {pool.members.length}/{pool.maxMembers} участников
                    </div>
                  </div>
                  <motion.button whileTap={{ scale: 0.92 }}
                    onClick={() => joinPool(pool.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold"
                    style={{ backgroundColor: theme.accent + '20', color: theme.accent }}>
                    Вступить
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ========== РЕФЕРАЛЫ ========== */}
      {tab === 'referral' && (
        <motion.div
          key="referral"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.25 }}
          className="space-y-3">
          
          {/* Рефералы — объединённый блок */}
          <div className="rounded-2xl p-4 transition-colors glass-card"
            style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.bgCardBorder}` }}>
            <button
              onClick={() => setShowRefDashboard(!showRefDashboard)}
              className="w-full flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: referralTier.color + '20' }}>
                  {referralTier.icon}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold" style={{ color: theme.textSecondary }}>ВАШ УРОВЕНЬ</div>
                  <div className="text-lg font-bold" style={{ color: referralTier.color }}>
                    {referralTier.name} ({referralTier.bonusPercent}%)
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs" style={{ color: theme.textSecondary }}>До след. уровня</div>
                  <div className="text-sm font-bold" style={{ color: theme.accentGold }}>
                    {REFERRAL_TIERS.find(t => t.level === referralTier.level + 1)?.minReferrals || 'MAX'} refs
                  </div>
                </div>
                {showRefDashboard ? <ChevronUp size={16} style={{ color: theme.textMuted }} /> : <ChevronDown size={16} style={{ color: theme.textMuted }} />}
              </div>
            </button>

            <AnimatePresence>
            {showRefDashboard && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden">

                {/* Прогресс бар */}
                <div className="py-3">
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.bgCardBorder }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (referralStats.totalReferrals / (REFERRAL_TIERS.find(t => t.level === referralTier.level + 1)?.minReferrals || 100)) * 100)}%` }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: referralTier.color }}
                    />
                  </div>
                </div>

                {/* Статистика */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: theme.accentGold + '10' }}>
                    <div className="text-[9px] mb-1" style={{ color: theme.accentGold }}>📥 ВЫПЛАЧЕНО</div>
                    <div className="text-xl font-bold" style={{ color: theme.accentGold }}>
                      {Math.max(0, user.referralTotalEarnings - (user.referralPendingEarnings || 0)).toFixed(0)} <span className="text-xs">$K</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl" style={{ backgroundColor: '#34D39910' }}>
                    <div className="text-[9px] mb-1" style={{ color: '#34D399' }}>👥 ВСЕГО</div>
                    <div className="text-xl font-bold" style={{ color: '#34D399' }}>
                      {referralStats.totalReferrals}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl" style={{ backgroundColor: '#60A5FA10' }}>
                    <div className="text-[9px] mb-1" style={{ color: '#60A5FA' }}>🟢 АКТИВНЫХ</div>
                    <div className="text-xl font-bold" style={{ color: '#60A5FA' }}>
                      {referralRecords.filter(r => r.isActive).length}
                    </div>
                  </div>
                </div>

                {/* Рефералы — список */}
                {referralRecords.length > 0 && (
                  <div className="space-y-3">
                    {/* Доходы по источникам */}
                    <div>
                      <div className="text-[10px] font-bold mb-2" style={{ color: theme.textSecondary }}>ДОХОДЫ ПО ИСТОЧНИКАМ</div>
                      <div className="space-y-1.5">
                        {[
                          { icon: '📊', label: 'От трейдов (5%)', pct: 0.6 },
                          { icon: '💰', label: 'От дивидендов (5%)', pct: 0.3 },
                          { icon: '⚡', label: 'От бустов (5%)', pct: 0.1 },
                        ].map((src, si) => {
                          const totalEarned = referralRecords.reduce((s, r) => s + r.totalEarnings, 0);
                          return (
                            <div key={si} className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg"
                              style={{ backgroundColor: theme.inputBg }}>
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm">{src.icon}</span>
                                <span style={{ color: theme.textPrimary }}>{src.label}</span>
                              </div>
                              <span className="text-xs font-bold" style={{ color: theme.accentGold }}>
                                +{(totalEarned * src.pct).toFixed(1)} $K
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Список рефералов */}
                    <div>
                      <div className="text-[10px] font-bold mb-2" style={{ color: theme.textSecondary }}>МОИ РЕФЕРАЛЫ ({referralRecords.length})</div>
                      <div className="space-y-1.5">
                        {referralRecords.map((ref, i) => {
                          const share = shares.find(s => s.ownerId === ref.userId);
                          return (
                            <motion.div key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-center gap-2.5 py-2 px-2 rounded-lg"
                              style={{ backgroundColor: theme.inputBg }}>
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                                style={{
                                  backgroundColor: ref.isActive ? theme.accent + '20' : theme.bgCardBorder,
                                  border: `2px solid ${ref.isActive ? theme.accent + '50' : theme.bgCardBorder}`,
                                }}>
                                {share?.avatar || (ref.isActive ? '🟢' : '⚪')}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <span className="text-xs font-bold truncate" style={{ color: theme.textPrimary }}>
                                    @{ref.username}
                                  </span>
                                  <span className="text-[8px] px-1 py-0 rounded font-bold"
                                    style={{
                                      backgroundColor: ref.isActive ? theme.accent + '20' : theme.bgCardBorder,
                                      color: ref.isActive ? theme.accent : theme.textMuted,
                                    }}>
                                    {ref.isActive ? 'Активен' : 'Неактивен'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[9px]" style={{ color: theme.textSecondary }}>
                                    🏆 Lvl {ref.level}
                                  </span>
                                  <span className="text-[9px]" style={{ color: theme.textSecondary }}>
                                    📅 {new Date(ref.joinedAt).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-xs font-bold" style={{ color: theme.accentGold }}>
                                  +{ref.totalEarnings.toFixed(1)} $K
                                </div>
                                <div className="text-[9px]" style={{ color: theme.textSecondary }}>заработано</div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Подсказка */}
                    <div className="p-2.5 rounded-lg text-center text-[10px]"
                      style={{ backgroundColor: theme.accent + '08', color: theme.textSecondary, border: `1px dashed ${theme.accent}30` }}>
                      💡 Вы получаете <b style={{ color: theme.accent }}>5%</b> от трейдов и дивидендов каждого реферала навсегда
                    </div>
                  </div>
                )}
              </motion.div>
            )}
            </AnimatePresence>
          </div>

          {/* Блок приглашения */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl overflow-hidden" style={{ backgroundColor: theme.bgCard }}>
            <div className="p-4 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <Send size={18} style={{ color: theme.accentGold }} />
                <span className="font-bold text-sm" style={{ color: theme.textPrimary }}>Пригласи друзей</span>
              </div>
              <p className="text-xs" style={{ color: theme.textSecondary }}>
                Друг получит: 100 $KARMA + 10 акций • Ты: {referralTier.bonusPercent}% от его трейдов
              </p>
            </div>
            <div className="px-4 pb-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 rounded-lg text-xs font-mono truncate"
                  style={{ backgroundColor: theme.inputBg, color: theme.accentGold, border: `1px solid ${theme.inputBorder}` }}>
                  {editingCode ? (
                    <input value={customCode}
                      onChange={e => setCustomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 16))}
                      onBlur={() => setEditingCode(false)}
                      onKeyDown={e => e.key === 'Enter' && setEditingCode(false)}
                      autoFocus className="bg-transparent outline-none w-full"
                      style={{ color: theme.accentGold }} placeholder="Ваш код..." />
                  ) : (
                    <span>Код: {inviteCode}</span>
                  )}
                </div>
                <motion.button whileTap={{ scale: 0.9 }}
                  onClick={() => setEditingCode(!editingCode)}
                  className="p-2 rounded-lg" style={{ backgroundColor: theme.inputBg }}>
                  <span className="text-xs">✏️</span>
                </motion.button>
              </div>
              <div className="flex gap-2">
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className="flex-1 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5"
                  style={{
                    backgroundColor: copied ? theme.accent + '30' : theme.accent + '15',
                    color: theme.accent, border: `1px solid ${theme.accent}40`,
                  }}>
                  {copied ? <><Check size={14} /> Скопировано!</> : <><Copy size={14} /> Скопировать</>}
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => setShowInviteModal(true)}
                  className="flex-1 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5"
                  style={{
                    backgroundColor: theme.accentGold + '15',
                    color: theme.accentGold, border: `1px solid ${theme.accentGold}40`,
                  }}>
                  <Send size={14} /> Пригласить друга
                </motion.button>
              </div>
            </div>
            <div className="px-4 py-2.5 flex justify-between text-[10px]"
              style={{ backgroundColor: theme.inputBg, color: theme.textSecondary }}>
              <span>Приглашено: <b style={{ color: theme.accent }}>{totalRefs}</b></span>
              <span>Активных: <b style={{ color: theme.accent }}>{activeRefs}</b></span>
              <span>Доход: <b style={{ color: theme.accentGold }}>{(user.referralTotalEarnings || 0).toFixed(0)} $K</b></span>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Достижения — в самом низу */}
      <div className="rounded-2xl p-4 transition-colors glass-card"
        style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.bgCardBorder}` }}>
        <button
          onClick={() => setShowRefAchievements(!showRefAchievements)}
          className="w-full flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy size={18} style={{ color: theme.accentGold }} />
            <span className="font-semibold text-sm" style={{ color: theme.textPrimary }}>Достижения</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
              style={{ backgroundColor: theme.accentGold + '20', color: theme.accentGold }}>
              {achievements.filter(a => a.unlocked || user.referralAchievements?.includes(a.id)).length}/{achievements.length}
            </span>
          </div>
          {showRefAchievements ? <ChevronUp size={16} style={{ color: theme.textMuted }} /> : <ChevronDown size={16} style={{ color: theme.textMuted }} />}
        </button>

        <AnimatePresence>
        {showRefAchievements && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden">
            <div className="grid grid-cols-2 gap-2 pt-2">
              {achievements
                .filter(a => a.unlocked || user.referralAchievements?.includes(a.id)) // Показываем только заработанные
                .map((achievement, i) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-xl text-center"
                  style={{
                    backgroundColor: theme.accentGold + '15',
                    border: `1px solid ${theme.accentGold}40`,
                  }}>
                  <div className="text-2xl mb-1">{achievement.icon}</div>
                  <div className="text-[9px] font-bold" style={{ color: theme.textPrimary }}>{achievement.name}</div>
                  <div className="text-[8px] mt-0.5" style={{ color: theme.textSecondary }}>{achievement.description}</div>
                  <div className="text-[8px] mt-1" style={{ color: theme.accentGold }}>
                    {achievement.reward.balance ? `+${achievement.reward.balance} $K ` : ''}
                    {achievement.reward.karma ? `+${achievement.reward.karma} ❤️` : ''}
                  </div>
                </motion.div>
              ))}
              {achievements.filter(a => a.unlocked || user.referralAchievements?.includes(a.id)).length === 0 && (
                <div className="col-span-2 text-center py-8 text-[10px]" style={{ color: theme.textMuted }}>
                  🏆 У вас пока нет достижений.<br/>Приглашайте друзей и получайте награды!
                </div>
              )}
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* ========== МОДАЛ: ПРИГЛАСИТЬ ДРУГА ========== */}
      <AnimatePresence>
      {showInviteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={e => { if (e.target === e.currentTarget) setShowInviteModal(false); }}
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <motion.div
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="w-full max-w-md rounded-t-2xl"
            style={{ backgroundColor: theme.bgSecondary, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div className="p-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${theme.bgCardBorder}` }}>
              <div className="flex items-center gap-2">
                <Send size={18} style={{ color: theme.accent }} />
                <span className="font-bold" style={{ color: theme.textPrimary }}>Пригласить друга</span>
              </div>
              <motion.button whileTap={{ scale: 0.9 }}
                onClick={() => setShowInviteModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: theme.inputBg, color: theme.textSecondary }}>
                <X size={16} />
              </motion.button>
            </div>
            <div className="p-4 flex flex-col items-center">
              <InviteStickerCanvas username={user.username} karma={user.karma} level={user.level} />
              <p className="text-[10px] mt-2 text-center" style={{ color: theme.textSecondary }}>
                Стикер отправится вместе с приглашением
              </p>
            </div>
            <div className="px-4 pb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold" style={{ color: theme.textSecondary }}>ТЕКСТ ПРИГЛАШЕНИЯ</span>
                <motion.button whileTap={{ scale: 0.9 }}
                  onClick={() => setInviteMsgIndex((inviteMsgIndex + 1) % INVITE_MESSAGES.length)}
                  className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: theme.accent + '15', color: theme.accent }}>
                  <RefreshCw size={10} /> Другой вариант
                </motion.button>
              </div>
              <div className="p-3 rounded-xl text-xs whitespace-pre-line leading-relaxed"
                style={{ backgroundColor: theme.inputBg, color: theme.textPrimary, border: `1px solid ${theme.inputBorder}`, maxHeight: 120, overflowY: 'auto' }}>
                {inviteText}
              </div>
            </div>
            <div className="px-4 pb-2">
              <div className="text-xs font-bold mb-2" style={{ color: theme.textSecondary }}>ВЫБЕРИТЕ ДРУГА (не в игре)</div>
            </div>
            <div className="px-4 pb-6 space-y-1.5" style={{ maxHeight: 260, overflowY: 'auto' }}>
              {MOCK_CONTACTS.map(contact => {
                const isSent = sentInvites.has(contact.id);
                const isSending = sendingId === contact.id;
                return (
                  <motion.div key={contact.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-2.5 rounded-xl" style={{ backgroundColor: theme.inputBg }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                      style={{ backgroundColor: theme.accent + '15' }}>{contact.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate" style={{ color: theme.textPrimary }}>{contact.name}</div>
                      <div className="text-xs" style={{ color: theme.textSecondary }}> @{contact.username}</div>
                    </div>
                    {isSent ? (
                      <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg" style={{ backgroundColor: theme.accent + '15' }}>
                        <Check size={13} style={{ color: theme.accent }} />
                        <span className="text-xs font-bold" style={{ color: theme.accent }}>Отправлено</span>
                      </div>
                    ) : (
                      <motion.button whileTap={{ scale: 0.9 }}
                        onClick={() => handleSendInvite(contact.id, contact.username)}
                        disabled={isSending}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs"
                        style={{ backgroundColor: isSending ? theme.bgCardBorder : theme.accent, color: isSending ? theme.textSecondary : '#000' }}>
                        {isSending ? <><RefreshCw size={12} className="animate-spin" /> Отправка...</> : <><Send size={12} /> Пригласить</>}
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* ========== МОДАЛ: ПРИГЛАСИТЬ В ПУЛ ========== */}
      <AnimatePresence>
      {showPoolInviteModal && myPool && (() => {
        const poolLink = `https://t.me/KarmaMarketBot?start=pool_${myPool.id}`;
        const poolMessages = [
          `⚔️ Присоединяйся к нашему пулу «${myPool.name}» в KarmaMarket!\n\n🎁 Бонус за вступление:\n• 200 $KARMA на баланс\n• Буст карточки на 24 часа\n• +20% к дивидендам от пула\n\n👥 Уже в пуле: ${myPool.members.length} участников\n🏆 Ранги с бонусами до +25% к дивидендам\n\n👉 ${poolLink}\n\nОт @${user.username}`,
          `🔥 @${user.username} зовёт тебя в пул «${myPool.name}»!\n\nЧто даёт пул:\n✅ Общий пул дивидендов +20%\n✅ Совместные квесты x2\n✅ Буст всего пула\n✅ Ранги: Новичок → Лидер\n\n🎁 За вступление: 200 $KARMA + буст 24ч!\n\n👉 ${poolLink}`,
          `💎 Пул «${myPool.name}» ищет бойцов!\n\n📈 Вместе зарабатываем больше:\n• Совместные дивиденды\n• Буст всей команды\n• Эксклюзивные квесты\n\n🎁 Бонус новичку: 200 $KARMA\n👥 ${myPool.members.length} участников ждут тебя\n\n👉 ${poolLink}\n\nОт @${user.username} с ⚔️`,
        ];
        const currentPoolMsg = poolMessages[inviteMsgIndex % poolMessages.length];
        return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={e => { if (e.target === e.currentTarget) setShowPoolInviteModal(false); }}
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <motion.div
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="w-full max-w-md rounded-t-2xl"
            style={{ backgroundColor: theme.bgSecondary, maxHeight: '92vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>

            <div className="p-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${theme.bgCardBorder}` }}>
              <div className="flex items-center gap-2">
                <Shield size={18} style={{ color: theme.accentGold }} />
                <div>
                  <span className="font-bold" style={{ color: theme.textPrimary }}>Пригласить в пул</span>
                  <div className="text-[10px]" style={{ color: theme.textSecondary }}>«{myPool.name}» • {myPool.members.length}/{myPool.maxMembers}</div>
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.9 }}
                onClick={() => setShowPoolInviteModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: theme.inputBg, color: theme.textSecondary }}>
                <X size={16} />
              </motion.button>
            </div>

            {/* Стикер пула */}
            <div className="p-4 flex flex-col items-center">
              <PoolStickerCanvas poolName={myPool.name} username={user.username} memberCount={myPool.members.length} />
              <p className="text-[10px] mt-2 text-center" style={{ color: theme.textSecondary }}>
                Стикер отправится вместе с приглашением
              </p>
            </div>

            {/* Бонусы */}
            <div className="mx-4 p-3 rounded-xl"
              style={{ backgroundColor: theme.accentGold + '10', border: `1px solid ${theme.accentGold}30` }}>
              <div className="text-xs font-bold text-center mb-2" style={{ color: theme.accentGold }}>🎁 Бонусы за вступление в пул</div>
              <div className="flex justify-around">
                <div className="text-center">
                  <div className="text-lg">🎯</div>
                  <div className="text-[10px] font-bold" style={{ color: theme.accent }}>Друг получит</div>
                  <div className="text-[10px]" style={{ color: theme.textPrimary }}>200 $KARMA + Буст 24ч</div>
                </div>
                <div className="text-center">
                  <div className="text-lg">💰</div>
                  <div className="text-[10px] font-bold" style={{ color: theme.accent }}>Вы получите</div>
                  <div className="text-[10px]" style={{ color: theme.textPrimary }}>100 $KARMA + 50 кармы</div>
                </div>
              </div>
            </div>

            {/* Текст приглашения */}
            <div className="px-4 pt-3 pb-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold" style={{ color: theme.textSecondary }}>ТЕКСТ ПРИГЛАШЕНИЯ</span>
                <motion.button whileTap={{ scale: 0.9 }}
                  onClick={() => setInviteMsgIndex((inviteMsgIndex + 1) % poolMessages.length)}
                  className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: theme.accentGold + '15', color: theme.accentGold }}>
                  <RefreshCw size={10} /> Другой вариант
                </motion.button>
              </div>
              <div className="p-3 rounded-xl text-xs whitespace-pre-line leading-relaxed"
                style={{ backgroundColor: theme.inputBg, color: theme.textPrimary, border: `1px solid ${theme.inputBorder}`, maxHeight: 120, overflowY: 'auto' }}>
                {currentPoolMsg}
              </div>
            </div>

            {/* Список друзей ИЗ ИГРЫ — не в пуле */}
            <div className="px-4 pt-2 pb-1">
              <div className="text-xs font-bold" style={{ color: theme.textSecondary }}>
                ДРУЗЬЯ В ИГРЕ ({availableForPool.length})
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: theme.textMuted }}>
                Приглашение отправится в Telegram
              </div>
            </div>
            <div className="px-4 pb-6 space-y-1.5" style={{ maxHeight: 300, overflowY: 'auto' }}>
              {availableForPool.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">🎉</div>
                  <div className="text-sm font-bold" style={{ color: theme.textPrimary }}>Все друзья уже в пуле!</div>
                </div>
              ) : availableForPool.map(share => {
                const isSent = sentInvites.has('pool_' + share.ownerId);
                const isSending = sendingId === 'pool_' + share.ownerId;
                return (
                  <motion.div key={share.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ backgroundColor: theme.inputBg, border: `1px solid ${theme.bgCardBorder}` }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: theme.accentGold + '15', border: `2px solid ${theme.accentGold}40` }}>
                      {share.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate" style={{ color: theme.textPrimary }}> @{share.username}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px]" style={{ color: theme.accentGold }}>⭐ {share.karma}</span>
                        <span className="text-[10px]" style={{ color: theme.textSecondary }}>💰 {share.currentPrice.toFixed(1)} $K</span>
                      </div>
                    </div>
                    {isSent ? (
                      <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg"
                        style={{ backgroundColor: theme.accent + '15' }}>
                        <Check size={13} style={{ color: theme.accent }} />
                        <span className="text-xs font-bold" style={{ color: theme.accent }}>Отправлено</span>
                      </div>
                    ) : (
                      <motion.button whileTap={{ scale: 0.9 }}
                        disabled={isSending}
                        onClick={() => {
                          const sid = 'pool_' + share.ownerId;
                          setSendingId(sid);
                          const text = encodeURIComponent(currentPoolMsg);
                          window.open(`https://t.me/share/url?url=${encodeURIComponent(poolLink)}&text=${text}`, '_blank');
                          setTimeout(() => {
                            setSentInvites(prev => new Set([...prev, sid]));
                            setSendingId(null);
                            const cs = useGameStore.getState();
                            useGameStore.setState({
                              user: { ...cs.user, balance: cs.user.balance + 100, karma: cs.user.karma + 50 },
                            });
                            addNotification(`📨 Приглашение в пул отправлено @${share.username}! +100 $K бонус!`, 'success');
                          }, 1500);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs"
                        style={{ backgroundColor: isSending ? theme.bgCardBorder : theme.accentGold, color: isSending ? theme.textSecondary : '#000' }}>
                        {isSending ? (
                          <><RefreshCw size={12} className="animate-spin" /> Отправка...</>
                        ) : (
                          <><Send size={12} /> Пригласить</>
                        )}
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
        );
      })()}
      </AnimatePresence>
    </div>
  );
}
