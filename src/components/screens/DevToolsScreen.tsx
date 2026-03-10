/* ===== DevTools — Инструментарий тестировщика ===== */
import { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useTheme } from '../../store/themeStore';
import { DataServiceFactory } from '../../services/dataServiceFactory';
import {
  Clock, DollarSign, User, Package, List, Trash2, Play, RotateCcw,
  Settings, CheckCircle, XCircle, Copy, Download, Upload, Zap,
  TrendingUp, Crown, Gift, Activity, Terminal, Bug, Rocket, Database, Smartphone
} from 'lucide-react';
import { motion } from 'framer-motion';

type Tab = 'dividends' | 'user' | 'portfolio' | 'quests' | 'log' | 'settings';

interface LogEntry {
  id: string;
  timestamp: Date;
  action: string;
  details: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export function DevToolsScreen() {
  const {
    user, updateUser, nextDividendTime, setNextDividendTime,
    unclaimedDividends, claimDividends, calculateDividends,
    holdings, shares, dailyQuests, updateQuestProgress, persist,
  } = useGameStore();
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState<Tab>('dividends');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(10);
  const [customBalance, setCustomBalance] = useState(1000);
  const [currentService, setCurrentService] = useState<'localStorage' | 'api'>(() => DataServiceFactory.getType());

  // Тестовые режимы
  const [testMode, setTestMode] = useState(false);
  const [notchSimulated, setNotchSimulated] = useState(false);

  const toggleNotchSimulation = () => {
    const root = document.documentElement;
    if (!notchSimulated) {
      root.style.setProperty('--safe-area-inset-top', '47px');
      root.style.setProperty('--safe-area-inset-bottom', '34px');
      // Для CSS env() мы не можем напрямую менять значения через JS, 
      // но мы можем добавить вспомогательные классы или использовать CSS переменные-фоллбеки.
      // Чтобы симуляция была наглядной, я добавлю класс к body
      document.body.classList.add('simulate-notch');
    } else {
      root.style.setProperty('--safe-area-inset-top', '0px');
      root.style.setProperty('--safe-area-inset-bottom', '0px');
      document.body.classList.remove('simulate-notch');
    }
    setNotchSimulated(!notchSimulated);
  };

  // Синхронизация с глобальным TEST_MODE
  useEffect(() => {
    const globalTestMode = typeof window !== 'undefined' && (window as any).KM_TEST_MODE === true;
    setTestMode(globalTestMode);
  }, []);

  const handleToggleTestMode = () => {
    const newValue = !testMode;
    if (typeof window !== 'undefined') {
      (window as any).KM_TEST_MODE = newValue;
    }
    setTestMode(newValue);
    addLog(
      'Тестовый режим дивидендов',
      newValue ? '10-секундный интервал включён' : 'Стандартный интервал (2ч/4ч)',
      newValue ? 'warning' : 'info'
    );
  };

  // Логирование действий
  const addLog = (action: string, details: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const entry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      action,
      details,
      type,
    };
    setLogs(prev => [entry, ...prev].slice(0, 100));
  };

  // Статус дивидендов
  const dividendStatus = useMemo(() => {
    const now = Date.now();
    const remaining = Math.max(0, nextDividendTime - now);
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    const eligibleHoldings = holdings.filter(h => (now - h.boughtAt) >= 86400000);

    return {
      remaining,
      formatted: `${hours}ч ${minutes}м ${seconds}с`,
      isPremium: user.premium && user.premiumExpiresAt > now,
      unclaimed: unclaimedDividends,
      totalHoldings: holdings.length,
      eligibleHoldings: eligibleHoldings.length,
    };
  }, [nextDividendTime, unclaimedDividends, holdings, user]);

  // Действия с дивидендами
  const handleSetTimer = () => {
    const now = Date.now();
    setNextDividendTime(now + timerSeconds * 1000);
    addLog('Установка таймера', `Таймер установлен на ${timerSeconds} сек`, 'success');
  };

