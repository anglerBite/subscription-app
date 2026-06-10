import React, { createContext, useContext, type PropsWithChildren } from "react";
import {
  DarkTheme,
  DefaultTheme,
  type Theme as NavigationTheme,
} from "@react-navigation/native";

import type {
  ExchangeRateLoadSource,
  ExchangeRates,
} from "../services/exchangeRateService";
import type {
  CurrencyCode,
  LanguageCode,
  ThemeSetting,
} from "../types/settings";

export type ColorMode = ThemeSetting;

export type AppTheme = {
  mode: ColorMode;
  background: string;
  surface: string;
  card: string;
  bottomNav: string;
  bottomNavInner: string;
  inputBackground: string;
  accent: string;
  accentSoft: string;
  text: string;
  subtext: string;
  border: string;
  success: string;
  warning: string;
  destructive: string;
  destructiveSoft: string;
  iconBubble: string;
  activeBubble: string;
  onAccent: string;
};

export const themes: Record<ColorMode, AppTheme> = {
  dark: {
    mode: "dark",
    background: "#111827",
    surface: "#0f172a",
    card: "#1e293b",
    bottomNav: "#020617",
    bottomNavInner: "#081121",
    inputBackground: "#1e293b",
    accent: "#38bdf8",
    accentSoft: "rgba(56, 189, 248, 0.14)",
    text: "#f9fafb",
    subtext: "#94a3b8",
    border: "#334155",
    success: "#22c55e",
    warning: "#f59e0b",
    destructive: "#f87171",
    destructiveSoft: "rgba(248, 113, 113, 0.14)",
    iconBubble: "#132033",
    activeBubble: "rgba(2, 6, 23, 0.18)",
    onAccent: "#082f49",
  },
  light: {
    mode: "light",
    background: "#f8fafc",
    surface: "#ffffff",
    card: "#ffffff",
    bottomNav: "#ffffff",
    bottomNavInner: "#ffffff",
    inputBackground: "#f1f5f9",
    accent: "#0284c7",
    accentSoft: "rgba(2, 132, 199, 0.14)",
    text: "#0f172a",
    subtext: "#475569",
    border: "#e2e8f0",
    success: "#16a34a",
    warning: "#d97706",
    destructive: "#ef4444",
    destructiveSoft: "rgba(239, 68, 68, 0.12)",
    iconBubble: "#e8eef5",
    activeBubble: "rgba(2, 132, 199, 0.12)",
    onAccent: "#f8fafc",
  },
};

type ThemeContextValue = {
  colorMode: ColorMode;
  currency: CurrencyCode;
  exchangeRateSource: ExchangeRateLoadSource;
  exchangeRates: ExchangeRates;
  formatAmountFromJPY: (amountJPY: number, currency?: CurrencyCode) => string;
  isDarkMode: boolean;
  language: LanguageCode;
  notificationEmail: string;
  notificationEnabled: boolean;
  setCurrencyPreference: (currency: CurrencyCode) => Promise<void>;
  setLanguagePreference: (language: LanguageCode) => Promise<void>;
  setNotificationEmailPreference: (email: string) => Promise<boolean>;
  setNotificationEnabledPreference: (enabled: boolean) => Promise<boolean>;
  setThemePreference: (theme: ThemeSetting) => Promise<void>;
  theme: AppTheme;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({
  children,
  value,
}: PropsWithChildren<{ value: ThemeContextValue }>) {
  return React.createElement(ThemeContext.Provider, { value }, children);
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used within AppThemeProvider.");
  }

  return context;
}

export function getNavigationTheme(theme: AppTheme): NavigationTheme {
  const baseTheme = theme.mode === "dark" ? DarkTheme : DefaultTheme;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: theme.background,
      // Keep navigator surfaces aligned with the screen background to avoid
      // white flashes during native stack transitions.
      card: theme.background,
      primary: theme.accent,
      text: theme.text,
      border: theme.border,
      notification: theme.accent,
    },
  };
}
