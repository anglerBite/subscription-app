import React, { memo, useMemo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import type { AppTheme } from "../theme/theme";
import { useAppTheme } from "../theme/theme";
import { appCopy } from "../utils/localization";

type DisplayModeToggleProps = {
  onSelectMode: (mode: DisplayMode) => void;
  selectedMode: DisplayMode;
};

export type DisplayMode =
  | "compactList"
  | "normalList"
  | "compactGrid"
  | "normalGrid";

const displayModes: DisplayMode[] = [
  "compactList",
  "normalList",
  "compactGrid",
  "normalGrid",
];

function DisplayModeToggleInner({
  onSelectMode,
  selectedMode,
}: DisplayModeToggleProps) {
  const { language, theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const copy = appCopy[language];

  return (
    <View style={styles.container}>
      {displayModes.map((mode) => {
        const isSelected = selectedMode === mode;

        return (
          <TouchableOpacity
            accessibilityLabel={copy.home.displayModes[mode]}
            accessibilityRole="button"
            accessibilityState={isSelected ? { selected: true } : {}}
            activeOpacity={0.88}
            key={mode}
            onPress={() => onSelectMode(mode)}
            style={[
              styles.button,
              isSelected && styles.buttonSelected,
            ]}
          >
            {renderModeIcon(mode, styles, isSelected)}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export const DisplayModeToggle = memo(DisplayModeToggleInner);

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      gap: 8,
    },
    button: {
      width: 48,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.inputBackground,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 8,
      paddingVertical: 8,
    },
    buttonSelected: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    iconRow: {
      flexDirection: "row",
      gap: 4,
    },
    iconBox: {
      width: 8,
      height: 14,
      borderRadius: 3,
      backgroundColor: theme.subtext,
      opacity: 0.75,
    },
    iconBoxSelected: {
      backgroundColor: theme.onAccent,
      opacity: 1,
    },
    compactIcon: {
      width: 16,
      height: 8,
      borderRadius: 3,
      backgroundColor: theme.subtext,
      opacity: 0.75,
    },
    compactIconSelected: {
      backgroundColor: theme.onAccent,
      opacity: 1,
    },
    compactGridIcon: {
      width: 10,
      height: 8,
      borderRadius: 3,
      backgroundColor: theme.subtext,
      opacity: 0.75,
    },
    compactGridIconSelected: {
      backgroundColor: theme.onAccent,
      opacity: 1,
    },
    normalListIcon: {
      width: 12,
      height: 14,
      borderRadius: 3,
      backgroundColor: theme.subtext,
      opacity: 0.75,
    },
    normalListIconSelected: {
      backgroundColor: theme.onAccent,
      opacity: 1,
    },
  });

function renderModeIcon(
  mode: DisplayMode,
  styles: ReturnType<typeof createStyles>,
  isSelected: boolean,
) {
  switch (mode) {
    case "compactList":
      return (
        <View
          style={[
            styles.compactIcon,
            isSelected && styles.compactIconSelected,
          ]}
        />
      );
    case "normalList":
      return (
        <View
          style={[
            styles.normalListIcon,
            isSelected && styles.normalListIconSelected,
          ]}
        />
      );
    case "compactGrid":
      return (
        <View style={styles.iconRow}>
          {Array.from({ length: 2 }).map((_, index) => (
            <View
              key={`compact-grid-${index}`}
              style={[
                styles.compactGridIcon,
                isSelected && styles.compactGridIconSelected,
              ]}
            />
          ))}
        </View>
      );
    case "normalGrid":
    default:
      return (
        <View style={styles.iconRow}>
          {Array.from({ length: 2 }).map((_, index) => (
            <View
              key={`normal-grid-${index}`}
              style={[
                styles.iconBox,
                isSelected && styles.iconBoxSelected,
              ]}
            />
          ))}
        </View>
      );
  }
}