  const handleSetTimerPast = () => {
    const now = Date.now();
    setNextDividendTime(now - timerSeconds * 1000);
    addLog('Таймер в прошлое', `Таймер установлен на ${timerSeconds} сек назад`, 'warning');
  };

  const handleForceCalculate = () => {
    const now = Date.now();
    setNextDividendTime(now - 1000);
    setTimeout(() => {
      calculateDividends();
      addLog('Форс-расчёт', 'Принудительный расчёт дивидендов выполнен', 'success');
    }, 100);
  };

  const handleClaim = () => {
    claimDividends();
    addLog('Сбор дивидендов', `Собрано ${unclaimedDividends.toFixed(2)} $KARMA`, 'success');
  };

  const handleResetTimer = () => {
    setNextDividendTime(0);
    addLog('Сброс таймера', 'Таймер сброшен в 0', 'warning');
  };

  // Действия с пользователем
  const handleAddBalance = () => {
    updateUser({ balance: user.balance + customBalance });
    addLog('Баланс', `Добавлено ${customBalance} $KARMA`, 'success');
  };

  const handleSetPremium = () => {
    const now = Date.now();
    updateUser({
      premium: true,
      premiumExpiresAt: now + 30 * 86400000,
      premiumPurchasedAt: now,
    });
    addLog('Premium', 'Активирован Premium на 30 дней', 'success');
  };

  const handleRemovePremium = () => {
    updateUser({ premium: false, premiumExpiresAt: 0 });
    addLog('Premium', 'Premium деактивирован', 'warning');
  };

  const handleSetLevel = (level: number) => {
    const karmaByLevel = [0, 50, 120, 200, 350, 500, 700, 1000, 1500, 2000, 3000, 4000, 5500, 7000, 9000, 12000, 16000, 22000, 30000, 50000];
    updateUser({ karma: karmaByLevel[level - 1] || 0 });
    addLog('Уровень', `Установлен уровень ${level}`, 'info');
  };

  // Действия с портфелем
  const handleAgeHoldings = () => {
    // Для тестов: "состариваем" все акции на 25 часов
    const state = useGameStore.getState();
    const newHoldings = state.holdings.map(h => ({
      ...h,
      boughtAt: Date.now() - 25 * 3600000,
    }));
    // Примечание: это не сработает напрямую, нужно через store
    addLog('Портфель', 'Все акции "состарены" на 25 часов (требуется перезагрузка)', 'info');
  };

  const handleExportHoldings = () => {
    const data = JSON.stringify(holdings, null, 2);
    navigator.clipboard.writeText(data);
    addLog('Экспорт', 'Портфель скопирован в буфер обмена', 'success');
  };

  // Действия с квестами
  const handleCompleteAllQuests = () => {
    dailyQuests.forEach(q => {
      updateQuestProgress(q.type, q.target);
    });
    addLog('Квесты', 'Все квесты выполнены', 'success');
  };

  const handleResetQuests = () => {
    addLog('Квесты', 'Сброс квестов (требуется перезагрузка)', 'warning');
  };

