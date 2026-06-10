import React, { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type GestureResponderEvent,
} from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import type { AppTheme } from "../theme/theme";
import { useAppTheme } from "../theme/theme";
import type { LanguageCode } from "../types/settings";
import {
  formatDateForDisplay,
  formatDateForStorage,
  parseStoredDate,
} from "../utils/dateUtils";
import { appCopy } from "../utils/localization";

type DatePickerFieldProps = {
  disabled?: boolean;
  label: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder: string;
  value: string;
};

const localeMap: Record<LanguageCode, string> = {
  en: "en-US",
  ja: "ja-JP",
  ko: "ko-KR",
  zh: "zh-CN",
};

export function DatePickerField({
  disabled = false,
  label,
  onChange,
  onClear,
  placeholder,
  value,
}: DatePickerFieldProps) {
  const { language, theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const copy = appCopy[language];
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [draftDate, setDraftDate] = useState<Date>(
    parseStoredDate(value) ?? new Date(),
  );

  const displayValue = value
    ? formatDateForDisplay(value, language)
    : placeholder;

  const openPicker = () => {
    if (disabled) {
      return;
    }

    setDraftDate(parseStoredDate(value) ?? new Date());
    setIsPickerVisible(true);
  };

  const closePicker = () => {
    setIsPickerVisible(false);
  };

  const applyDate = (nextDate: Date) => {
    onChange(formatDateForStorage(nextDate));
  };

  const handleAndroidChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setIsPickerVisible(false);

    if (event.type !== "set" || !selectedDate) {
      return;
    }

    applyDate(selectedDate);
  };

  const handleIosChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (!selectedDate) {
      return;
    }

    setDraftDate(selectedDate);
  };

  const handleClear = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onClear?.();
  };

  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        activeOpacity={0.9}
        disabled={disabled}
        onPress={openPicker}
        style={[styles.trigger, disabled && styles.triggerDisabled]}
      >
        <Text
          style={[
            styles.triggerText,
            !value && styles.placeholderText,
          ]}
        >
          {displayValue}
        </Text>
        <View style={styles.triggerActions}>
          {value && onClear ? (
            <TouchableOpacity
              accessibilityLabel={copy.common.clear}
              activeOpacity={0.88}
              disabled={disabled}
              onPress={handleClear}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>×</Text>
            </TouchableOpacity>
          ) : null}
          <Text style={styles.chevron}>▾</Text>
        </View>
      </TouchableOpacity>

      {Platform.OS === "android" && isPickerVisible ? (
        <DateTimePicker
          display="calendar"
          mode="date"
          onChange={handleAndroidChange}
          value={draftDate}
        />
      ) : null}

      {Platform.OS === "ios" ? (
        <Modal
          animationType="fade"
          onRequestClose={closePicker}
          statusBarTranslucent
          transparent
          visible={isPickerVisible}
        >
          <View style={styles.overlay}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={closePicker}
              style={styles.backdrop}
            />
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{label}</Text>
              </View>
              <DateTimePicker
                display="inline"
                locale={localeMap[language]}
                mode="date"
                onChange={handleIosChange}
                themeVariant={theme.mode}
                value={draftDate}
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={closePicker}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>
                    {copy.common.cancel}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => {
                    applyDate(draftDate);
                    closePicker();
                  }}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>{copy.common.ok}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    fieldBlock: {
      gap: 10,
    },
    fieldLabel: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "700",
    },
    trigger: {
      minHeight: 54,
      backgroundColor: theme.inputBackground,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 16,
      paddingVertical: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    triggerDisabled: {
      opacity: 0.6,
    },
    triggerText: {
      color: theme.text,
      fontSize: 15,
      flex: 1,
      fontWeight: "600",
    },
    placeholderText: {
      color: theme.subtext,
      fontWeight: "500",
    },
    chevron: {
      color: theme.subtext,
      fontSize: 16,
      fontWeight: "800",
    },
    triggerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    clearButton: {
      width: 22,
      height: 22,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.accentSoft,
    },
    clearButtonText: {
      color: theme.accent,
      fontSize: 14,
      fontWeight: "800",
      lineHeight: 14,
    },
    overlay: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(2, 6, 23, 0.52)",
    },
    modalCard: {
      backgroundColor: theme.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 14,
      gap: 12,
    },
    modalHeader: {
      gap: 4,
    },
    modalTitle: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "800",
      textAlign: "center",
    },
    buttonRow: {
      flexDirection: "row",
      gap: 12,
      justifyContent: "flex-end",
    },
    secondaryButton: {
      flex: 1,
      minHeight: 48,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.inputBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryButtonText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "700",
    },
    primaryButton: {
      flex: 1,
      minHeight: 48,
      borderRadius: 16,
      backgroundColor: theme.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButtonText: {
      color: theme.onAccent,
      fontSize: 14,
      fontWeight: "800",
    },
  });
