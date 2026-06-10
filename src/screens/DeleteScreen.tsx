import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { showCustomAlert } from "../components/CustomAlert";
import type { AppTheme } from "../theme/theme";
import { useAppTheme } from "../theme/theme";
import type { Subscription } from "../types/subscription";
import {
  appCopy,
  getBillingCycleLabel,
  getCategoryLabel,
} from "../utils/localization";

type DeleteScreenProps = {
  subscriptions: Subscription[];
  onDeleteSubscription: (subscriptionId: string) => Promise<boolean>;
};

export function DeleteScreen({
  subscriptions,
  onDeleteSubscription,
}: DeleteScreenProps) {
  const { formatAmountFromJPY, language, theme } = useAppTheme();
  const styles = createStyles(theme);
  const copy = appCopy[language];

  const confirmDelete = (subscription: Subscription) => {
    showCustomAlert({
      cancelText: copy.common.cancel,
      confirmText: copy.common.ok,
      confirmType: "danger",
      message: copy.detail.deleteConfirmMessage,
      onConfirm: () => {
        void onDeleteSubscription(subscription.id);
      },
      title: copy.home.deleteConfirmTitle,
    });
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Delete Subscription</Text>
          <Text style={styles.title}>不要な支払いを整理</Text>
          <Text style={styles.description}>
            一覧から対象を選んで、確認後に削除できます。
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>登録中のサブスク</Text>
          <Text style={styles.sectionMeta}>{subscriptions.length}件</Text>
        </View>

        {subscriptions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>削除できるサブスクはありません</Text>
            <Text style={styles.emptyDescription}>
              新しいサブスクは Add 画面から追加できます。
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {subscriptions.map((subscription) => (
              <View key={subscription.id} style={styles.subscriptionCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTextBlock}>
                    <Text style={styles.cardName}>{subscription.name}</Text>
                    <Text style={styles.cardMeta}>
                      {getCategoryLabel(subscription.category, language)} •{" "}
                      {getBillingCycleLabel(subscription.billingCycle, language)}
                    </Text>
                  </View>
                  <Text style={styles.cardPrice}>
                    {subscription.price > 0
                      ? formatAmountFromJPY(subscription.price)
                      : copy.common.unsetPrice}
                  </Text>
                </View>

                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.nextPaymentLabel}>次回支払日</Text>
                    <Text style={styles.nextPaymentDate}>
                      {subscription.nextPaymentDate || copy.common.unsetPaymentDate}
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={() => confirmDelete(subscription)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>削除</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
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
    heroCard: {
      backgroundColor: theme.surface,
      borderRadius: 30,
      padding: 24,
      gap: 10,
      borderWidth: 1,
      borderColor: theme.border,
    },
    eyebrow: {
      color: theme.destructive,
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
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
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
    list: {
      gap: 16,
    },
    emptyCard: {
      backgroundColor: theme.surface,
      borderRadius: 28,
      padding: 24,
      gap: 10,
      borderWidth: 1,
      borderColor: theme.border,
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
    subscriptionCard: {
      backgroundColor: theme.card,
      borderRadius: 24,
      padding: 18,
      gap: 18,
      borderWidth: 1,
      borderColor: theme.border,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12,
    },
    cardTextBlock: {
      flex: 1,
      gap: 8,
    },
    cardName: {
      color: theme.text,
      fontSize: 20,
      fontWeight: "800",
    },
    cardMeta: {
      color: theme.subtext,
      fontSize: 14,
      fontWeight: "600",
    },
    cardPrice: {
      color: theme.text,
      fontSize: 18,
      fontWeight: "800",
    },
    cardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    nextPaymentLabel: {
      color: theme.subtext,
      fontSize: 12,
      fontWeight: "600",
      marginBottom: 6,
    },
    nextPaymentDate: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "700",
    },
    deleteButton: {
      backgroundColor: theme.destructiveSoft,
      borderRadius: 999,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    deleteButtonText: {
      color: theme.destructive,
      fontSize: 13,
      fontWeight: "800",
    },
  });
