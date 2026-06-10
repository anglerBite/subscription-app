export type ThemeSetting = "dark" | "light";

export type CurrencyCode = "CNY" | "JPY" | "KRW" | "USD";

export type LanguageCode = "zh" | "en" | "ja" | "ko";

export type Language = LanguageCode;

export type AppSettings = {
  theme: ThemeSetting;
  currency: CurrencyCode;
  language: LanguageCode;
  notificationEmail: string;
  notificationEnabled: boolean;
};

export type SettingKey = keyof AppSettings;

export const defaultSettings: AppSettings = {
  theme: "dark",
  currency: "JPY",
  language: "ja",
  notificationEmail: "",
  notificationEnabled: false,
};
