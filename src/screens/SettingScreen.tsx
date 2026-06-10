import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  CustomDropdown,
  type DropdownOption,
} from "../components/CustomDropdown";
import { showCustomAlert } from "../components/CustomAlert";
import { SettingItem } from "../components/SettingItem";
import type { AppTheme } from "../theme/theme";
import { useAppTheme } from "../theme/theme";
import { appCopy, settingsCopy } from "../utils/localization";
import type { CurrencyCode, LanguageCode } from "../types/settings";
import { isValidEmailAddress } from "../utils/emailValidation";

const languageOptions: DropdownOption<LanguageCode>[] = [
  { label: "Chinese", value: "zh" },
  { label: "English", value: "en" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
];

const currencyOptions: DropdownOption<CurrencyCode>[] = [
  { label: "CNY", value: "CNY" },
  { label: "JPY", value: "JPY" },
  { label: "KRW", value: "KRW" },
  { label: "USD", value: "USD" },
];

export function SettingScreen() {
  const {
    currency,
    exchangeRateSource,
    isDarkMode,
    language,
    notificationEmail,
    notificationEnabled,
    setCurrencyPreference,
    setLanguagePreference,
    setNotificationEmailPreference,
    setNotificationEnabledPreference,
    setThemePreference,
    theme,
  } = useAppTheme();
  const styles = createStyles(theme);
  const copy = settingsCopy[language];
  const commonCopy = appCopy[language].common;
  const [emailInput, setEmailInput] = useState(notificationEmail);
  const [isEditingEmail, setIsEditingEmail] = useState(
    notificationEmail.trim().length === 0,
  );
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const trimmedEmailInput = emailInput.trim();
  const hasSavedEmail = notificationEmail.trim().length > 0;

  useEffect(() => {
    setEmailInput(notificationEmail);
    setIsEditingEmail(notificationEmail.trim().length === 0);
  }, [notificationEmail]);

  const handleToggleTheme = () => {
    void setThemePreference(isDarkMode ? "light" : "dark");
  };

  const handleToggleNotification = () => {
    showCustomAlert({
      cancelText: commonCopy.cancel,
      confirmText: commonCopy.ok,
      confirmType: "default",
      message: notificationEnabled
        ? copy.notificationDisableConfirmMessage
        : copy.notificationEnableConfirmMessage,
      onConfirm: () => {
        void setNotificationEnabledPreference(!notificationEnabled);
      },
      title: copy.notificationLabel,
    });
  };

  const handleSaveNotificationEmail = async () => {
    const normalizedEmail = emailInput.trim();

    if (!isValidEmailAddress(normalizedEmail)) {
      showCustomAlert({
        confirmText: commonCopy.ok,
        title: commonCopy.validation.notificationEmailInvalid,
      });
      return;
    }

    setIsSavingEmail(true);

    try {
      const didSave = await setNotificationEmailPreference(normalizedEmail);

      if (!didSave) {
        return;
      }

      showCustomAlert({
        confirmText: commonCopy.ok,
        title: copy.notificationEmailSaved,
      });
      setIsEditingEmail(normalizedEmail.length === 0);
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleEnableEmailEditing = () => {
    showCustomAlert({
      cancelText: commonCopy.cancel,
      confirmText: commonCopy.ok,
      confirmType: "default",
      message: copy.notificationEmailChangeConfirmMessage,
      onConfirm: () => {
        setIsEditingEmail(true);
      },
      title: copy.notificationEmailLabel,
    });
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          <View style={styles.heroCard}>
            <Text style={styles.eyebrow}>{copy.heroEyebrow}</Text>
            <Text style={styles.title}>{copy.heroTitle}</Text>
            <Text style={styles.description}>{copy.heroDescription}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{copy.basicSection}</Text>
            <View style={styles.list}>
              <SettingItem
                description={copy.notificationDescription}
                isEnabled={notificationEnabled}
                label={copy.notificationLabel}
                onToggle={handleToggleNotification}
                value={notificationEnabled ? "ON" : "OFF"}
              />
              <View style={styles.emailCard}>
                <View style={styles.emailHeader}>
                  <Text style={styles.emailLabel}>{copy.notificationEmailLabel}</Text>
                  <Text style={styles.emailDescription}>
                    {copy.notificationEmailDescription}
                  </Text>
                </View>
                {!notificationEnabled ? (
                  <Text style={styles.infoText}>{copy.notificationOffHint}</Text>
                ) : null}
                {notificationEnabled && !trimmedEmailInput ? (
                  <Text style={styles.warningText}>
                    {copy.notificationEmailMissingWarning}
                  </Text>
                ) : null}
                {hasSavedEmail && !isEditingEmail ? (
                  <View style={styles.savedEmailSection}>
                    <Text style={styles.savedEmailText}>{notificationEmail}</Text>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={handleEnableEmailEditing}
                      style={styles.changeAddressButton}
                    >
                      <Text style={styles.changeAddressButtonText}>
                        {copy.notificationEmailChangeButton}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.emailEditorSection}>
                    {!hasSavedEmail ? (
                      <Text style={styles.emptyPromptText}>
                        {copy.notificationEmailEmptyState}
                      </Text>
                    ) : null}
                    <TextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isSavingEmail}
                      keyboardAppearance={theme.mode === "dark" ? "dark" : "light"}
                      keyboardType="email-address"
                      onChangeText={setEmailInput}
                      placeholder={
                        hasSavedEmail
                          ? copy.notificationEmailPlaceholder
                          : copy.notificationEmailEmptyState
                      }
                      placeholderTextColor={theme.subtext}
                      style={styles.emailInput}
                      value={emailInput}
                    />
                    <TouchableOpacity
                      activeOpacity={0.9}
                      disabled={isSavingEmail}
                      onPress={() => {
                        void handleSaveNotificationEmail();
                      }}
                      style={[
                        styles.saveEmailButton,
                        isSavingEmail && styles.saveEmailButtonDisabled,
                      ]}
                    >
                      <Text style={styles.saveEmailButtonText}>
                        {copy.notificationEmailSave}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <SettingItem
                description={copy.darkModeDescription}
                isEnabled={isDarkMode}
                label={copy.darkModeLabel}
                onToggle={handleToggleTheme}
              />
              <View style={styles.selectionCard}>
                <View style={styles.selectionHeader}>
                  <Text style={styles.selectionLabel}>{copy.languageLabel}</Text>
                  <Text style={styles.selectionDescription}>
                    {copy.languageDescription}
                  </Text>
                </View>
                <CustomDropdown
                  onSelect={(nextLanguage) => {
                    void setLanguagePreference(nextLanguage);
                  }}
                  options={languageOptions}
                  placeholder={copy.languageLabel}
                  selectedValue={language}
                />
              </View>
              <View style={styles.selectionCard}>
                <View style={styles.selectionHeader}>
                  <Text style={styles.selectionLabel}>{copy.currencyLabel}</Text>
                  <Text style={styles.selectionDescription}>
                    {copy.currencyDescription}
                  </Text>
                </View>
                <CustomDropdown
                  onSelect={(nextCurrency) => {
                    void setCurrencyPreference(nextCurrency);
                  }}
                  options={currencyOptions}
                  placeholder={copy.currencyLabel}
                  selectedValue={currency}
                />
              </View>
              {exchangeRateSource === "fallback" ? (
                <View style={styles.noticeCard}>
                  <Text style={styles.noticeText}>
                    {commonCopy.exchangeRateApproximate}
                  </Text>
                </View>
              ) : null}
              <SettingItem
                description={copy.appInfoDescription}
                label={copy.appInfoLabel}
                value={copy.appVersion}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    keyboardView: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollView: {
      backgroundColor: theme.background,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 140,
      gap: 22,
    },
    heroCard: {
      backgroundColor: theme.surface,
      borderRadius: 30,
      padding: 24,
      gap: 10,
      borderWidth: 1,
      borderColor: theme.border,
    },
    eyebrow: {
      color: theme.accent,
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    title: {
      color: theme.text,
      fontSize: 30,
      fontWeight: "800",
      lineHeight: 38,
    },
    description: {
      color: theme.subtext,
      fontSize: 15,
      lineHeight: 23,
    },
    section: {
      gap: 14,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 20,
      fontWeight: "800",
    },
    list: {
      gap: 14,
    },
    selectionCard: {
      backgroundColor: theme.card,
      borderRadius: 22,
      paddingHorizontal: 18,
      paddingVertical: 18,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 14,
    },
    selectionHeader: {
      gap: 6,
    },
    selectionLabel: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "700",
    },
    selectionDescription: {
      color: theme.subtext,
      fontSize: 13,
      lineHeight: 20,
    },
    emailCard: {
      backgroundColor: theme.card,
      borderRadius: 22,
      paddingHorizontal: 18,
      paddingVertical: 18,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 14,
    },
    emailHeader: {
      gap: 6,
    },
    emailLabel: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "700",
    },
    emailDescription: {
      color: theme.subtext,
      fontSize: 13,
      lineHeight: 20,
    },
    savedEmailSection: {
      gap: 12,
    },
    savedEmailText: {
      color: theme.text,
      fontSize: 15,
      fontWeight: "700",
      lineHeight: 22,
    },
    emailEditorSection: {
      gap: 12,
    },
    emptyPromptText: {
      color: theme.subtext,
      fontSize: 14,
      fontWeight: "600",
    },
    infoText: {
      color: theme.subtext,
      fontSize: 13,
      lineHeight: 20,
      fontWeight: "600",
    },
    warningText: {
      color: theme.warning,
      fontSize: 13,
      lineHeight: 20,
      fontWeight: "700",
    },
    noticeCard: {
      backgroundColor: theme.inputBackground,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    noticeText: {
      color: theme.warning,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "700",
    },
    emailInput: {
      minHeight: 52,
      backgroundColor: theme.inputBackground,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      color: theme.text,
      fontSize: 15,
      fontWeight: "600",
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    changeAddressButton: {
      alignSelf: "flex-start",
      backgroundColor: theme.inputBackground,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    changeAddressButtonText: {
      color: theme.text,
      fontSize: 13,
      fontWeight: "700",
    },
    saveEmailButton: {
      alignSelf: "flex-end",
      backgroundColor: theme.accent,
      borderRadius: 999,
      paddingHorizontal: 18,
      paddingVertical: 11,
    },
    saveEmailButtonDisabled: {
      opacity: 0.6,
    },
    saveEmailButtonText: {
      color: theme.onAccent,
      fontSize: 13,
      fontWeight: "800",
    },
  });
