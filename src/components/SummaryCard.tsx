import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { AppTheme } from "../theme/theme";
import { useAppTheme } from "../theme/theme";

type SummaryCardProps = {
  label: string;
  value: string;
  helperText: string;
};

export function SummaryCard({
  label,
  value,
  helperText,
}: SummaryCardProps) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.helperText}>{helperText}</Text>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 24,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 10,
    },
    label: {
      color: theme.subtext,
      fontSize: 13,
      fontWeight: "600",
      letterSpacing: 0.4,
    },
    value: {
      color: theme.text,
      fontSize: 28,
      fontWeight: "800",
    },
    helperText: {
      color: theme.accent,
      fontSize: 13,
      fontWeight: "600",
    },
  });
