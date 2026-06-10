import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  defaultSettings,
  type AppSettings,
  type SettingKey,
} from "../types/settings";

const SETTINGS_STORAGE_KEY = "app_settings";

function isTheme(value: unknown): value is AppSettings["theme"] {
  return value === "dark" || value === "light";
}

function isCurrency(value: unknown): value is AppSettings["currency"] {
  return (
    value === "JPY" ||
    value === "USD" ||
    value === "KRW" ||
    value === "CNY"
  );
}

function isLanguage(value: unknown): value is AppSettings["language"] {
  return (
    value === "ja" ||
    value === "en" ||
    value === "ko" ||
    value === "zh"
  );
}

function isNotificationEmail(value: unknown): value is string {
  return typeof value === "string";
}

function isNotificationEnabled(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function normalizeSettings(value: unknown): AppSettings {
  if (!value || typeof value !== "object") {
    return defaultSettings;
  }

  const candidate = value as Partial<Record<SettingKey, unknown>>;

  return {
    theme: isTheme(candidate.theme)
      ? candidate.theme
      : defaultSettings.theme,
    currency: isCurrency(candidate.currency)
      ? candidate.currency
      : defaultSettings.currency,
    language: isLanguage(candidate.language)
      ? candidate.language
      : defaultSettings.language,
    notificationEmail: isNotificationEmail(candidate.notificationEmail)
      ? candidate.notificationEmail.trim()
      : defaultSettings.notificationEmail,
    notificationEnabled: isNotificationEnabled(candidate.notificationEnabled)
      ? candidate.notificationEnabled
      : defaultSettings.notificationEnabled,
  };
}

export async function getSettings(): Promise<AppSettings> {
  const serializedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);

  if (!serializedSettings) {
    return defaultSettings;
  }

  try {
    const parsedSettings: unknown = JSON.parse(serializedSettings);
    return normalizeSettings(parsedSettings);
  } catch (error) {
    console.error("Failed to parse stored app settings.", error);
    return defaultSettings;
  }
}

export async function saveSettings(
  settings: AppSettings,
): Promise<AppSettings> {
  const normalizedSettings = normalizeSettings(settings);

  await AsyncStorage.setItem(
    SETTINGS_STORAGE_KEY,
    JSON.stringify(normalizedSettings),
  );

  return normalizedSettings;
}

export async function updateSetting<K extends SettingKey>(
  key: K,
  value: AppSettings[K],
): Promise<AppSettings> {
  const currentSettings = await getSettings();
  const nextSettings: AppSettings = {
    ...currentSettings,
    [key]: value,
  };

  return saveSettings(nextSettings);
}

export async function resetSettings(): Promise<AppSettings> {
  return saveSettings(defaultSettings);
}
