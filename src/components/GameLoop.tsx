import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

/**
 * GameLoop отвечает за все фоновые процессы и таймеры приложения.
 * Он не рендерит видимый UI, только управляет состоянием через интервалы.
 */
export function GameLoop() {
  const {
    updateSharePrices,
    calculateDividends,
    triggerEvent,
    activeEvent,
    persist,
    checkPremiumExpiry,
  } = useGameStore();

  /* ===== Проверка истечения Premium (раз в минуту) ===== */
  useEffect(() => {
    checkPremiumExpiry();
    const interval = setInterval(checkPremiumExpiry, 60000);
    return () => clearInterval(interval);
  }, [checkPremiumExpiry]);

  /* ===== Реал-тайм обновление цен (каждые 10 сек) ===== */
  useEffect(() => {
    const interval = setInterval(() => {
      updateSharePrices();
    }, 10000);
    return () => clearInterval(interval);
  }, [updateSharePrices]);

  /* ===== Расчёт дивидендов (каждые 5 сек) ===== */
  useEffect(() => {
    const interval = setInterval(() => {
      calculateDividends();
    }, 5000);
    return () => clearInterval(interval);
  }, [calculateDividends]);

  /* ===== Рандомные события (каждые 30 мин) ===== */
  useEffect(() => {
    const interval = setInterval(() => {
      if (!activeEvent || Date.now() > activeEvent.endsAt) {
        if (Math.random() > 0.5) triggerEvent();
      }
    }, 1800000);
    return () => clearInterval(interval);
  }, [activeEvent, triggerEvent]);

  /* ===== Auto-save (каждые 30 сек) ===== */
  useEffect(() => {
    let isSaving = false;
    const interval = setInterval(async () => {
      if (isSaving) return;
      isSaving = true;
      try {
        await persist();
      } catch (err) {
        console.error('[Auto-save] err:', err);
      } finally {
        isSaving = false;
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [persist]);

  return null; // Компонент ничего не рендерит
}
