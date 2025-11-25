import type { ThemeChoice } from '../types';

const THEME_KEY = 'themeChoice';

export const readThemeChoice = (): ThemeChoice => {
  if (typeof window === 'undefined') return 'system';
  const stored = window.localStorage.getItem(THEME_KEY) as ThemeChoice | null;
  return stored ?? 'system';
};

export const applyThemeChoice = (choice: ThemeChoice) => {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const root = document.documentElement;
  const systemPrefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const resolved = choice === 'system' ? (systemPrefersDark ? 'dark' : 'light') : choice;
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
};

export const persistThemeChoice = (choice: ThemeChoice) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(THEME_KEY, choice);
  applyThemeChoice(choice);
  window.dispatchEvent(new CustomEvent<ThemeChoice>('theme:change', { detail: choice }));
};

export const initializeThemeFromStorage = (): ThemeChoice => {
  const choice = readThemeChoice();
  applyThemeChoice(choice);
  return choice;
};
