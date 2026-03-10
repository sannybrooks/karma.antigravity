/* ===== KarmaMarket — Тема (светлая / тёмная) ===== */
import { create } from 'zustand';
import type { ThemeMode, Theme } from '../types';

const DARK: Theme = {
  bg: '#0b0f1a',
  bgSecondary: 'rgba(18,20,32,0.7)',
  bgCard: 'rgba(255,255,255,0.06)',
  bgCardBorder: 'rgba(255,255,255,0.12)',
  bgHeader: 'rgba(14,16,28,0.7)',
  textPrimary: '#f5f7ff',
  textSecondary: '#b6bdc9',
  textMuted: '#7b8496',
  accent: '#5CF2C2',
  accentGold: '#FFD700',
  danger: '#FF5C5C',
  inputBg: 'rgba(255,255,255,0.06)',
  inputBorder: 'rgba(255,255,255,0.12)',
  navBg: 'rgba(16,18,30,0.75)',
  navBorder: 'rgba(255,255,255,0.12)',
};

const LIGHT: Theme = {
  bg: '#F3F5FA',
  bgSecondary: 'rgba(255,255,255,0.7)',
  bgCard: 'rgba(255,255,255,0.6)',
  bgCardBorder: 'rgba(0,0,0,0.08)',
  bgHeader: 'rgba(255,255,255,0.75)',
  textPrimary: '#1b1f2e',
  textSecondary: '#6b7280',
  textMuted: '#9aa3b2',
  accent: '#19C37D',
  accentGold: '#D4A800',
  danger: '#DC2626',
  inputBg: 'rgba(255,255,255,0.7)',
  inputBorder: 'rgba(0,0,0,0.08)',
  navBg: 'rgba(255,255,255,0.75)',
  navBorder: 'rgba(0,0,0,0.08)',
};

interface ThemeState {
  mode: ThemeMode;
  theme: Theme;
  toggle: () => void;
  setMode: (m: ThemeMode) => void;
}

function loadMode(): ThemeMode {
  try {
    const saved = localStorage.getItem('km_theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch { /* */ }
  return 'dark';
}

export const useTheme = create<ThemeState>((set) => {
  const initial = loadMode();
  return {
    mode: initial,
    theme: initial === 'dark' ? DARK : LIGHT,
    toggle: () => set((s) => {
      const next = s.mode === 'dark' ? 'light' : 'dark';
      localStorage.setItem('km_theme', next);
      return { mode: next, theme: next === 'dark' ? DARK : LIGHT };
    }),
    setMode: (m) => {
      localStorage.setItem('km_theme', m);
      set({ mode: m, theme: m === 'dark' ? DARK : LIGHT });
    },
  };
});
