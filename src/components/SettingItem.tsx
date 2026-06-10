import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { AppTheme } from "../theme/theme";
import { useAppTheme } from "../theme/theme";

type SettingItemProps = {
  label: string;
  description: string;
  value?: string;
  isEnabled?: boolean;
  onPress?: () => void | Promise<void>;
  onToggle?: () => void | Promise<void>;
};

export function SettingItem({
  label,
  description,
  value,
  isEnabled,
  onPress,
  onToggle,
}: SettingItemProps) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const isToggle = typeof isEnabled === "boolean" && typeof onToggle === "function";

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={isToggle ? onToggle : onPress}
      style={styles.card}
    >
      <View style={styles.textBlock}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      {isToggle ? (
        <View style={styles.toggleGroup}>
          {value ? (
            <Text
              style={[
                styles.toggleValue,
                isEnabled ? styles.toggleValueEnabled : styles.toggleValueDisabled,
              ]}
            >
              {value}
            </Text>
          ) : null}
          <View
            style={[
              styles.toggleTrack,
              isEnabled ? styles.toggleTrackEnabled : styles.toggleTrackDisabled,
            ]}
          >
            <View
              style={[
                styles.toggleThumb,
                isEnabled ? styles.toggleThumbEnabled : styles.toggleThumbDisabled,
              ]}
            />
          </View>
        </View>
      ) : (
        <View style={styles.valuePill}>
          <Text style={styles.valueText}>{value}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.card,
      borderRadius: 22,
      paddingHorizontal: 18,
      paddingVertical: 18,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
    },
    textBlock: {
      flex: 1,
      gap: 6,
    },
    label: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "700",
    },
    description: {
      color: theme.subtext,
      fontSize: 13,
      lineHeight: 20,
    },
    toggleTrack: {
      width: 58,
      height: 32,
      borderRadius: 999,
      justifyContent: "center",
      paddingHorizontal: 4,
    },
    toggleGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    toggleValue: {
      fontSize: 13,
      fontWeight: "800",
    },
    toggleValueEnabled: {
      color: theme.accent,
    },
    toggleValueDisabled: {
      color: theme.subtext,
    },
    toggleTrackEnabled: {
      backgroundColor: theme.accent,
    },
    toggleTrackDisabled: {
      backgroundColor: theme.border,
    },
    toggleThumb: {
      width: 24,
      height: 24,
      borderRadius: 999,
      backgroundColor: "#ffffff",
    },
    toggleThumbEnabled: {
      alignSelf: "flex-end",
    },
    toggleThumbDisabled: {
      alignSelf: "flex-start",
    },
    valuePill: {
      backgroundColor: theme.inputBackground,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 9,
    },
    valueText: {
      color: theme.accent,
      fontSize: 13,
      fontWeight: "700",
    },
  });
