import React, { useState } from "react";
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
  SUBSCRIPTION_CATEGORIES,
  type SubscriptionCategoryValue,
} from "../constants/subscriptionCategories";
import {
  type SubscriptionDraft,
  validateSubscriptionDraft,
} from "../services/subscriptionService";
import type { AppTheme } from "../theme/theme";
import { useAppTheme } from "../theme/theme";
import type { BillingCycle, BillingCycleValue } from "../types/subscription";
import {
  appCopy,
  billingCycleLabels,
  getCategoryLabel,
} from "../utils/localization";

const cycleOptions: BillingCycle[] = ["monthly", "yearly", "weekly"];

type AddScreenProps = {
  onCreateSubscription: (draft: SubscriptionDraft) => Promise<boolean>;
};

export function AddScreen({ onCreateSubscription }: AddScreenProps) {
  const { language, theme } = useAppTheme();
  const styles = createStyles(theme);
  const copy = appCopy[language];
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [billingCycle, setBillingCycle] = useState<BillingCycleValue>("");
  const [nextPaymentDate, setNextPaymentDate] = useState("");
  const [category, setCategory] = useState<SubscriptionCategoryValue>("");
  const [memo, setMemo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setPrice("");
    setBillingCycle("");
    setNextPaymentDate("");
    setCategory("");
    setMemo("");
  };

  const handleResetPress = () => {
    showCustomAlert({
      cancelText: copy.common.cancel,
      confirmText: copy.common.reset,
      confirmType: "default",
      message: copy.add.resetConfirmMessage,
      onConfirm: resetForm,
      title: copy.add.resetConfirmTitle,
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    const draft: SubscriptionDraft = {
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

    setIsSubmitting(true);
    let didSave = false;

    try {
      didSave = await onCreateSubscription(draft);
    } finally {
      setIsSubmitting(false);
    }

    if (didSave) {
      showCustomAlert({
        confirmText: copy.common.ok,
        title: copy.add.success,
      });
      resetForm();
      return;
    }

    showCustomAlert({
      confirmText: copy.common.ok,
      title: copy.add.saveFailed,
    });
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
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
            <Text style={styles.eyebrow}>{copy.add.eyebrow}</Text>
            <Text style={styles.title}>{copy.add.title}</Text>
            <Text style={styles.description}>{copy.add.description}</Text>
          </View>

          <View style={styles.formCard}>
            <InputField
              editable={!isSubmitting}
              label={copy.add.nameLabel}
              onChangeText={setName}
              placeholder={copy.add.namePlaceholder}
              theme={theme}
              value={name}
            />
            <InputField
              editable={!isSubmitting}
              keyboardType="numeric"
              label={copy.add.priceLabel}
              onChangeText={setPrice}
              placeholder={copy.add.pricePlaceholder}
              theme={theme}
              value={price}
            />

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{copy.add.cycleLabel}</Text>
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
              label={copy.add.nextPaymentDateLabel}
              onChange={setNextPaymentDate}
              onClear={() => setNextPaymentDate("")}
              placeholder={copy.common.selectPaymentDate}
              value={nextPaymentDate}
            />
            <DropdownField
              disabled={isSubmitting}
              getOptionLabel={(option) => getCategoryLabel(option, language)}
              label={copy.add.categoryLabel}
              onClear={() => setCategory("")}
              onSelect={setCategory}
              options={SUBSCRIPTION_CATEGORIES}
              placeholder={copy.add.categoryPlaceholder}
              value={category}
            />
            <InputField
              editable={!isSubmitting}
              label={copy.add.memoLabel}
              helperText={
                memo.length >= 100
                  ? copy.common.noMoreInput
                  : copy.common.remainingCharacters(100 - memo.length)
              }
              helperTone={memo.length >= 100 ? "warning" : "default"}
              maxLength={100}
              multiline
              onChangeText={setMemo}
              placeholder={copy.add.memoPlaceholder}
              theme={theme}
              value={memo}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                activeOpacity={0.9}
                disabled={isSubmitting}
                onPress={handleResetPress}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>
                  {copy.common.reset}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.9}
                disabled={isSubmitting}
                onPress={() => {
                  void handleSubmit();
                }}
                style={[
                  styles.submitButton,
                  isSubmitting && styles.submitButtonDisabled,
                ]}
              >
                <Text style={styles.submitText}>
                  {isSubmitting ? copy.add.submittingButton : copy.add.submitButton}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    buttonRow: {
      marginTop: 8,
      flexDirection: "row",
      gap: 12,
    },
    secondaryButton: {
      flex: 1,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.inputBackground,
      paddingVertical: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryButtonText: {
      color: theme.text,
      fontSize: 15,
      fontWeight: "800",
    },
  });
