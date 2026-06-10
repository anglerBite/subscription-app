import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type { AppTheme } from "../theme/theme";
import { useAppTheme } from "../theme/theme";

export type ConfirmType = "default" | "danger";

export type CustomAlertProps = {
  cancelText?: string;
  confirmText?: string;
  confirmType?: ConfirmType;
  message?: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  visible: boolean;
};

export type CustomAlertOptions = {
  cancelText?: string;
  confirmText?: string;
  confirmType?: ConfirmType;
  message?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  title: string;
};

type AlertState = CustomAlertOptions & {
  visible: boolean;
};

const initialAlertState: AlertState = {
  cancelText: undefined,
  confirmText: undefined,
  confirmType: "default",
  message: undefined,
  onCancel: undefined,
  onConfirm: undefined,
  title: "",
  visible: false,
};

let presentAlert:
  | ((options: CustomAlertOptions) => void)
  | null = null;
let pendingAlert: CustomAlertOptions | null = null;

export function showCustomAlert(options: CustomAlertOptions) {
  if (presentAlert) {
    presentAlert(options);
    return;
  }

  pendingAlert = options;
}

export function CustomAlert({
  cancelText,
  confirmText = "OK",
  confirmType = "default",
  message,
  onCancel,
  onConfirm,
  title,
  visible,
}: CustomAlertProps) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isDanger = confirmType === "danger";

  return (
    <Modal
      animationType="fade"
      onRequestClose={cancelText ? onCancel : onConfirm}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.buttonRow}>
            {cancelText ? (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={onCancel}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={onConfirm}
              style={[
                styles.confirmButton,
                isDanger
                  ? styles.confirmButtonDanger
                  : styles.confirmButtonDefault,
                !cancelText && styles.confirmButtonSingle,
              ]}
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  isDanger
                    ? styles.confirmButtonTextDanger
                    : styles.confirmButtonTextDefault,
                ]}
              >
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function CustomAlertHost() {
  const [alertState, setAlertState] = useState<AlertState>(initialAlertState);

  useEffect(() => {
    const openAlert = (options: CustomAlertOptions) => {
      setAlertState({
        ...initialAlertState,
        ...options,
        confirmText: options.confirmText ?? "OK",
        confirmType: options.confirmType ?? "default",
        visible: true,
      });
    };

    presentAlert = openAlert;

    if (pendingAlert) {
      openAlert(pendingAlert);
      pendingAlert = null;
    }

    return () => {
      if (presentAlert === openAlert) {
        presentAlert = null;
      }
    };
  }, []);

  const hideAlert = () => {
    setAlertState(initialAlertState);
  };

  const handleCancel = () => {
    const onCancel = alertState.onCancel;
    hideAlert();
    onCancel?.();
  };

  const handleConfirm = () => {
    const onConfirm = alertState.onConfirm;
    hideAlert();
    onConfirm?.();
  };

  return (
    <CustomAlert
      cancelText={alertState.cancelText}
      confirmText={alertState.confirmText}
      confirmType={alertState.confirmType}
      message={alertState.message}
      onCancel={handleCancel}
      onConfirm={handleConfirm}
      title={alertState.title}
      visible={alertState.visible}
    />
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(2, 6, 23, 0.58)",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    card: {
      width: "100%",
      maxWidth: 380,
      backgroundColor: theme.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 22,
      paddingVertical: 22,
      gap: 18,
    },
    title: {
      color: theme.text,
      fontSize: 18,
      fontWeight: "800",
      lineHeight: 26,
    },
    message: {
      color: theme.subtext,
      fontSize: 14,
      lineHeight: 22,
      fontWeight: "600",
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 10,
    },
    cancelButton: {
      flex: 1,
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.inputBackground,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    cancelButtonText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "700",
    },
    confirmButton: {
      flex: 1,
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 16,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    confirmButtonSingle: {
      flex: 0,
      minWidth: 132,
      alignSelf: "flex-end",
    },
    confirmButtonDefault: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    confirmButtonDanger: {
      backgroundColor: theme.destructiveSoft,
      borderColor: theme.destructive,
    },
    confirmButtonText: {
      fontSize: 14,
      fontWeight: "800",
    },
    confirmButtonTextDefault: {
      color: theme.onAccent,
    },
    confirmButtonTextDanger: {
      color: theme.destructive,
    },
  });
