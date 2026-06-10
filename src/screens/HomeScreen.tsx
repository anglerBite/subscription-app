import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CategoryFilter } from "../components/CategoryFilter";
import { showCustomAlert } from "../components/CustomAlert";
import {
  DisplayModeToggle,
  type DisplayMode,
} from "../components/DisplayModeToggle";
import { SubscriptionCard } from "../components/SubscriptionCard";
import { SummaryCard } from "../components/SummaryCard";
import {
  ALL_CATEGORY_KEY,
  HOME_CATEGORY_OPTIONS,
} from "../constants/subscriptionCategories";
import { env } from "../config/env";
import type { AppTheme } from "../theme/theme";
import { useAppTheme } from "../theme/theme";
import type { Subscription } from "../types/subscription";
import {
  calculateAnnualTotal,
  calculateMonthlyTotal,
} from "../utils/calculateSubscriptions";
import { appCopy } from "../utils/localization";

type HomeScreenProps = {
  onDeleteSubscription: (subscriptionId: string) => Promise<boolean>;
  onEditSubscription: (subscriptionId: string) => void;
  onOpenSubscriptionDetail: (subscriptionId: string) => void;
  onRefreshSubscriptions: () => Promise<void>;
  onToggleSubscriptionActive: (subscriptionId: string) => Promise<boolean>;
  subscriptions: Subscription[];
};

type SortMode = "newest" | "oldest" | "paymentDate";

const sortModes: SortMode[] = ["newest", "oldest", "paymentDate"];

