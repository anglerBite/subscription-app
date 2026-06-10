import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type GestureResponderEvent,
} from "react-native";

import type { DisplayMode } from "./DisplayModeToggle";
import type { AppTheme } from "../theme/theme";
import { useAppTheme } from "../theme/theme";
import type { Subscription } from "../types/subscription";
import {
  appCopy,
  getBillingCycleLabel,
  getCategoryLabel,
} from "../utils/localization";

type SubscriptionCardProps = {
  displayMode?: DisplayMode;
  onDelete?: () => void;
  onEdit?: () => void;
  onPress?: () => void;
  onToggleActive?: () => void;
  subscription: Subscription;
};

export function SubscriptionCard({
  displayMode = "normalList",
  onDelete,
  onEdit,
  onPress,
  onToggleActive,
  subscription,
}: SubscriptionCardProps) {
  const { formatAmountFromJPY, language, theme } = useAppTheme();
  const styles = createStyles(theme, displayMode);
  const copy = appCopy[language];
  const isCompactMode =
    displayMode === "compactList" || displayMode === "compactGrid";
  const isNormalMode =
    displayMode === "normalList" || displayMode === "normalGrid";
  const isCondensed =
    displayMode === "compactList" ||
    displayMode === "compactGrid" ||
    displayMode === "normalGrid";
  const displayDate = subscription.nextPaymentDate
    ? subscription.nextPaymentDate.replace(/-/g, "/")
    : "";
  const paymentLabel = displayDate
    ? subscription.isActive
      ? copy.subscriptionCard.nextPaymentLabel(displayDate)
      : copy.subscriptionCard.endingLabel(displayDate)
    : copy.common.unsetPaymentDate;
  const trimmedMemo = subscription.memo?.trim() ?? "";
  const memoText =
    trimmedMemo.length > 20 ? `${trimmedMemo.slice(0, 20)}...` : trimmedMemo;
  const categoryText = subscription.category
    ? getCategoryLabel(subscription.category, language)
    : copy.common.unsetCategory;
  const priceText =
    subscription.price > 0
      ? formatAmountFromJPY(subscription.price)
      : copy.common.unsetPrice;
  const cycleText = getBillingCycleLabel(subscription.billingCycle, language);

  const handleActionPress =
    (callback?: () => void) => (event: GestureResponderEvent) => {
      event.stopPropagation();
      callback?.();
    };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.9}
        disabled={!onPress}
        onPress={onPress}
        style={styles.detailTouchable}
      >
        <View style={styles.headerRow}>
          <View style={styles.titleBlock}>
            <Text
              ellipsizeMode="tail"
              numberOfLines={isCondensed ? 1 : 2}
              style={styles.name}
            >
              {subscription.name}
            </Text>
            {!isCompactMode ? (
              <Text style={styles.category}>{categoryText}</Text>
            ) : null}
          </View>
          <View style={styles.priceBlock}>
            <Text style={styles.price}>{priceText}</Text>
            {!isCompactMode ? (
              <Text style={styles.cycle}>{cycleText}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.paymentText}>{paymentLabel}</Text>
        </View>

        {displayMode === "normalList" && memoText ? (
          <Text style={styles.memoText}>
            {`${copy.subscriptionCard.memoPrefix}: ${memoText}`}
          </Text>
        ) : null}
      </TouchableOpacity>

      {isNormalMode ? (
        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.88}
            disabled={!onEdit}
            onPress={handleActionPress(onEdit)}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>
              {copy.subscriptionCard.editButton}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.88}
            disabled={!onDelete}
            onPress={handleActionPress(onDelete)}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteButtonText}>
              {copy.subscriptionCard.deleteButton}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.88}
            disabled={!onToggleActive}
            onPress={handleActionPress(onToggleActive)}
            style={[
              styles.toggleButton,
              subscription.isActive
                ? styles.toggleButtonActive
                : styles.toggleButtonInactive,
            ]}
          >
            <Text
              style={[
                styles.toggleButtonText,
                subscription.isActive
                  ? styles.toggleButtonTextActive
                  : styles.toggleButtonTextInactive,
              ]}
            >
              {subscription.isActive ? copy.common.active : copy.common.inactive}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (theme: AppTheme, displayMode: DisplayMode) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.card,
      borderRadius: displayMode === "normalList" ? 24 : 20,
      padding:
        displayMode === "normalList"
          ? 18
          : displayMode === "compactList"
            ? 16
            : 14,
      gap: displayMode === "normalList" ? 18 : 12,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: "hidden",
    },
    detailTouchable: {
      gap: displayMode === "normalList" ? 18 : 12,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12,
    },
    titleBlock: {
      flex: 1,
      gap: 8,
      minWidth: 0,
    },
    name: {
      color: theme.text,
      fontSize: displayMode === "normalList" ? 20 : 17,
      fontWeight: "800",
      flexShrink: 1,
      maxWidth: "100%",
      overflow: "hidden",
    },
    category: {
      color: theme.subtext,
      fontSize: displayMode === "normalList" ? 14 : 12,
      fontWeight: "600",
    },
    priceBlock: {
      alignItems: "flex-end",
      gap: displayMode === "normalList" ? 6 : 4,
      maxWidth:
        displayMode === "compactList" || displayMode === "compactGrid"
          ? "48%"
          : undefined,
    },
    price: {
      color: theme.text,
      fontSize: displayMode === "normalList" ? 18 : 15,
      fontWeight: "800",
      textAlign: "right",
    },
    cycle: {
      color: theme.accent,
      fontSize: displayMode === "normalList" ? 12 : 10,
      fontWeight: "700",
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    paymentText: {
      color: theme.text,
      fontSize: displayMode === "normalList" ? 14 : 12,
      fontWeight: "700",
      lineHeight: displayMode === "normalList" ? 20 : 17,
    },
    memoText: {
      color: theme.subtext,
      fontSize: 13,
      lineHeight: 20,
      fontWeight: "600",
    },
    actionRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: displayMode === "normalList" ? 10 : 8,
      paddingTop: displayMode === "normalList" ? 0 : 2,
    },
    secondaryButton: {
      backgroundColor: theme.inputBackground,
      borderRadius: 999,
      paddingHorizontal: displayMode === "normalList" ? 16 : 12,
      paddingVertical: displayMode === "normalList" ? 8 : 7,
      borderWidth: 1,
      borderColor: theme.border,
    },
    secondaryButtonText: {
      color: theme.text,
      fontSize: displayMode === "normalList" ? 12 : 11,
      fontWeight: "700",
    },
    deleteButton: {
      backgroundColor: theme.destructiveSoft,
      borderRadius: 999,
      paddingHorizontal: displayMode === "normalList" ? 16 : 12,
      paddingVertical: displayMode === "normalList" ? 8 : 7,
      borderWidth: 1,
      borderColor: theme.destructiveSoft,
    },
    deleteButtonText: {
      color: theme.destructive,
      fontSize: displayMode === "normalList" ? 12 : 11,
      fontWeight: "700",
    },
    toggleButton: {
      borderRadius: 999,
      paddingHorizontal: displayMode === "normalList" ? 14 : 11,
      paddingVertical: displayMode === "normalList" ? 8 : 7,
      borderWidth: 1,
    },
    toggleButtonActive: {
      backgroundColor: theme.accentSoft,
      borderColor: theme.accentSoft,
    },
    toggleButtonInactive: {
      backgroundColor: theme.inputBackground,
      borderColor: theme.border,
    },
    toggleButtonText: {
      fontSize: displayMode === "normalList" ? 12 : 11,
      fontWeight: "700",
    },
    toggleButtonTextActive: {
      color: theme.accent,
    },
    toggleButtonTextInactive: {
      color: theme.subtext,
    },
  });
