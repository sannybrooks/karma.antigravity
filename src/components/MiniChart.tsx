/* ===== Мини-чарт (sparkline) для карточки акции ===== */
import { useRef, useEffect, useCallback } from 'react';
import type { PricePoint } from '../types';

interface Props {
  data: PricePoint[];
  width?: number;
  height?: number;
  positive: boolean;
  accentUp?: string;
  accentDown?: string;
  fullWidth?: boolean;
}

export function MiniChart({ data, width = 80, height = 32, positive, accentUp = '#00FF7F', accentDown = '#FF4444', fullWidth = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    /* Определяем фактическую ширину */
    let w = width;
    if (fullWidth && containerRef.current) {
      w = containerRef.current.offsetWidth;
      if (w <= 0) return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = height * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, height);

    const closes = data.slice(-24).map(p => p.close);
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const range = max - min || 1;

    const color = positive ? accentUp : accentDown;

    /* Линия */
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;

    closes.forEach((v, i) => {
      const x = (i / (closes.length - 1)) * w;
      const y = height - ((v - min) / range) * (height - 6) - 3;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    /* Градиентная заливка */
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, positive ? 'rgba(0,255,127,0.2)' : 'rgba(255,68,68,0.2)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.lineTo(w, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
  }, [data, width, height, positive, accentUp, accentDown, fullWidth]);

  useEffect(() => {
    const timer = setTimeout(draw, 20);
    if (fullWidth) {
      window.addEventListener('resize', draw);
    }
    return () => {
      clearTimeout(timer);
      if (fullWidth) window.removeEventListener('resize', draw);
    };
  }, [draw, fullWidth]);

  if (fullWidth) {
    return (
      <div ref={containerRef} style={{ width: '100%', height }}>
        <canvas ref={canvasRef} style={{ display: 'block' }} />
      </div>
    );
  }

  return <canvas ref={canvasRef} style={{ width, height }} />;
}

/* ===== Полный чарт с осями (для портфеля и профиля) ===== */
export function FullChart({ data, height = 120, accentUp = '#00FF7F', accentDown = '#FF4444' }: {
  data: PricePoint[];
  height?: number;
  accentUp?: string;
  accentDown?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || data.length < 2) return;

    const w = container.offsetWidth;
    if (w <= 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = height * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = height + 'px';
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, height);

    const closes = data.map(p => p.close);
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const range = max - min || 1;

    const isUp = closes[closes.length - 1] >= closes[0];
    const color = isUp ? accentUp : accentDown;

    // Сетка
    ctx.strokeStyle = 'rgba(128,128,128,0.1)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Свечи
    const candleW = Math.max(2, (w / data.length) * 0.6);
    data.forEach((p, i) => {
      const x = data.length === 1 ? w / 2 : (i / (data.length - 1)) * (w - candleW) + candleW / 2;
      const openY = height - ((p.open - min) / range) * (height - 16) - 8;
      const closeY = height - ((p.close - min) / range) * (height - 16) - 8;
      const highY = height - ((p.high - min) / range) * (height - 16) - 8;
      const lowY = height - ((p.low - min) / range) * (height - 16) - 8;
      const bullish = p.close >= p.open;

      ctx.strokeStyle = bullish ? accentUp : accentDown;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      ctx.fillStyle = bullish ? accentUp : accentDown;
      const bodyTop = Math.min(openY, closeY);
      const bodyH = Math.abs(closeY - openY) || 1;
      ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyH);
    });

    // Линия MA (простая скользящая средняя 7)
    if (closes.length >= 7) {
      ctx.beginPath();
      ctx.strokeStyle = color + '60';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      for (let i = 6; i < closes.length; i++) {
        const ma = closes.slice(i - 6, i + 1).reduce((a, b) => a + b, 0) / 7;
        const x = (i / (closes.length - 1)) * w;
        const y = height - ((ma - min) / range) * (height - 16) - 8;
        if (i === 6) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Ценовые метки
    ctx.fillStyle = 'rgba(128,128,128,0.5)';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(max.toFixed(1), w - 2, 12);
    ctx.fillText(min.toFixed(1), w - 2, height - 4);
  }, [data, height, accentUp, accentDown]);

  useEffect(() => {
    // Рисуем с задержкой, чтобы контейнер успел получить размер (важно для модалов)
    const timer = setTimeout(draw, 30);
    window.addEventListener('resize', draw);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', draw);
    };
  }, [draw]);

  return (
    <div ref={containerRef} style={{ width: '100%', minHeight: height }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