export function HomeScreen({
  onDeleteSubscription,
  onEditSubscription,
  onOpenSubscriptionDetail,
  onRefreshSubscriptions,
  onToggleSubscriptionActive,
  subscriptions,
}: HomeScreenProps) {
  const { formatAmountFromJPY, language, theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const copy = appCopy[language];
  const { width: windowWidth } = useWindowDimensions();
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY_KEY);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("normalList");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const monthlyTotal = calculateMonthlyTotal(subscriptions);
  const annualTotal = calculateAnnualTotal(subscriptions);

  useEffect(() => {
    void onRefreshSubscriptions();
  }, [onRefreshSubscriptions]);

  useEffect(() => {
    if (!(HOME_CATEGORY_OPTIONS as readonly string[]).includes(selectedCategory)) {
      setSelectedCategory(ALL_CATEGORY_KEY);
    }
  }, [selectedCategory]);

  const filteredSubscriptions = useMemo(
    () =>
      selectedCategory === ALL_CATEGORY_KEY
        ? subscriptions
        : subscriptions.filter(
            (subscription) => subscription.category === selectedCategory,
          ),
    [selectedCategory, subscriptions],
  );

  const sortedSubscriptions = useMemo(() => {
    const compareByCreatedAt = (
      left: Subscription,
      right: Subscription,
      direction: "asc" | "desc",
    ) => {
      const leftTime = new Date(left.createdAt).getTime();
      const rightTime = new Date(right.createdAt).getTime();
      const diff =
        direction === "asc" ? leftTime - rightTime : rightTime - leftTime;

      if (diff !== 0) {
        return diff;
      }

      return direction === "asc"
        ? left.id.localeCompare(right.id)
        : right.id.localeCompare(left.id);
    };

    const compareByPaymentDate = (left: Subscription, right: Subscription) => {
      const leftTime = left.nextPaymentDate
        ? new Date(left.nextPaymentDate).getTime()
        : Number.POSITIVE_INFINITY;
      const rightTime = right.nextPaymentDate
        ? new Date(right.nextPaymentDate).getTime()
        : Number.POSITIVE_INFINITY;
      const diff = leftTime - rightTime;

      if (diff !== 0) {
        return diff;
      }

      return compareByCreatedAt(left, right, "desc");
    };

    return [...filteredSubscriptions].sort((left, right) => {
      switch (sortMode) {
        case "oldest":
          return compareByCreatedAt(left, right, "asc");
        case "paymentDate":
          return compareByPaymentDate(left, right);
        case "newest":
        default:
          return compareByCreatedAt(left, right, "desc");
      }
    });
  }, [filteredSubscriptions, sortMode]);

  const handleTogglePress = useCallback((subscription: Subscription) => {
    showCustomAlert({
      cancelText: copy.common.cancel,
      confirmText: copy.common.ok,
      confirmType: "default",
      message: subscription.isActive
        ? copy.home.toggleConfirmInactive
        : copy.home.toggleConfirmActive,
      onConfirm: () => {
        void onToggleSubscriptionActive(subscription.id);
      },
      title: copy.home.toggleConfirmTitle,
    });
  }, [copy.common.cancel, copy.common.ok, copy.home.toggleConfirmActive, copy.home.toggleConfirmInactive, copy.home.toggleConfirmTitle, onToggleSubscriptionActive]);

  const handleDeletePress = useCallback((subscription: Subscription) => {
    showCustomAlert({
      cancelText: copy.common.cancel,
      confirmText: copy.common.delete,
      confirmType: "danger",
      message: copy.home.deleteConfirmMessage,
      onConfirm: () => {
        void onDeleteSubscription(subscription.id);
      },
      title: copy.home.deleteConfirmTitle,
    });
  }, [copy.common.cancel, copy.common.delete, copy.home.deleteConfirmMessage, copy.home.deleteConfirmTitle, onDeleteSubscription]);

  const contentWidth = Math.max(windowWidth - 40, 0);
  const isGridMode =
    displayMode === "compactGrid" || displayMode === "normalGrid";
  const cardWidth = isGridMode ? (contentWidth - 12) / 2 : contentWidth;

  const renderItem = useCallback(
    ({ item }: { item: Subscription }) => (
      <View
        style={[styles.cardItem, isGridMode && { width: cardWidth }]}
      >
        <SubscriptionCard
          displayMode={displayMode}
          onDelete={() => handleDeletePress(item)}
          onEdit={() => onEditSubscription(item.id)}
          onPress={() => onOpenSubscriptionDetail(item.id)}
          onToggleActive={() => handleTogglePress(item)}
          subscription={item}
        />
      </View>
    ),
    [
      cardWidth,
      displayMode,
      handleDeletePress,
      handleTogglePress,
      isGridMode,
      onEditSubscription,
      onOpenSubscriptionDetail,
      styles.cardItem,
    ],
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <FlatList
        columnWrapperStyle={isGridMode ? styles.columnWrapper : undefined}
        contentContainerStyle={styles.content}
        data={sortedSubscriptions}
        key={`display-${displayMode}`}
        keyExtractor={(item) => item.id}
        numColumns={isGridMode ? 2 : 1}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>{copy.home.emptyTitle}</Text>
            <Text style={styles.emptyDescription}>{copy.home.emptyDescription}</Text>
          </View>
        }
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <View style={styles.brandRow}>
              <Image
                source={require("../../assets/images/subrin-logo.png")}
                style={styles.logo}
              />
              <Text style={styles.appName}>{env.appName}</Text>
            </View>

            <View style={styles.summaryRow}>
              <SummaryCard
                helperText={copy.home.monthlyHelper}
                label={copy.home.monthlyLabel}
                value={formatAmountFromJPY(monthlyTotal)}
              />
              <SummaryCard
                helperText={copy.home.annualHelper}
                label={copy.home.annualLabel}
                value={formatAmountFromJPY(annualTotal)}
              />
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>{copy.home.categoryTitle}</Text>
              <CategoryFilter
                categories={HOME_CATEGORY_OPTIONS}
                onSelectCategory={setSelectedCategory}
                selectedCategory={selectedCategory}
              />
            </View>

            <View style={styles.sortSection}>
              <Text style={styles.sortTitle}>{copy.home.sortTitle}</Text>
              <View style={styles.sortButtonRow}>
                {sortModes.map((mode) => {
                  const isSelected = sortMode === mode;

                  return (
                    <TouchableOpacity
                      activeOpacity={0.88}
                      key={mode}
                      onPress={() => setSortMode(mode)}
                      style={[
                        styles.sortButton,
                        isSelected && styles.sortButtonSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.sortButtonText,
                          isSelected && styles.sortButtonTextSelected,
                        ]}
                      >
                        {copy.home.sortOptions[mode]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleBlock}>
                <Text style={styles.sectionTitle}>{copy.home.sectionTitle}</Text>
                <Text style={styles.sectionMeta}>
                  {copy.home.itemCount(sortedSubscriptions.length)}
                </Text>
              </View>
              <DisplayModeToggle
                onSelectMode={setDisplayMode}
                selectedMode={displayMode}
              />
            </View>
          </View>
        }
        showsVerticalScrollIndicator={false}
        style={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    listContainer: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 140,
    },
    headerContent: {
      gap: 22,
      paddingBottom: 22,
    },
    brandRow: {
      paddingTop: 4,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    logo: {
      width: 34,
      height: 34,
      borderRadius: 12,
    },
    appName: {
      color: theme.text,
      fontSize: 30,
      fontWeight: "900",
      letterSpacing: 0.4,
    },
    summaryRow: {
      flexDirection: "row",
      gap: 14,
    },
    filterSection: {
      gap: 12,
    },
    filterTitle: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "800",
    },
    sortSection: {
      gap: 12,
    },
    sortTitle: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "800",
    },
    sortButtonRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    sortButton: {
      backgroundColor: theme.inputBackground,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 16,
      paddingVertical: 11,
    },
    sortButtonSelected: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    sortButtonText: {
      color: theme.subtext,
      fontSize: 13,
      fontWeight: "700",
    },
    sortButtonTextSelected: {
      color: theme.onAccent,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: 12,
    },
    sectionTitleBlock: {
      flex: 1,
      gap: 4,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 20,
      fontWeight: "800",
    },
    sectionMeta: {
      color: theme.subtext,
      fontSize: 13,
      fontWeight: "600",
    },
    columnWrapper: {
      justifyContent: "space-between",
    },
    cardItem: {
      marginBottom: 16,
      width: "100%",
    },
    emptyCard: {
      backgroundColor: theme.surface,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 10,
      padding: 22,
    },
    emptyTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: "800",
    },
    emptyDescription: {
      color: theme.subtext,
      fontSize: 14,
      lineHeight: 22,
    },
  });