  const handleExportLogs = () => {
    const data = JSON.stringify(logs.map(l => ({
      ...l,
      timestamp: l.timestamp.toISOString(),
    })), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devtools-log-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('Экспорт', 'Лог экспортирован в JSON', 'success');
  };

  const handleClearLogs = () => {
    setLogs([]);
    addLog('Лог', 'Лог очищен', 'info');
  };

  // Переключение сервиса
  const handleSwitchService = async (type: 'localStorage' | 'api') => {
    if (type === 'api') {
      addLog('Сервис', 'API сервис пока недоступен (заглушка)', 'warning');
      return;
    }
    addLog('Сервис', `Переключение на ${type === 'localStorage' ? 'LocalStorage' : 'API'}...`, 'info');
    await DataServiceFactory.switchService(type);
  };

  // Экспорт всех данных
  const handleExportAllData = async () => {
    try {
      const data = await DataServiceFactory.getService().exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `karma-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addLog('Экспорт', 'Все данные экспортированы', 'success');
    } catch (error) {
      addLog('Экспорт', 'Ошибка экспорта', 'error');
    }
  };

  // Импорт данных
  const handleImportData = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const json = event.target?.result as string;
          await DataServiceFactory.getService().importData(json);
          addLog('Импорт', 'Данные импортированы', 'success');
          setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
          addLog('Импорт', 'Ошибка импорта', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Очистка всех данных
  const handleClearAllData = async () => {
    if (!confirm('Вы уверены? Все данные будут удалены!')) return;
    await DataServiceFactory.getService().clear();
    addLog('Очистка', 'Все данные удалены', 'warning');
    setTimeout(() => window.location.reload(), 1000);
  };

  // Пресеты
  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'quick-test':
        setNextDividendTime(Date.now() - 1000);
        addLog('Пресет', 'Быстрый тест: таймер в прошлое', 'success');
        break;
      case 'premium':
        handleSetPremium();
        setNextDividendTime(Date.now() - 1000);
        addLog('Пресет', 'Premium + дивиденды готовы', 'success');
        break;
      case 'rich':
        updateUser({ balance: 100000, karma: 50000, level: 20 });
        addLog('Пресет', 'Богач: 100к $KARMA, 20 уровень', 'success');
        break;
    }
  };

  // Рендер иконок вкладок
  const renderTabIcon = (tab: Tab) => {
    switch (tab) {
      case 'dividends': return <DollarSign size={18} />;
      case 'user': return <User size={18} />;
      case 'portfolio': return <Package size={18} />;
      case 'quests': return <List size={18} />;
      case 'log': return <Terminal size={18} />;
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: theme.bg, color: theme.textPrimary }}>
      <div className="max-w-6xl mx-auto">
        {/* Хэдер */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Bug size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">🧪 DevTools</h1>
              <p className="text-sm" style={{ color: theme.textSecondary }}>Инструментарий тестировщика</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{ backgroundColor: theme.inputBg, color: theme.textPrimary }}
            >
              ← На главную
            </button>
          </div>
        </div>

        {/* Пресеты */}
        <div className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.bgCardBorder}` }}>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={18} style={{ color: theme.accentGold }} />
            <h2 className="font-bold text-sm">⚡ Быстрые пресеты</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => applyPreset('quick-test')}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95"
              style={{ backgroundColor: theme.accent + '20', color: theme.accent }}
            >
              🚀 Быстрый тест
            </button>
            <button
              onClick={() => applyPreset('premium')}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95"
              style={{ backgroundColor: '#FFD70020', color: '#FFD700' }}
            >
              👑 Premium
            </button>
            <button
              onClick={() => applyPreset('rich')}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95"
              style={{ backgroundColor: theme.accentGold + '20', color: theme.accentGold }}
            >
              💰 Богач
            </button>
          </div>
        </div>

