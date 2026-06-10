import React, { memo, useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

import type { AppTheme } from "../theme/theme";
import { useAppTheme } from "../theme/theme";
import { getCategoryLabel } from "../utils/localization";

type CategoryFilterProps = {
  categories: readonly string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
};

function CategoryFilterInner({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  const { language, theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {categories.map((category) => {
        const isSelected = selectedCategory === category;

        return (
          <TouchableOpacity
            activeOpacity={0.88}
            key={category}
            onPress={() => onSelectCategory(category)}
            style={[
              styles.button,
              isSelected && styles.buttonSelected,
            ]}
          >
            <Text
              style={[
                styles.buttonText,
                isSelected && styles.buttonTextSelected,
              ]}
            >
              {getCategoryLabel(category, language)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export const CategoryFilter = memo(CategoryFilterInner);

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    content: {
      gap: 10,
      paddingRight: 20,
    },
    button: {
      backgroundColor: theme.inputBackground,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 16,
      paddingVertical: 11,
    },
    buttonSelected: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    buttonText: {
      color: theme.subtext,
      fontSize: 13,
      fontWeight: "700",
    },
    buttonTextSelected: {
      color: theme.onAccent,
    },
  });
