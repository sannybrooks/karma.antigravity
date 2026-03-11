/* ===== KarmaMarket — Главный компонент приложения ===== */
import { useEffect, useCallback, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { useTheme } from './store/themeStore';
import { BottomNav } from './components/BottomNav';
import { MarketScreen } from './components/screens/MarketScreen';
import { PortfolioScreen } from './components/screens/PortfolioScreen';
import { RewardsScreen } from './components/screens/RewardsScreen';
import FriendsScreen from './components/screens/FriendsScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { AdvisorScreen } from './components/screens/AdvisorScreen';
import { DevToolsScreen } from './components/screens/DevToolsScreen';
import { TradeModal } from './components/TradeModal';
import { OnboardingModal } from './components/OnboardingModal';
import { NotificationToast } from './components/NotificationToast';
import { PremiumModal } from './components/PremiumModal';
import { GameLoop } from './components/GameLoop';
import { BarChart3, TrendingUp, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export function App() {
  const {
    screen, user, updateUser, resetDailyQuests,
    nextDividendTime, setNextDividendTime, initStore,
  } = useGameStore();
  const { theme, mode } = useTheme();
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);

  /* ===== Инициализация данных при запуске ===== */
  useEffect(() => {
    initStore();
  }, [initStore]);

  /* ===== Инициализация Telegram Web App API ===== */
useEffect(() => {
  try {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      
      // Сначала пробуем расширить на весь доступный экран
      tg.expand();
      
      // Пробуем запросить полноэкранный режим (Bot API 8.0+)
      try {
        // Проверяем, поддерживается ли fullscreen
        if (tg.requestFullscreen) {
          // Можно добавить небольшую задержку для уверенности
          setTimeout(() => {
            tg.requestFullscreen();
            console.log('Fullscreen requested');
          }, 100);
        }
      } catch (fullscreenError) {
        console.log('Fullscreen not supported, using expand only');
      }
      
      // Устанавливаем цвет статус-бара в тон приложению
      if (tg.setHeaderColor) {
        tg.setHeaderColor(mode === 'dark' ? '#0d0d1a' : '#FFFFFF');
      }
      
      // Также можно установить цвет фона (опционально)
      if (tg.setBackgroundColor) {
        tg.setBackgroundColor(mode === 'dark' ? '#0d0d1a' : '#FFFFFF');
      }

      // Визуальные переменные Telegram WebApp: стабильная высота и верхние кнопки
      const root = document.documentElement;
      const setViewportVars = () => {
        const viewport = window.innerHeight;
        const stable = tg.viewportStableHeight || viewport;
        root.style.setProperty('--tg-viewport-stable-height', `${stable}px`);
        root.style.setProperty('--tg-viewport-height', `${viewport}px`);
        const topControls = Math.max(0, viewport - stable);
        root.style.setProperty('--tg-top-controls-height', `${topControls}px`);
      };
      setViewportVars();
      tg.onEvent?.('viewportChanged', setViewportVars);
      return () => tg.offEvent?.('viewportChanged', setViewportVars);
    }
  } catch (error) {
    console.error('Telegram WebApp init error:', error);
  }
}, [mode]);

  /* ===== Ежедневный логин бонус + сброс квестов ===== */
  useEffect(() => {
    const lastLogin = user.lastLogin;
    const now = Date.now();
    if (now - lastLogin > 86400000) {
      const karmaBonus = 10 + Math.floor(Math.random() * 90);
      const isConsecutive = now - lastLogin < 172800000;
      updateUser({
        karma: user.karma + karmaBonus,
        totalTradesToday: 0,
        dailyVotesUsed: 0,
        lastLogin: now,
        lastVoteReset: now,
        consecutiveLoginDays: isConsecutive ? user.consecutiveLoginDays + 1 : 1,
      });
      if (now - user.lastQuestReset > 86400000) {
        resetDailyQuests();
        updateUser({ lastQuestReset: now });
      }
    }
    if (!nextDividendTime || nextDividendTime === 0) {
      setNextDividendTime(now + 60 * 1000);
    }
  }, [user.lastLogin, user.lastQuestReset, nextDividendTime, setNextDividendTime, updateUser, resetDailyQuests]);

  /* ===== Рендер текущего экрана ===== */
  const renderScreen = useCallback(() => {
    if (window.location.pathname === '/test-dev') return <DevToolsScreen />;
    switch (screen) {
      case 'market': return <MarketScreen />;
      case 'portfolio': return <PortfolioScreen />;
      case 'rewards': return <RewardsScreen onOpenPremium={() => setPremiumModalOpen(true)} />;
      case 'friends': return <FriendsScreen />;
      case 'profile': return <ProfileScreen onOpenPremium={() => setPremiumModalOpen(true)} />;
      case 'advisor' as string: return <AdvisorScreen />;
      default: return <MarketScreen />;
    }
  }, [screen]);

  const screenTitles: Record<string, string> = {
    market: 'Маркет', portfolio: 'Портфель', rewards: 'Награды',
    friends: 'Друзья', profile: 'Профиль', advisor: '🤖 AI-Советник',
  };

  return (
    <div className="min-h-screen transition-colors duration-300 flex flex-col theme-liquid liquid-bg" 
      style={{ backgroundColor: theme.bg, color: theme.textPrimary }}>
      <GameLoop />
      
      {/* Хэдер с поддержкой Safe Area (iPhone Notch / Dynamic Island) */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl border-b transition-colors duration-300 glass-nav"
        style={{ 
          backgroundColor: theme.bgHeader, 
          borderColor: theme.bgCardBorder,
          paddingTop: 'max(var(--safe-area-inset-top, 0px), env(safe-area-inset-top, 0px))' 
        }}>
        
        {/* Визуальная имитация статус-бара */}
        <div style={{ height: 'max(var(--safe-area-inset-top, 0px), env(safe-area-inset-top, 0px))' }} className="w-full" />

        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00FF7F] to-[#00CC66] flex items-center justify-center">
              <BarChart3 size={16} className="text-black" />
            </div>
            <div>
              <h1 className="font-bold text-sm leading-tight" style={{ color: theme.textPrimary }}>KarmaMarket</h1>
              <p className="text-[10px]" style={{ color: theme.textMuted }}>{screenTitles[screen] || 'Маркет'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPremiumModalOpen(true)}
              className="relative p-1.5 rounded-xl transition-all active:scale-95"
              style={{ backgroundColor: user.premium ? '#FFD70015' : theme.inputBg }}>
              {user.premium ? (
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}>
                  <Crown size={16} style={{ color: '#FFD700' }} />
                </motion.div>
              ) : (
                <Crown size={16} style={{ color: theme.textMuted }} />
              )}
            </button>
            <div className="rounded-xl px-3 py-1.5 flex items-center gap-1.5" style={{ backgroundColor: theme.inputBg }}>
              <span className="text-[8px]">💎</span>
              <span className="text-xs font-bold" style={{ color: theme.accentGold }}>{user.balance.toFixed(1)}</span>
            </div>
            <div className="rounded-xl px-3 py-1.5 flex items-center gap-1.5" style={{ backgroundColor: theme.inputBg }}>
              <TrendingUp size={12} style={{ color: theme.accent }} />
              <span className="text-xs font-bold" style={{ color: theme.accent }}>{user.karma}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Контент с динамическим отступом сверху */}
      <main className="max-w-lg mx-auto w-full flex-1" 
        style={{ 
          paddingTop: 'calc(60px + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
        }}>
        {renderScreen()}
      </main>

      <BottomNav />
      <TradeModal />
      <OnboardingModal />
      <NotificationToast />
      <PremiumModal isOpen={premiumModalOpen} onClose={() => setPremiumModalOpen(false)} />
    </div>
  );
}
