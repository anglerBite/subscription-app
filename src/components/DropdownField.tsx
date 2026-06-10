import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type GestureResponderEvent,
} from "react-native";

import type { AppTheme } from "../theme/theme";
import { useAppTheme } from "../theme/theme";
import { appCopy } from "../utils/localization";

type DropdownFieldProps<T extends string> = {
  disabled?: boolean;
  label: string;
  onClear?: () => void;
  onSelect: (value: T) => void;
  options: readonly T[];
  placeholder: string;
  value: T | "";
  getOptionLabel?: (value: T) => string;
};

export function DropdownField<T extends string>({
  disabled = false,
  label,
  onClear,
  onSelect,
  options,
  placeholder,
  value,
  getOptionLabel,
}: DropdownFieldProps<T>) {
  const { language, theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const copy = appCopy[language];
  const [isOpen, setIsOpen] = useState(false);

  const resolveOptionLabel = (option: T) =>
    getOptionLabel ? getOptionLabel(option) : option;

  const selectedLabel = value ? resolveOptionLabel(value) : placeholder;

  const handleClear = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onClear?.();
    setIsOpen(false);
  };

  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        activeOpacity={0.9}
        disabled={disabled}
        onPress={() => {
          setIsOpen((currentValue) => !currentValue);
        }}
        style={[
          styles.trigger,
          isOpen && styles.triggerOpen,
          disabled && styles.triggerDisabled,
        ]}
      >
        <Text
          style={[
            styles.triggerText,
            !value && styles.placeholderText,
          ]}
        >
          {selectedLabel}
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
          <Text style={styles.chevron}>{isOpen ? "▴" : "▾"}</Text>
        </View>
      </TouchableOpacity>

      {isOpen ? (
        <View style={styles.optionList}>
          {options.map((option) => {
            const isSelected = option === value;

            return (
              <TouchableOpacity
                activeOpacity={0.88}
                disabled={disabled}
                key={option}
                onPress={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
                style={[
                  styles.optionButton,
                  isSelected && styles.optionButtonSelected,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                >
                  {resolveOptionLabel(option)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
      paddingHorizontal: 18,
      paddingVertical: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    triggerOpen: {
      borderColor: theme.accent,
    },
    triggerDisabled: {
      opacity: 0.6,
    },
    triggerText: {
      color: theme.text,
      fontSize: 15,
      fontWeight: "600",
      flex: 1,
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
    optionList: {
      backgroundColor: theme.surface,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 8,
      gap: 6,
    },
    optionButton: {
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 13,
    },
    optionButtonSelected: {
      backgroundColor: theme.accentSoft,
    },
    optionText: {
      color: theme.text,
      fontSize: 15,
      fontWeight: "600",
    },
    optionTextSelected: {
      color: theme.accent,
      fontWeight: "800",
    },
  });
