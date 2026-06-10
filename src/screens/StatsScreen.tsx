import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SummaryCard } from "../components/SummaryCard";
import type { AppTheme } from "../theme/theme";
import { useAppTheme } from "../theme/theme";
import type { Subscription } from "../types/subscription";
import {
  calculateAnnualTotal,
  calculateCategoryTotals,
  calculateMonthlyTotal,
} from "../utils/calculateSubscriptions";
import { appCopy, getCategoryLabel } from "../utils/localization";

type StatsScreenProps = {
  subscriptions: Subscription[];
};

export function StatsScreen({ subscriptions }: StatsScreenProps) {
  const {
    exchangeRateSource,
    formatAmountFromJPY,
    language,
    theme,
  } = useAppTheme();
  const styles = createStyles(theme);
  const copy = appCopy[language];
  const monthlyTotal = calculateMonthlyTotal(subscriptions);
  const annualTotal = calculateAnnualTotal(subscriptions);
  const categoryTotals = calculateCategoryTotals(subscriptions);
  const maxCategoryAmount = categoryTotals[0]?.total ?? 1;

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>{copy.stats.eyebrow}</Text>
          <Text style={styles.title}>{copy.stats.title}</Text>
          <Text style={styles.description}>{copy.stats.description}</Text>
        </View>

        <View style={styles.summaryRow}>
          <SummaryCard
            helperText={copy.stats.monthlyHelper}
            label={copy.stats.monthlyLabel}
            value={formatAmountFromJPY(monthlyTotal)}
          />
          <SummaryCard
            helperText={copy.stats.annualHelper}
            label={copy.stats.annualLabel}
            value={formatAmountFromJPY(annualTotal)}
          />
        </View>

        {exchangeRateSource === "fallback" ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeText}>
              {copy.common.exchangeRateApproximate}
            </Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{copy.stats.sectionTitle}</Text>
          <View style={styles.chartCard}>
            {categoryTotals.map(({ category, total }) => (
                <View key={category} style={styles.chartRow}>
                  <View style={styles.chartHeader}>
                  <Text style={styles.chartLabel}>
                    {getCategoryLabel(category, language)}
                  </Text>
                  <Text style={styles.chartAmount}>
                    {formatAmountFromJPY(total)}
                  </Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${(total / maxCategoryAmount) * 100}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 140,
      gap: 22,
    },
    scrollView: {
      backgroundColor: theme.background,
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
    summaryRow: {
      flexDirection: "row",
      gap: 14,
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
    section: {
      gap: 14,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 20,
      fontWeight: "800",
    },
    chartCard: {
      backgroundColor: theme.surface,
      borderRadius: 28,
      padding: 20,
      gap: 18,
      borderWidth: 1,
      borderColor: theme.border,
    },
    chartRow: {
      gap: 10,
    },
    chartHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    chartLabel: {
      color: theme.text,
      fontSize: 15,
      fontWeight: "700",
    },
    chartAmount: {
      color: theme.subtext,
      fontSize: 14,
      fontWeight: "600",
    },
    barTrack: {
      height: 12,
      backgroundColor: theme.inputBackground,
      borderRadius: 999,
      overflow: "hidden",
    },
    barFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: theme.accent,
    },
  });
