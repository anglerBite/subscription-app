import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DatePickerField } from "../components/DatePickerField";
import { showCustomAlert } from "../components/CustomAlert";
import { DropdownField } from "../components/DropdownField";
import {
  normalizeSubscriptionCategory,
  SUBSCRIPTION_CATEGORIES,
  type SubscriptionCategoryValue,
} from "../constants/subscriptionCategories";
import type { AppTheme } from "../theme/theme";
import { validateSubscriptionDraft } from "../services/subscriptionService";
import { useAppTheme } from "../theme/theme";
import type {
  BillingCycle,
  BillingCycleValue,
  Subscription,
} from "../types/subscription";
import {
  appCopy,
  billingCycleLabels,
  getCategoryLabel,
} from "../utils/localization";

const cycleOptions: BillingCycle[] = ["monthly", "yearly", "weekly"];

type EditScreenProps = {
  subscription?: Subscription;
  onCancel: () => void;
  onGoBack: () => void;
  onSaveComplete: () => void;
  onSaveSubscription: (subscription: Subscription) => Promise<boolean>;
};

export function EditScreen({
  subscription,
  onCancel,
  onGoBack,
  onSaveComplete,
  onSaveSubscription,
}: EditScreenProps) {
  const { language, theme } = useAppTheme();
  const styles = createStyles(theme);
  const copy = appCopy[language];
  const [name, setName] = useState(subscription?.name ?? "");
  const [price, setPrice] = useState(
    subscription && subscription.price > 0 ? String(subscription.price) : "",
  );
  const [billingCycle, setBillingCycle] = useState<BillingCycleValue>(
    subscription?.billingCycle ?? "",
  );
  const [nextPaymentDate, setNextPaymentDate] = useState(
    subscription?.nextPaymentDate ?? "",
  );
  const [category, setCategory] = useState<SubscriptionCategoryValue>(
    subscription?.category
      ? normalizeSubscriptionCategory(subscription.category)
      : "",
  );
  const [memo, setMemo] = useState(subscription?.memo ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setName(subscription?.name ?? "");
    setPrice(
      subscription && subscription.price > 0 ? String(subscription.price) : "",
    );
    setBillingCycle(subscription?.billingCycle ?? "");
    setNextPaymentDate(subscription?.nextPaymentDate ?? "");
    setCategory(
      subscription?.category
        ? normalizeSubscriptionCategory(subscription.category)
        : "",
    );
    setMemo(subscription?.memo ?? "");
  }, [subscription]);

  if (!subscription) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.screen}>
          <View style={styles.missingContainer}>
            <Text style={styles.missingTitle}>{copy.edit.missingTitle}</Text>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={onSaveComplete}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>{copy.edit.toHome}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    if (isSubmitting) {
      return;
    }

    const draft = {
      name,
      price: price.trim() ? Number(price) : 0,
      billingCycle,
      nextPaymentDate,
      category,
      memo,
    };
    const validationError = validateSubscriptionDraft(draft);

    if (validationError) {
      showCustomAlert({
        confirmText: copy.common.ok,
        title: copy.common.validation[validationError],
      });
      return;
    }

    const nextSubscription: Subscription = {
      ...subscription,
      ...draft,
      category: draft.category
        ? normalizeSubscriptionCategory(draft.category)
        : "",
      updatedAt: new Date().toISOString(),
    };

    setIsSubmitting(true);
    let didSave = false;

    try {
      didSave = await onSaveSubscription(nextSubscription);
    } finally {
      setIsSubmitting(false);
    }

    if (didSave) {
      showCustomAlert({
        confirmText: copy.common.ok,
        onConfirm: onSaveComplete,
        title: copy.edit.success,
      });
      return;
    }

    showCustomAlert({
      confirmText: copy.common.ok,
      title: copy.edit.saveFailed,
    });
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.screen}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
          >
            <View style={styles.heroCard}>
              <Text style={styles.eyebrow}>{copy.edit.eyebrow}</Text>
              <Text style={styles.title}>{copy.edit.title}</Text>
              <Text style={styles.description}>{copy.edit.description}</Text>
            </View>

            <View style={styles.formCard}>
              <InputField
                editable={!isSubmitting}
                label={copy.edit.nameLabel}
                onChangeText={setName}
                placeholder={copy.edit.namePlaceholder}
                theme={theme}
                value={name}
              />
              <InputField
                editable={!isSubmitting}
                keyboardType="numeric"
                label={copy.edit.priceLabel}
                onChangeText={setPrice}
                placeholder={copy.edit.pricePlaceholder}
                theme={theme}
                value={price}
              />

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{copy.edit.cycleLabel}</Text>
                <View style={styles.segmentRow}>
                  {cycleOptions.map((option) => {
                    const isSelected = billingCycle === option;

                    return (
                      <TouchableOpacity
                        activeOpacity={0.88}
                        disabled={isSubmitting}
                        key={option}
                        onPress={() =>
                          setBillingCycle((currentValue) =>
                            currentValue === option ? "" : option,
                          )
                        }
                        style={[
                          styles.segmentButton,
                          isSelected && styles.segmentButtonSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.segmentText,
                            isSelected && styles.segmentTextSelected,
                          ]}
                        >
                          {billingCycleLabels[language][option]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <DatePickerField
                disabled={isSubmitting}
                label={copy.edit.nextPaymentDateLabel}
                onChange={setNextPaymentDate}
                onClear={() => setNextPaymentDate("")}
                placeholder={copy.common.selectPaymentDate}
                value={nextPaymentDate}
              />
              <DropdownField
                disabled={isSubmitting}
                getOptionLabel={(option) => getCategoryLabel(option, language)}
                label={copy.edit.categoryLabel}
                onClear={() => setCategory("")}
                onSelect={setCategory}
                options={SUBSCRIPTION_CATEGORIES}
                placeholder={copy.edit.categoryPlaceholder}
                value={category}
              />
              <InputField
                editable={!isSubmitting}
                label={copy.edit.memoLabel}
                helperText={
                  memo.length >= 100
                    ? copy.common.noMoreInput
                    : copy.common.remainingCharacters(100 - memo.length)
                }
                helperTone={memo.length >= 100 ? "warning" : "default"}
                maxLength={100}
                multiline
                onChangeText={setMemo}
                placeholder={copy.edit.memoPlaceholder}
                theme={theme}
                value={memo}
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  disabled={isSubmitting}
                  onPress={onCancel}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>
                    {copy.edit.cancelButton}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.9}
                  disabled={isSubmitting}
                  onPress={() => {
                    void handleSave();
                  }}
                  style={[
                    styles.submitButton,
                    isSubmitting && styles.submitButtonDisabled,
                  ]}
                >
                  <Text style={styles.submitText}>
                    {isSubmitting ? copy.edit.savingButton : copy.edit.saveButton}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                disabled={isSubmitting}
                onPress={onGoBack}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>{copy.common.back}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

type InputFieldProps = {
  editable?: boolean;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric";
  multiline?: boolean;
  theme: AppTheme;
  maxLength?: number;
  helperText?: string;
  helperTone?: "default" | "warning";
};

function InputField({
  editable = true,
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
  theme,
  maxLength,
  helperText,
  helperTone = "default",
}: InputFieldProps) {
  const styles = createStyles(theme);

  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        editable={editable}
        keyboardAppearance={theme.mode === "dark" ? "dark" : "light"}
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.subtext}
        style={[styles.input, multiline && styles.textArea]}
        value={value}
      />
      {helperText ? (
        <Text
          style={[
            styles.helperText,
            helperTone === "warning" && styles.helperTextWarning,
          ]}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    keyboardView: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollView: {
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
    formCard: {
      backgroundColor: theme.surface,
      borderRadius: 30,
      padding: 20,
      gap: 18,
      borderWidth: 1,
      borderColor: theme.border,
    },
    fieldBlock: {
      gap: 10,
    },
    fieldLabel: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "700",
    },
    input: {
      backgroundColor: theme.inputBackground,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 16,
      paddingVertical: 15,
      color: theme.text,
      fontSize: 15,
    },
    textArea: {
      minHeight: 110,
      textAlignVertical: "top",
    },
    helperText: {
      color: theme.subtext,
      fontSize: 12,
      fontWeight: "600",
      textAlign: "right",
    },
    helperTextWarning: {
      color: theme.warning,
    },
    segmentRow: {
      flexDirection: "row",
      gap: 10,
    },
    segmentButton: {
      flex: 1,
      backgroundColor: theme.inputBackground,
      borderRadius: 18,
      paddingVertical: 14,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.border,
    },
    segmentButtonSelected: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    segmentText: {
      color: theme.subtext,
      fontSize: 14,
      fontWeight: "700",
    },
    segmentTextSelected: {
      color: theme.onAccent,
    },
    buttonRow: {
      flexDirection: "row",
      gap: 12,
      marginTop: 8,
    },
    backButton: {
      alignSelf: "center",
      marginTop: 16,
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
    submitButton: {
      flex: 1,
      backgroundColor: theme.accent,
      borderRadius: 22,
      paddingVertical: 18,
      alignItems: "center",
    },
    submitButtonDisabled: {
      opacity: 0.7,
    },
    submitText: {
      color: theme.onAccent,
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
