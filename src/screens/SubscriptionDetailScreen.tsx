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

type SubscriptionDetailScreenProps = {
  onBackToHome: () => void;
  onDeleteSubscription: (subscriptionId: string) => Promise<boolean>;
  onEditSubscription: (subscriptionId: string) => void;
  onGoBack: () => void;
  subscription?: Subscription;
};

function formatDate(dateString: string) {
  if (!dateString.trim()) {
    return "";
  }

  return dateString.replace(/-/g, "/");
}

function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}/${month}/${day} ${hours}:${minutes}`;
}

export function SubscriptionDetailScreen({
  onBackToHome,
  onDeleteSubscription,
  onEditSubscription,
  onGoBack,
  subscription,
}: SubscriptionDetailScreenProps) {
  const { formatAmountFromJPY, language, theme } = useAppTheme();
  const styles = createStyles(theme);
  const copy = appCopy[language];
  const priceText =
    subscription?.price && subscription.price > 0
      ? formatAmountFromJPY(subscription.price)
      : copy.common.unsetPrice;
  const paymentDateText = subscription?.nextPaymentDate
    ? formatDate(subscription.nextPaymentDate)
    : copy.common.unsetPaymentDate;
  const categoryText = subscription?.category
    ? getCategoryLabel(subscription.category, language)
    : copy.common.unsetCategory;
  const billingCycleText = subscription
    ? getBillingCycleLabel(subscription.billingCycle, language)
    : copy.common.unsetBillingCycle;

  if (!subscription) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.missingContainer}>
          <Text style={styles.missingTitle}>{copy.detail.missingTitle}</Text>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onBackToHome}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>
              {copy.edit.toHome}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const confirmDelete = () => {
    showCustomAlert({
      cancelText: copy.common.cancel,
      confirmText: copy.common.delete,
      confirmType: "danger",
      message: copy.detail.deleteConfirmMessage,
      onConfirm: () => {
        void (async () => {
          const didDelete = await onDeleteSubscription(subscription.id);

          if (didDelete) {
            onBackToHome();
          }
        })();
      },
      title: copy.detail.deleteConfirmTitle,
    });
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>{copy.detail.eyebrow}</Text>
          <Text style={styles.title}>{subscription.name || copy.detail.titleFallback}</Text>
          <Text style={styles.description}>{copy.detail.description}</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{copy.detail.priceLabel}</Text>
            <Text style={styles.summaryValue}>{priceText}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{copy.detail.statusLabel}</Text>
            <Text
              style={[
                styles.statusText,
                subscription.isActive
                  ? styles.statusTextActive
                  : styles.statusTextInactive,
              ]}
            >
              {subscription.isActive ? copy.common.active : copy.common.inactive}
            </Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <DetailItem label={copy.detail.nameLabel} value={subscription.name} />
          <DetailItem
            label={copy.detail.cycleLabel}
            value={billingCycleText}
          />
          <DetailItem
            label={copy.detail.nextPaymentDateLabel}
            value={paymentDateText}
          />
          <DetailItem
            label={copy.detail.categoryLabel}
            value={categoryText}
          />
          <DetailItem
            label={copy.detail.memoLabel}
            value={subscription.memo?.trim() ? subscription.memo : copy.common.notEntered}
          />
          <DetailItem
            label={copy.detail.createdAt}
            value={formatDateTime(subscription.createdAt)}
          />
          <DetailItem
            label={copy.detail.updatedAt}
            value={formatDateTime(subscription.updatedAt)}
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onEditSubscription(subscription.id)}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>{copy.detail.editButton}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={confirmDelete}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteButtonText}>{copy.detail.deleteButton}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onGoBack}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>{copy.common.back}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
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
      fontSize: 32,
      fontWeight: "800",
      lineHeight: 40,
    },
    description: {
      color: theme.subtext,
      fontSize: 15,
      lineHeight: 23,
    },
    summaryCard: {
      backgroundColor: theme.surface,
      borderRadius: 28,
      padding: 20,
      gap: 14,
      borderWidth: 1,
      borderColor: theme.border,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    summaryLabel: {
      color: theme.subtext,
      fontSize: 14,
      fontWeight: "700",
    },
    summaryValue: {
      color: theme.text,
      fontSize: 22,
      fontWeight: "800",
    },
    statusText: {
      fontSize: 15,
      fontWeight: "800",
    },
    statusTextActive: {
      color: theme.accent,
    },
    statusTextInactive: {
      color: theme.subtext,
    },
    detailCard: {
      backgroundColor: theme.card,
      borderRadius: 28,
      padding: 20,
      gap: 18,
      borderWidth: 1,
      borderColor: theme.border,
    },
    detailItem: {
      gap: 8,
    },
    detailLabel: {
      color: theme.subtext,
      fontSize: 13,
      fontWeight: "700",
    },
    detailValue: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "700",
      lineHeight: 24,
    },
    buttonRow: {
      flexDirection: "row",
      gap: 12,
    },
    backButton: {
      alignSelf: "center",
      marginTop: -2,
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 999,
      backgroundColor: theme.inputBackground,
      borderWidth: 1,
      borderColor: theme.border,
    },
    backButtonText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "700",
    },
    secondaryButton: {
      flex: 1,
      backgroundColor: theme.inputBackground,
      borderRadius: 22,
      paddingVertical: 18,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.border,
    },
    secondaryButtonText: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "800",
    },
    deleteButton: {
      flex: 1,
      backgroundColor: theme.destructiveSoft,
      borderRadius: 22,
      paddingVertical: 18,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.destructiveSoft,
    },
    deleteButtonText: {
      color: theme.destructive,
      fontSize: 16,
      fontWeight: "800",
    },
    missingContainer: {
      flex: 1,
      paddingHorizontal: 20,
      justifyContent: "center",
      gap: 20,
    },
    missingTitle: {
      color: theme.text,
      fontSize: 24,
      fontWeight: "800",
      textAlign: "center",
    },
  });
