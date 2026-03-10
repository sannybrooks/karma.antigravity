/* ===== Онбординг — Tutorial 3 шага + стартовый бонус ===== */
import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useTheme } from '../store/themeStore';
import { TrendingUp, Zap, Coins, ArrowRight, Wallet } from 'lucide-react';

const STEPS = [
  {
    icon: TrendingUp,
    title: '📈 Торгуй акциями друзей',
    description: 'Покупай и продавай акции своих друзей как на бирже. Цена зависит от их кармы, объёма торгов и хайпа. Зарабатывай на росте!',
    color: '#00FF7F',
  },
  {
    icon: Zap,
    title: '⚡ Бустай друзей и себя',
    description: 'Бустом поднимай карму друга — его акции растут, ты получаешь дивиденды. Бустай свою карточку для увеличения хайпа!',
    color: '#FFD700',
  },
  {
    icon: Coins,
    title: '💰 Пассивные дивиденды',
    description: 'Держи акции 24ч+ и получай дивиденды. Стейкай $KARMA на 8-15% APY. Выполняй ежедневные квесты для наград!',
    color: '#FF6B6B',
  },
];

export function OnboardingModal() {
  const { user, completeOnboarding } = useGameStore();
  const { theme } = useTheme();
  const [step, setStep] = useState(0);
  const [walletConnected, setWalletConnected] = useState(false);
  
  if (user.onboarded) return null;
  
  const handleConnect = () => {
    setWalletConnected(true);
    localStorage.setItem('km_wallet', 'mock_0x' + Math.random().toString(16).slice(2, 14));
  };
  
  const currentStep = STEPS[step];
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
      <div className="w-full max-w-sm rounded-3xl p-6 shadow-2xl glass-modal"
        style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.bgCardBorder}` }}>
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">💎</div>
          <h1 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>KarmaMarket</h1>
          <p className="text-xs" style={{ color: theme.textMuted }}>Биржа кармы друзей</p>
        </div>
        
        {!walletConnected ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4">
              <Wallet size={28} className="text-blue-400" />
            </div>
            <h2 className="font-bold text-lg mb-2" style={{ color: theme.textPrimary }}>Подключи TON кошелёк</h2>
            <p className="text-sm mb-6" style={{ color: theme.textSecondary }}>Для авторизации и начисления $KARMA</p>
            <button onClick={handleConnect}
              className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-bold text-sm active:scale-95 transition-all shadow-lg shadow-blue-500/20">
              🔗 TON Connect (Mock)
            </button>
            <p className="text-[10px] mt-3" style={{ color: theme.textMuted }}>В MVP используется mock-кошелёк</p>
          </div>
        ) : step < STEPS.length ? (
          <div>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${currentStep.color}15` }}>
                <currentStep.icon size={28} style={{ color: currentStep.color }} />
              </div>
              <h2 className="font-bold text-lg mb-2" style={{ color: theme.textPrimary }}>{currentStep.title}</h2>
              <p className="text-sm leading-relaxed" style={{ color: theme.textSecondary }}>{currentStep.description}</p>
            </div>
            <div className="flex justify-center gap-2 mb-4">
              {STEPS.map((_, i) => (
                <div key={i} className="h-2 rounded-full transition-all"
                  style={{
                    width: i === step ? 24 : 8,
                    backgroundColor: i === step ? theme.accent : i < step ? theme.accent + '60' : theme.inputBg,
                  }} />
              ))}
            </div>
            <button onClick={() => setStep(step + 1)}
              className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
              style={{ backgroundColor: theme.accent, color: '#000' }}>
              {step < STEPS.length - 1 ? 'Далее' : 'Понятно!'} <ArrowRight size={16} />
            </button>
            {step < STEPS.length - 1 && (
              <button onClick={() => setStep(STEPS.length)} className="w-full text-xs mt-2 py-2"
                style={{ color: theme.textMuted }}>Пропустить</button>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="text-5xl mb-4">🎁</div>
            <h2 className="font-bold text-xl mb-2" style={{ color: theme.textPrimary }}>Стартовый бонус!</h2>
            <div className="rounded-2xl p-4 mb-4 space-y-2 glass-card" style={{ backgroundColor: theme.inputBg }}>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: theme.textSecondary }}>Стартовый баланс</span>
                <span className="font-bold" style={{ color: theme.accentGold }}>2 000 $KARMA</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: theme.textSecondary }}>Бонус</span>
                <span className="font-bold" style={{ color: theme.accentGold }}>+100 $KARMA</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: theme.textSecondary }}>Free Shares</span>
                <span className="font-bold" style={{ color: theme.accent }}>10 шт</span>
              </div>
            </div>
            <button onClick={completeOnboarding}
              className="w-full py-3.5 bg-gradient-to-r from-[#00FF7F] to-[#FFD700] text-black rounded-2xl font-bold text-sm active:scale-95 transition-all shadow-lg">
              🚀 Начать торговать!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