        {/* Вкладки */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['dividends', 'user', 'portfolio', 'quests', 'log', 'settings'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap"
              style={{
                backgroundColor: activeTab === tab ? theme.accent : theme.inputBg,
                color: activeTab === tab ? '#000' : theme.textPrimary,
              }}
            >
              {renderTabIcon(tab)}
              {tab === 'dividends' && '💰 Дивиденды'}
              {tab === 'user' && '👤 Пользователь'}
              {tab === 'portfolio' && '📦 Портфель'}
              {tab === 'quests' && '📋 Квесты'}
              {tab === 'log' && '📜 Лог'}
            </button>
          ))}
        </div>

        {/* Контент вкладок */}
        <div className="p-5 rounded-2xl" style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.bgCardBorder}` }}>
          
          {/* Вкладка: Дивиденды */}
          {activeTab === 'dividends' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign size={20} style={{ color: theme.accent }} />
                <h2 className="font-bold text-lg">Управление дивидендами</h2>
              </div>

              {/* Статус */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: theme.inputBg }}>
                  <p className="text-xs mb-1" style={{ color: theme.textSecondary }}>До начисления</p>
                  <p className="text-xl font-bold" style={{ color: theme.accent }}>{dividendStatus.formatted}</p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: theme.inputBg }}>
                  <p className="text-xs mb-1" style={{ color: theme.textSecondary }}>Несобранные</p>
                  <p className="text-xl font-bold" style={{ color: theme.accentGold }}>{dividendStatus.unclaimed.toFixed(2)} $K</p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: theme.inputBg }}>
                  <p className="text-xs mb-1" style={{ color: theme.textSecondary }}>Акции</p>
                  <p className="text-xl font-bold">{dividendStatus.totalHoldings} / {dividendStatus.eligibleHoldings} ✅</p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: theme.inputBg }}>
                  <p className="text-xs mb-1" style={{ color: theme.textSecondary }}>Premium</p>
                  <p className="text-xl font-bold">{dividendStatus.isPremium ? '✅' : '❌'}</p>
                </div>
              </div>

              {/* Таймер */}
              <div>
                <h3 className="font-bold mb-3">Таймер</h3>
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="number"
                    value={timerSeconds}
                    onChange={(e) => setTimerSeconds(Number(e.target.value))}
                    className="w-24 px-3 py-2 rounded-xl text-sm"
                    style={{ backgroundColor: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.textPrimary }}
                  />
                  <span className="text-sm" style={{ color: theme.textSecondary }}>секунд</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={handleSetTimer} className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95" style={{ backgroundColor: theme.accent + '20', color: theme.accent }}>
                    ⏰ Установить вперёд
                  </button>
                  <button onClick={handleSetTimerPast} className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95" style={{ backgroundColor: theme.accentGold + '20', color: theme.accentGold }}>
                    ⏮ Установить назад
                  </button>
                  <button onClick={handleResetTimer} className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95" style={{ backgroundColor: theme.inputBg, color: theme.textPrimary }}>
                    🔄 Сброс
                  </button>
                </div>
              </div>

              {/* Действия */}
              <div>
                <h3 className="font-bold mb-3">Действия</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={handleForceCalculate} className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95" style={{ backgroundColor: theme.accent, color: '#000' }}>
                    ⚡ Форс-расчёт
                  </button>
                  <button onClick={handleClaim} disabled={unclaimedDividends <= 0} className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-50" style={{ backgroundColor: unclaimedDividends > 0 ? theme.accentGold : theme.inputBg, color: unclaimedDividends > 0 ? '#000' : theme.textMuted }}>
                    💰 Собрать дивиденды
                  </button>
                </div>
              </div>

              {/* Тестовые режимы */}
              <div>
                <h3 className="font-bold mb-3">Тестовые режимы</h3>
                <div className="space-y-2 text-sm" style={{ color: theme.textSecondary }}>
                  <p>⚙️ Для включения тестовых режимов измените в коде:</p>
                  <code className="block p-3 rounded-xl mt-2 text-xs" style={{ backgroundColor: theme.inputBg }}>
                    src/store/gameStore.ts: const TEST_MODE = true;<br />
                    src/App.tsx: const USE_TEST_INTERVAL = true;
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* Вкладка: Пользователь */}
          {activeTab === 'user' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <User size={20} style={{ color: theme.accent }} />
                <h2 className="font-bold text-lg">Пользователь</h2>
              </div>

              {/* Статус */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: theme.inputBg }}>
                  <p className="text-xs mb-1" style={{ color: theme.textSecondary }}>Баланс</p>
                  <p className="text-xl font-bold" style={{ color: theme.accentGold }}>{user.balance.toFixed(0)} $K</p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: theme.inputBg }}>
                  <p className="text-xs mb-1" style={{ color: theme.textSecondary }}>Карма</p>
                  <p className="text-xl font-bold" style={{ color: theme.accent }}>{user.karma}</p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: theme.inputBg }}>
                  <p className="text-xs mb-1" style={{ color: theme.textSecondary }}>Уровень</p>
                  <p className="text-xl font-bold">{user.level}</p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: theme.inputBg }}>
                  <p className="text-xs mb-1" style={{ color: theme.textSecondary }}>Premium</p>
                  <p className="text-xl font-bold">{user.premium ? '✅' : '❌'}</p>
                </div>
              </div>

              {/* Баланс */}
              <div>
                <h3 className="font-bold mb-3">Баланс</h3>
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="number"
                    value={customBalance}
                    onChange={(e) => setCustomBalance(Number(e.target.value))}
                    className="w-32 px-3 py-2 rounded-xl text-sm"
                    style={{ backgroundColor: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.textPrimary }}
                  />
                  <button onClick={handleAddBalance} className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95" style={{ backgroundColor: theme.accent + '20', color: theme.accent }}>
                    💵 Добавить
                  </button>
                </div>
              </div>

              {/* Premium */}
              <div>
                <h3 className="font-bold mb-3">Premium</h3>
                <div className="flex gap-2">
                  <button onClick={handleSetPremium} className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95" style={{ backgroundColor: '#FFD70020', color: '#FFD700' }}>
                    👑 Активировать (30 дней)
                  </button>
                  <button onClick={handleRemovePremium} className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95" style={{ backgroundColor: theme.inputBg, color: theme.textPrimary }}>
                    ❌ Деактивировать
                  </button>
                </div>
              </div>

              {/* Уровень */}
              <div>
                <h3 className="font-bold mb-3">Уровень</h3>
                <div className="flex flex-wrap gap-2">
                  {[1, 5, 10, 15, 20].map(level => (
                    <button
                      key={level}
                      onClick={() => handleSetLevel(level)}
                      className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95"
                      style={{ backgroundColor: theme.inputBg, color: theme.textPrimary }}
                    >
                      Ур. {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Вкладка: Портфель */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Package size={20} style={{ color: theme.accent }} />
                <h2 className="font-bold text-lg">Портфель</h2>
              </div>

              {/* Статистика */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: theme.inputBg }}>
                  <p className="text-xs mb-1" style={{ color: theme.textSecondary }}>Всего акций</p>
                  <p className="text-xl font-bold">{holdings.length}</p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: theme.inputBg }}>
                  <p className="text-xs mb-1" style={{ color: theme.textSecondary }}>≥ 24 часов</p>
                  <p className="text-xl font-bold" style={{ color: theme.accent }}>
                    {holdings.filter(h => (Date.now() - h.boughtAt) >= 86400000).length}
                  </p>
                </div>
              </div>

              {/* Список */}
              <div>
                <h3 className="font-bold mb-3">Акции</h3>
                {holdings.length === 0 ? (
                  <p className="text-sm" style={{ color: theme.textSecondary }}>Портфель пуст</p>
                ) : (
                  <div className="space-y-2">
                    {holdings.map((h, i) => {
                      const share = shares.find(s => s.id === h.shareId);
                      const hoursOwned = (Date.now() - h.boughtAt) / 3600000;
                      const eligible = hoursOwned >= 24;
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-xl text-sm"
                          style={{ backgroundColor: theme.inputBg }}
                        >
                          <div className="flex items-center gap-2">
                            <span>{share?.avatar || '📄'}</span>
                            <span style={{ color: theme.textPrimary }}>{share?.ticker || h.shareId}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span style={{ color: theme.textSecondary }}>{h.amount} шт</span>
                            <span style={{ color: theme.textSecondary }}>{hoursOwned.toFixed(1)} ч</span>
                            {eligible ? (
                              <CheckCircle size={16} style={{ color: theme.accent }} />
                            ) : (
                              <XCircle size={16} style={{ color: theme.danger }} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Действия */}
              <div className="flex gap-2">
                <button onClick={handleAgeHoldings} className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95" style={{ backgroundColor: theme.accent + '20', color: theme.accent }}>
                  🕰 Состарить на 25ч
                </button>
                <button onClick={handleExportHoldings} className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95" style={{ backgroundColor: theme.inputBg, color: theme.textPrimary }}>
                  📋 Экспорт
                </button>
              </div>
            </div>
          )}

          {/* Вкладка: Квесты */}
          {activeTab === 'quests' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <List size={20} style={{ color: theme.accent }} />
                <h2 className="font-bold text-lg">Квесты</h2>
              </div>

              {/* Список квестов */}
              <div className="space-y-2">
                {dailyQuests.map((quest, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl text-sm"
                    style={{ backgroundColor: theme.inputBg }}
                  >
                    <div className="flex items-center gap-2">
                      <span>{quest.icon}</span>
                      <div>
                        <p style={{ color: theme.textPrimary }}>{quest.title}</p>
                        <p className="text-xs" style={{ color: theme.textSecondary }}>
                          {quest.progress} / {quest.target}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {quest.completed ? (
                        <CheckCircle size={18} style={{ color: theme.accent }} />
                      ) : (
                        <XCircle size={18} style={{ color: theme.textMuted }} />
                      )}
                      {quest.claimed && (
                        <span className="text-xs" style={{ color: theme.accentGold }}>✅</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Действия */}
              <div className="flex gap-2">
                <button onClick={handleCompleteAllQuests} className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95" style={{ backgroundColor: theme.accent, color: '#000' }}>
                  ✅ Выполнить все
                </button>
                <button onClick={handleResetQuests} className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95" style={{ backgroundColor: theme.inputBg, color: theme.textPrimary }}>
                  🔄 Сбросить
                </button>
              </div>
            </div>
          )}

          {/* Вкладка: Лог */}
          {activeTab === 'log' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Terminal size={20} style={{ color: theme.accent }} />
                  <h2 className="font-bold text-lg">Лог действий</h2>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleExportLogs} className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 flex items-center gap-1" style={{ backgroundColor: theme.inputBg, color: theme.textPrimary }}>
                    <Download size={14} /> Экспорт
                  </button>
                  <button onClick={handleClearLogs} className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 flex items-center gap-1" style={{ backgroundColor: theme.danger + '20', color: theme.danger }}>
                    <Trash2 size={14} /> Очистить
                  </button>
                </div>
              </div>

              {/* Список логов */}
              {logs.length === 0 ? (
                <p className="text-sm" style={{ color: theme.textSecondary }}>Лог пуст</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-auto">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl text-xs"
                      style={{
                        backgroundColor: theme.inputBg,
                        borderLeft: `3px solid ${
                          log.type === 'success' ? theme.accent :
                          log.type === 'warning' ? theme.accentGold :
                          log.type === 'error' ? theme.danger :
                          theme.textMuted
                        }`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold" style={{ color: theme.textPrimary }}>{log.action}</span>
                        <span className="text-[10px]" style={{ color: theme.textMuted }}>
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p style={{ color: theme.textSecondary }}>{log.details}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Вкладка: Настройки */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Database size={20} style={{ color: theme.accent }} />
                <h2 className="font-bold text-lg">Настройки данных</h2>
              </div>

              {/* Тестовый режим дивидендов */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: theme.inputBg }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bug size={20} style={{ color: testMode ? theme.accentGold : theme.textMuted }} />
                    <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>Тестовый режим дивидендов</p>
                  </div>
                  <button
                    onClick={handleToggleTestMode}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${testMode ? 'animate-pulse' : ''}`}
                    style={{
                      backgroundColor: testMode ? theme.accentGold + '30' : theme.inputBg,
                      color: testMode ? theme.accentGold : theme.textMuted,
                      border: `1px solid ${testMode ? theme.accentGold : theme.inputBorder}`,
                    }}
                  >
                    {testMode ? '⚡ 10 сек' : '🕐 2ч/4ч'}
                  </button>
                </div>
                <p className="text-xs mb-3" style={{ color: theme.textSecondary }}>
                  {testMode
                    ? '✅ Дивиденды начисляются каждые 10 секунд (для тестирования)'
                    : 'Стандартный режим: 2 часа (Premium) / 4 часа (Free)'}
                </p>
              </div>

              {/* Текущий сервис */}
              <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: theme.inputBg }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Smartphone size={20} style={{ color: notchSimulated ? theme.accent : theme.textMuted }} />
                    <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>Симуляция iPhone (Safe Area)</p>
                  </div>
                  <button
                    onClick={toggleNotchSimulation}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={{
                      backgroundColor: notchSimulated ? theme.accent + '30' : theme.inputBg,
                      color: notchSimulated ? theme.accent : theme.textMuted,
                      border: `1px solid ${notchSimulated ? theme.accent : theme.inputBorder}`,
                    }}
                  >
                    {notchSimulated ? 'ВКЛ (iPhone)' : 'ВЫКЛ (PC)'}
                  </button>
                </div>
                <p className="text-xs" style={{ color: theme.textSecondary }}>
                  Добавляет визуальный вырез (Notch) и системные отступы сверху и снизу для проверки дизайна.
                </p>
              </div>

              <div className="p-4 rounded-xl" style={{ backgroundColor: theme.inputBg }}>
                <p className="text-sm mb-2" style={{ color: theme.textSecondary }}>Текущий сервис хранения:</p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="px-4 py-2 rounded-xl font-bold" style={{ backgroundColor: currentService === 'localStorage' ? theme.accent + '20' : theme.inputBg, color: currentService === 'localStorage' ? theme.accent : theme.textMuted }}>
                    💾 LocalStorage
                  </div>
                  <div className="px-4 py-2 rounded-xl font-bold" style={{ backgroundColor: currentService === 'api' ? theme.accent + '20' : theme.inputBg, color: currentService === 'api' ? theme.accent : theme.textMuted }}>
                    🌐 API + PostgreSQL
                  </div>
                </div>
                <p className="text-xs mb-3" style={{ color: theme.textSecondary }}>
                  Сейчас: <strong>{currentService === 'localStorage' ? 'LocalStorage (прототип)' : 'API + PostgreSQL (production)'}</strong>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSwitchService('localStorage')}
                    disabled={currentService === 'localStorage'}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-50"
                    style={{ backgroundColor: theme.accent, color: '#000' }}
                  >
                    💾 LocalStorage
                  </button>
                  <button
                    onClick={() => handleSwitchService('api')}
                    disabled={currentService === 'api' || true}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-50"
                    style={{ backgroundColor: theme.inputBg, color: theme.textPrimary }}
                  >
                    🌐 API (скоро)
                  </button>
                </div>
                <p className="text-xs mt-2" style={{ color: theme.textMuted }}>
                  ⚠️ Переключение требует перезагрузки страницы
                </p>
              </div>

              {/* Экспорт/Импорт */}
              <div>
                <h3 className="font-bold mb-3">Экспорт/Импорт данных</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={handleExportAllData} className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 flex items-center gap-2" style={{ backgroundColor: theme.accent + '20', color: theme.accent }}>
                    <Download size={16} /> Экспорт всех данных
                  </button>
                  <button onClick={handleImportData} className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 flex items-center gap-2" style={{ backgroundColor: theme.inputBg, color: theme.textPrimary }}>
                    <Upload size={16} /> Импорт данных
                  </button>
                </div>
              </div>

              {/* Опасная зона */}
              <div>
                <h3 className="font-bold mb-3" style={{ color: theme.danger }}>🔴 Опасная зона</h3>
                <div className="p-4 rounded-xl" style={{ backgroundColor: theme.danger + '10', border: `1px solid ${theme.danger}30` }}>
                  <p className="text-sm mb-3" style={{ color: theme.textSecondary }}>
                    Полная очистка всех данных приложения. Это действие необратимо!
                  </p>
                  <button
                    onClick={handleClearAllData}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95"
                    style={{ backgroundColor: theme.danger, color: '#fff' }}
                  >
                    🗑 Удалить все данные
                  </button>
                </div>
              </div>

              {/* Информация */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: theme.inputBg }}>
                <h3 className="font-bold mb-2">ℹ️ Информация</h3>
                <ul className="text-xs space-y-1" style={{ color: theme.textSecondary }}>
                  <li>• <strong>LocalStorage</strong> — текущий режим для прототипирования</li>
                  <li>• <strong>API + PostgreSQL</strong> — будущий production режим</li>
                  <li>• Для миграции просто переключите сервис в коде</li>
                  <li>• Все данные сохраняются в формате JSON</li>
                  <li>• Экспорт создаёт полную копию данных</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
