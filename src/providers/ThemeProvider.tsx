/**
 * Theme Provider for dark/light/system mode, tenant branding,
 * high-contrast support, and RTL layout.
 * Generates CSS custom properties and applies them to the document root.
 * @see Requirements 1.6, 12.2
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAppStore } from '@/store';
import type { ThemeMode } from '@/store';
import type { TenantBranding, InstitutionType, TextDirection } from '@/types/tenant';

/** Theme context value interface */
interface ThemeContextValue {
  /** Current effective theme (resolved from 'system' to actual) */
  readonly theme: 'light' | 'dark';
  /** User-selected theme mode */
  readonly themeMode: ThemeMode;
  /** Whether high-contrast mode is active */
  readonly highContrast: boolean;
  /** Current text direction */
  readonly direction: TextDirection;
  /** Set theme mode */
  readonly setThemeMode: (mode: ThemeMode) => void;
  /** Toggle high-contrast mode */
  readonly toggleHighContrast: () => void;
  /** Set text direction */
  readonly setDirection: (dir: TextDirection) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY_THEME = 'erp_theme_mode';
const STORAGE_KEY_HIGH_CONTRAST = 'erp_high_contrast';
const STORAGE_KEY_DIRECTION = 'erp_text_direction';

/** Default branding when tenant config is unavailable */
const DEFAULT_BRANDING: TenantBranding = {
  logo: '/logo.svg',
  favicon: '/favicon.ico',
  primaryColor: '#2563eb',
  secondaryColor: '#7c3aed',
  accentColor: '#f59e0b',
  fontFamily: 'Inter, system-ui, sans-serif',
  schoolTheme: 'school',
};

/** School theme: rounded, bright, friendly */
const SCHOOL_THEME_VARS: Record<string, string> = {
  '--border-radius-sm': '0.5rem',
  '--border-radius-md': '0.75rem',
  '--border-radius-lg': '1rem',
  '--border-radius-xl': '1.5rem',
  '--shadow-sm': '0 1px 3px rgba(0, 0, 0, 0.08)',
  '--shadow-md': '0 4px 12px rgba(0, 0, 0, 0.1)',
  '--shadow-lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
  '--font-weight-heading': '700',
  '--letter-spacing-heading': '-0.01em',
};

/** College theme: sharp, professional, clean */
const COLLEGE_THEME_VARS: Record<string, string> = {
  '--border-radius-sm': '0.125rem',
  '--border-radius-md': '0.25rem',
  '--border-radius-lg': '0.375rem',
  '--border-radius-xl': '0.5rem',
  '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
  '--shadow-md': '0 2px 8px rgba(0, 0, 0, 0.08)',
  '--shadow-lg': '0 4px 16px rgba(0, 0, 0, 0.1)',
  '--font-weight-heading': '600',
  '--letter-spacing-heading': '0',
};

/** Generate CSS custom properties from branding config */
function generateCssVariables(
  branding: TenantBranding,
  resolvedTheme: 'light' | 'dark',
  highContrast: boolean,
): Record<string, string> {
  const vars: Record<string, string> = {};

  // Color variables
  vars['--color-primary'] = branding.primaryColor;
  vars['--color-secondary'] = branding.secondaryColor;
  vars['--color-accent'] = branding.accentColor;
  vars['--font-family'] = branding.fontFamily;

  // Generate HSL variants for Tailwind-compatible theming
  vars['--color-primary-light'] = adjustColorBrightness(branding.primaryColor, 20);
  vars['--color-primary-dark'] = adjustColorBrightness(branding.primaryColor, -20);
  vars['--color-secondary-light'] = adjustColorBrightness(branding.secondaryColor, 20);
  vars['--color-secondary-dark'] = adjustColorBrightness(branding.secondaryColor, -20);

  // Theme-specific colors
  if (resolvedTheme === 'dark') {
    vars['--color-bg'] = '#0f172a';
    vars['--color-bg-elevated'] = '#1e293b';
    vars['--color-bg-muted'] = '#334155';
    vars['--color-text'] = '#f8fafc';
    vars['--color-text-muted'] = '#94a3b8';
    vars['--color-border'] = '#334155';
    vars['--color-surface'] = '#1e293b';
  } else {
    vars['--color-bg'] = '#ffffff';
    vars['--color-bg-elevated'] = '#f8fafc';
    vars['--color-bg-muted'] = '#f1f5f9';
    vars['--color-text'] = '#0f172a';
    vars['--color-text-muted'] = '#64748b';
    vars['--color-border'] = '#e2e8f0';
    vars['--color-surface'] = '#ffffff';
  }

  // High contrast overrides
  if (highContrast) {
    vars['--color-text'] = resolvedTheme === 'dark' ? '#ffffff' : '#000000';
    vars['--color-text-muted'] = resolvedTheme === 'dark' ? '#e2e8f0' : '#1e293b';
    vars['--color-border'] = resolvedTheme === 'dark' ? '#e2e8f0' : '#1e293b';
    vars['--color-bg'] = resolvedTheme === 'dark' ? '#000000' : '#ffffff';
  }

  // Institution-type theme vars
  const themeVars = getInstitutionThemeVars(branding.schoolTheme);
  Object.assign(vars, themeVars);

  return vars;
}

/** Get institution-specific design tokens */
function getInstitutionThemeVars(type: InstitutionType): Record<string, string> {
  switch (type) {
    case 'school':
      return SCHOOL_THEME_VARS;
    case 'college':
    case 'university':
      return COLLEGE_THEME_VARS;
    default:
      return SCHOOL_THEME_VARS;
  }
}

/** Adjust hex color brightness by percentage */
function adjustColorBrightness(hex: string, percent: number): string {
  const cleanHex = hex.replace('#', '');
  const r = Math.min(255, Math.max(0, parseInt(cleanHex.substring(0, 2), 16) + Math.round(2.55 * percent)));
  const g = Math.min(255, Math.max(0, parseInt(cleanHex.substring(2, 4), 16) + Math.round(2.55 * percent)));
  const b = Math.min(255, Math.max(0, parseInt(cleanHex.substring(4, 6), 16) + Math.round(2.55 * percent)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/** Resolve theme mode to actual light/dark based on OS preference */
function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }
  return mode;
}

interface ThemeProviderProps {
  readonly children: React.ReactNode;
}

/**
 * ThemeProvider applies CSS custom properties to document root,
 * handles dark/light/system mode, high-contrast, and RTL layout.
 * Prevents FOUC by reading from localStorage synchronously.
 */
export function ThemeProvider({ children }: ThemeProviderProps): React.JSX.Element {
  // Restore persisted preferences synchronously to prevent FOUC
  const storedMode = (() => {
    try {
      return (localStorage.getItem(STORAGE_KEY_THEME) as ThemeMode) ?? 'system';
    } catch {
      return 'system' as ThemeMode;
    }
  })();

  const storedHighContrast = (() => {
    try {
      return localStorage.getItem(STORAGE_KEY_HIGH_CONTRAST) === 'true';
    } catch {
      return false;
    }
  })();

  const storedDirection = (() => {
    try {
      return (localStorage.getItem(STORAGE_KEY_DIRECTION) as TextDirection) ?? 'ltr';
    } catch {
      return 'ltr' as TextDirection;
    }
  })();

  const [highContrast, setHighContrast] = useState(storedHighContrast);
  const [direction, setDirectionState] = useState<TextDirection>(storedDirection);

  const themeMode = useAppStore((s) => s.ui.theme);
  const setThemeModeStore = useAppStore((s) => s.setTheme);
  const tenantBranding = useAppStore((s) => s.tenant.current?.branding);
  const tenantLocale = useAppStore((s) => s.tenant.current?.locale);

  // Use stored mode on first render, then sync with store
  useEffect(() => {
    if (storedMode !== themeMode) {
      setThemeModeStore(storedMode);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const resolvedTheme = resolveTheme(themeMode);
  const branding = tenantBranding ?? DEFAULT_BRANDING;

  // Listen for OS color scheme changes when in system mode
  useEffect(() => {
    if (themeMode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (): void => {
      // Force re-render by updating CSS vars
      applyCssVariables(branding, resolveTheme('system'), highContrast);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [themeMode, branding, highContrast]);

  // Apply CSS variables to document root
  useEffect(() => {
    applyCssVariables(branding, resolvedTheme, highContrast);
  }, [branding, resolvedTheme, highContrast]);

  // Apply direction from tenant locale
  useEffect(() => {
    if (tenantLocale?.direction && tenantLocale.direction !== direction) {
      setDirectionState(tenantLocale.direction);
    }
  }, [tenantLocale, direction]);

  // Apply document-level attributes
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('dir', direction);
    root.classList.toggle('dark', resolvedTheme === 'dark');
    root.classList.toggle('high-contrast', highContrast);
    root.classList.toggle('rtl', direction === 'rtl');
  }, [resolvedTheme, highContrast, direction]);

  const setThemeMode = useCallback(
    (mode: ThemeMode): void => {
      setThemeModeStore(mode);
      try {
        localStorage.setItem(STORAGE_KEY_THEME, mode);
      } catch {
        // Storage unavailable
      }
    },
    [setThemeModeStore],
  );

  const toggleHighContrast = useCallback((): void => {
    setHighContrast((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_HIGH_CONTRAST, String(next));
      } catch {
        // Storage unavailable
      }
      return next;
    });
  }, []);

  const setDirection = useCallback((dir: TextDirection): void => {
    setDirectionState(dir);
    try {
      localStorage.setItem(STORAGE_KEY_DIRECTION, dir);
    } catch {
      // Storage unavailable
    }
  }, []);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme: resolvedTheme,
      themeMode,
      highContrast,
      direction,
      setThemeMode,
      toggleHighContrast,
      setDirection,
    }),
    [resolvedTheme, themeMode, highContrast, direction, setThemeMode, toggleHighContrast, setDirection],
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

/** Apply CSS custom properties directly to document.documentElement */
function applyCssVariables(
  branding: TenantBranding,
  resolvedTheme: 'light' | 'dark',
  highContrast: boolean,
): void {
  const vars = generateCssVariables(branding, resolvedTheme, highContrast);
  const root = document.documentElement;

  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
}

/**
 * Hook to access theme context.
 * Must be used within a ThemeProvider.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { ThemeContext };
export type { ThemeContextValue };
