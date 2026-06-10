import { showCustomAlert } from "../components/CustomAlert";
import {
  getSettings,
  resetSettings,
  saveSettings,
  updateSetting,
} from "../repositories/settingsRepository";
import {
  defaultSettings,
  type AppSettings,
  type CurrencyCode,
  type LanguageCode,
  type ThemeSetting,
} from "../types/settings";
import { appCopy } from "../utils/localization";

async function getSettingsAlertCopy(): Promise<{
  confirmText: string;
  message: string;
}> {
  try {
    const settings = await getSettings();

    if (settings.language === "en") {
      return {
        confirmText: appCopy.en.common.ok,
        message: "Failed to save settings.",
      };
    }

    if (settings.language === "ko") {
      return {
        confirmText: appCopy.ko.common.ok,
        message: "설정 저장에 실패했습니다.",
      };
    }

    if (settings.language === "zh") {
      return {
        confirmText: appCopy.zh.common.ok,
        message: "保存设置失败。",
      };
    }

    return {
      confirmText: appCopy.ja.common.ok,
      message: "設定の保存に失敗しました。",
    };
  } catch {
    return {
      confirmText: appCopy.ja.common.ok,
      message: "設定の保存に失敗しました。",
    };
  }
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    return await getSettings();
  } catch (error) {
    console.error("Failed to load app settings.", error);
    const alertCopy = await getSettingsAlertCopy();
    showCustomAlert({
      confirmText: alertCopy.confirmText,
      title: alertCopy.message,
    });
    return defaultSettings;
  }
}

export async function persistSettings(
  settings: AppSettings,
): Promise<AppSettings | null> {
  try {
    return await saveSettings(settings);
  } catch (error) {
    console.error("Failed to save app settings.", error);
    const alertCopy = await getSettingsAlertCopy();
    showCustomAlert({
      confirmText: alertCopy.confirmText,
      title: alertCopy.message,
    });
    return null;
  }
}

export async function changeTheme(
  theme: ThemeSetting,
): Promise<AppSettings | null> {
  try {
    return await updateSetting("theme", theme);
  } catch (error) {
    console.error("Failed to update theme setting.", error);
    const alertCopy = await getSettingsAlertCopy();
    showCustomAlert({
      confirmText: alertCopy.confirmText,
      title: alertCopy.message,
    });
    return null;
  }
}

export async function changeCurrency(
  currency: CurrencyCode,
): Promise<AppSettings | null> {
  try {
    return await updateSetting("currency", currency);
  } catch (error) {
    console.error("Failed to update currency setting.", error);
    const alertCopy = await getSettingsAlertCopy();
    showCustomAlert({
      confirmText: alertCopy.confirmText,
      title: alertCopy.message,
    });
    return null;
  }
}

export async function changeLanguage(
  language: LanguageCode,
): Promise<AppSettings | null> {
  try {
    return await updateSetting("language", language);
  } catch (error) {
    console.error("Failed to update language setting.", error);
    const alertCopy = await getSettingsAlertCopy();
    showCustomAlert({
      confirmText: alertCopy.confirmText,
      title: alertCopy.message,
    });
    return null;
  }
}

export async function changeNotificationEmail(
  notificationEmail: string,
): Promise<AppSettings | null> {
  try {
    return await updateSetting("notificationEmail", notificationEmail.trim());
  } catch (error) {
    console.error("Failed to update notification email setting.", error);
    const alertCopy = await getSettingsAlertCopy();
    showCustomAlert({
      confirmText: alertCopy.confirmText,
      title: alertCopy.message,
    });
    return null;
  }
}

export async function changeNotificationEnabled(
  notificationEnabled: boolean,
): Promise<AppSettings | null> {
  try {
    return await updateSetting("notificationEnabled", notificationEnabled);
  } catch (error) {
    console.error("Failed to update notification enabled setting.", error);
    const alertCopy = await getSettingsAlertCopy();
    showCustomAlert({
      confirmText: alertCopy.confirmText,
      title: alertCopy.message,
    });
    return null;
  }
}

export async function resetAppSettings(): Promise<AppSettings | null> {
  try {
    return await resetSettings();
  } catch (error) {
    console.error("Failed to reset app settings.", error);
    const alertCopy = await getSettingsAlertCopy();
    showCustomAlert({
      confirmText: alertCopy.confirmText,
      title: alertCopy.message,
    });
    return null;
  }
}
