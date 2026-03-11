/* ===== Всплывающие уведомления с темой ===== */
import { useGameStore } from '../store/gameStore';
import { useTheme } from '../store/themeStore';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export function NotificationToast() {
  const { notifications, clearNotifications } = useGameStore();
  const { theme } = useTheme();
  const latest = notifications[0];

  if (!latest || Date.now() - latest.timestamp > 4000) return null;

  const icons = {
    success: <CheckCircle size={16} style={{ color: theme.accent }} className="shrink-0" />,
    warning: <AlertTriangle size={16} style={{ color: theme.accentGold }} className="shrink-0" />,
    info: <Info size={16} className="text-blue-400 shrink-0" />,
  };

  const handleClose = () => {
    clearNotifications();
  };

  return (
    <div className="fixed top-2 left-4 right-4 z-[90] animate-slideDown">
      {/* Стеклянный тост-уведомление в стиле Liquid Glass */}
      <div className="backdrop-blur-lg rounded-2xl p-3 flex items-center gap-2 shadow-lg glass-toast"
        style={{ backgroundColor: theme.bgSecondary + 'F0', border: `1px solid ${theme.bgCardBorder}` }}>
        {icons[latest.type]}
        <p className="text-xs flex-1" style={{ color: theme.textPrimary }}>{latest.message}</p>
        <button onClick={handleClose} className="shrink-0 hover:opacity-80 transition-opacity">
          <X size={14} style={{ color: theme.textMuted }} />
        </button>
      </div>
    </div>
  );
}
