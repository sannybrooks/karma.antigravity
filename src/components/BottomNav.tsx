/* ===== BottomNav в стиле Liquid Glass (iOS 26 Style) ===== */
import { useGameStore } from '../store/gameStore';
import { useTheme } from '../store/themeStore';
import { BarChart3, Briefcase, Gift, Users, UserCircle, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Screen } from '../types';

type NavScreen = Screen | 'advisor';

const BASE_ITEMS: Array<{ screen: NavScreen; label: string; icon: typeof BarChart3 }> = [
  { screen: 'market', label: 'Маркет', icon: BarChart3 },
  { screen: 'portfolio', label: 'Портфель', icon: Briefcase },
  { screen: 'rewards', label: 'Награды', icon: Gift },
  { screen: 'friends', label: 'Друзья', icon: Users },
  { screen: 'profile', label: 'Профиль', icon: UserCircle },
];

export function BottomNav() {
  const { screen, setScreen, unclaimedDividends, dailyQuests, user } = useGameStore();
  const { theme } = useTheme();

  const isPremium = user.premium && user.premiumExpiresAt > Date.now();
  const hasUnclaimedQuests = dailyQuests.some(q => q.completed && !q.claimed);
  const hasRewardsNotif = unclaimedDividends > 0 || hasUnclaimedQuests;

  const activeScreen = screen as NavScreen;

  // Собираем табы
  const navItems: Array<{ screen: NavScreen; label: string; icon: typeof BarChart3; isPro?: boolean }> = [];
  BASE_ITEMS.forEach(item => {
    navItems.push(item);
    if (item.screen === 'rewards' && isPremium) {
      navItems.push({ screen: 'advisor', label: 'AI', icon: Bot, isPro: true });
    }
  });

  const handleNav = (s: NavScreen) => {
    if (s === 'advisor') {
      (setScreen as (s: string) => void)(s);
    } else {
      setScreen(s as Screen);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-[calc(16px+env(safe-area-inset-bottom,0px))] pointer-events-none">
      <motion.nav 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md mx-auto liquid-glass glass-nav glass-hover rounded-[32px] pointer-events-auto p-1.5 flex items-center justify-between"
      >
        {navItems.map((item, index) => {
          const active = activeScreen === item.screen;
          const hasNotif = item.screen === 'rewards' && hasRewardsNotif;
          const accentColor = item.isPro ? '#FFD700' : theme.accent;

          return (
            <button
              key={item.screen}
              onClick={() => handleNav(item.screen)}
              className="relative flex-1 flex flex-col items-center py-2.5 transition-all outline-none"
            >
              {/* Фоновое свечение/индикатор активного таба */}
              <AnimatePresence>
                {active && (
                  <motion.div
                    layoutId="nav-bg"
                    className="absolute inset-0 rounded-2xl z-0"
                    style={{ backgroundColor: `${accentColor}10` }}
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}
              </AnimatePresence>

              <div className="relative z-10 flex flex-col items-center">
                <motion.div
                  animate={{ 
                    scale: active ? 1.15 : 1,
                    y: active ? -2 : 0 
                  }}
                  className={active ? 'glass-icon-active' : ''}
                  style={{ color: active ? accentColor : theme.textMuted }}
                >
                  <item.icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                  
                  {hasNotif && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_rgba(255,215,0,0.6)]"
                      style={{ backgroundColor: theme.accentGold }} />
                  )}
                  
                  {item.isPro && !active && (
                    <div className="absolute -top-1.5 -right-2 px-1 py-0 rounded text-[6px] font-bold leading-tight"
                      style={{ backgroundColor: '#FFD700', color: '#000' }}>
                      PRO
                    </div>
                  )}
                </motion.div>

                <motion.span 
                  animate={{ 
                    opacity: active ? 1 : 0.7,
                    scale: active ? 1 : 0.9 
                  }}
                  className="text-[9px] mt-1 font-semibold tracking-wide"
                  style={{ color: active ? accentColor : theme.textMuted }}
                >
                  {item.label}
                </motion.span>
              </div>

              {/* Активный индикатор под текстом */}
              <AnimatePresence>
                {active && (
                  <motion.div
                    layoutId="active-dot"
                    className="absolute -bottom-0.5 w-1 h-1 rounded-full"
                    style={{ backgroundColor: accentColor }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </motion.nav>
    </div>
  );
}
