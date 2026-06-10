import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type { AppTheme } from "../theme/theme";
import { useAppTheme } from "../theme/theme";

export type DropdownOption<T extends string> = {
  label: string;
  value: T;
};

type CustomDropdownProps<T extends string> = {
  disabled?: boolean;
  onSelect: (value: T) => void | Promise<void>;
  options: readonly DropdownOption<T>[];
  placeholder?: string;
  selectedValue: T | "";
};

type DropdownItemRowProps = {
  isSelected: boolean;
  label: string;
  onPress: () => void;
};

const MAX_VISIBLE_OPTIONS = 10;
const OPTION_HEIGHT = 52;
const OPEN_DURATION_MS = 120;
const CLOSE_DURATION_MS = 100;

const DropdownItemRow = memo(function DropdownItemRow({
  isSelected,
  label,
  onPress,
}: DropdownItemRowProps) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        styles.optionButton,
        isSelected && styles.optionButtonSelected,
      ]}
    >
      <Text
        style={[
          styles.optionText,
          isSelected && styles.optionTextSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
});

function CustomDropdownInner<T extends string>({
  disabled = false,
  onSelect,
  options,
  placeholder = "",
  selectedValue,
}: CustomDropdownProps<T>) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const progress = useRef(new Animated.Value(0)).current;
  const [isMounted, setIsMounted] = useState(false);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === selectedValue),
    [options, selectedValue],
  );
  const shouldScroll = options.length > MAX_VISIBLE_OPTIONS;
  const panelHeight =
    Math.min(options.length, MAX_VISIBLE_OPTIONS) * OPTION_HEIGHT + 18;

  const overlayOpacity = useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
    [progress],
  );

  const panelTransform = useMemo(
    () => [
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [8, 0],
        }),
      },
      {
        scale: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.985, 1],
        }),
      },
    ],
    [progress],
  );

  const finishClose = useCallback(() => {
    setIsMounted(false);
    progress.setValue(0);
  }, [progress]);

  const closeDropdown = useCallback(() => {
    Animated.timing(progress, {
      toValue: 0,
      duration: CLOSE_DURATION_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      finishClose();
    });
  }, [finishClose, progress]);

  const openDropdown = useCallback(() => {
    if (disabled || isMounted) {
      return;
    }

    setIsMounted(true);

    requestAnimationFrame(() => {
      Animated.timing(progress, {
        toValue: 1,
        duration: OPEN_DURATION_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    });
  }, [disabled, isMounted, progress]);

  const handleSelect = useCallback(
    (value: T) => {
      closeDropdown();
      void onSelect(value);
    },
    [closeDropdown, onSelect],
  );

  const renderOptionItem = useCallback(
    ({ item }: { item: DropdownOption<T> }) => (
      <DropdownItemRow
        isSelected={item.value === selectedValue}
        label={item.label}
        onPress={() => handleSelect(item.value)}
      />
    ),
    [handleSelect, selectedValue],
  );

  useEffect(
    () => () => {
      progress.stopAnimation();
    },
    [progress],
  );

  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.9}
        disabled={disabled}
        onPress={openDropdown}
        style={[
          styles.trigger,
          isMounted && styles.triggerOpen,
          disabled && styles.triggerDisabled,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.triggerText,
            !selectedOption && styles.placeholderText,
          ]}
        >
          {selectedOption?.label ?? placeholder}
        </Text>
        <Text style={styles.chevron}>{isMounted ? "▴" : "▾"}</Text>
      </TouchableOpacity>

      <Modal
        animationType="none"
        onRequestClose={closeDropdown}
        statusBarTranslucent
        transparent
        visible={isMounted}
      >
        <View style={styles.modalRoot}>
          <Animated.View
            pointerEvents="none"
            style={[styles.backdrop, { opacity: overlayOpacity }]}
          />
          <TouchableOpacity
            activeOpacity={1}
            onPress={closeDropdown}
            style={styles.backdropTouchTarget}
          />

          <View style={styles.modalContent}>
            <Animated.View
              style={[
                styles.optionPanel,
                {
                  maxHeight: panelHeight,
                  opacity: overlayOpacity,
                  transform: panelTransform,
                },
              ]}
            >
              {shouldScroll ? (
                <FlatList
                  bounces={false}
                  data={options}
                  initialNumToRender={Math.min(options.length, 8)}
                  keyExtractor={(item) => item.value}
                  removeClippedSubviews
                  renderItem={renderOptionItem}
                  showsVerticalScrollIndicator
                />
              ) : (
                <View style={styles.optionList}>
                  {options.map((option) => (
                    <DropdownItemRow
                      isSelected={option.value === selectedValue}
                      key={option.value}
                      label={option.label}
                      onPress={() => handleSelect(option.value)}
                    />
                  ))}
                </View>
              )}
            </Animated.View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export const CustomDropdown = memo(
  CustomDropdownInner,
) as typeof CustomDropdownInner;

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    trigger: {
      minHeight: 54,
      backgroundColor: theme.inputBackground,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 18,
      paddingVertical: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    triggerOpen: {
      borderColor: theme.accent,
    },
    triggerDisabled: {
      opacity: 0.6,
    },
    triggerText: {
      color: theme.text,
      fontSize: 15,
      fontWeight: "600",
      flex: 1,
    },
    placeholderText: {
      color: theme.subtext,
      fontWeight: "500",
    },
    chevron: {
      color: theme.subtext,
      fontSize: 16,
      fontWeight: "800",
    },
    modalRoot: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(2, 6, 23, 0.26)",
    },
    backdropTouchTarget: {
      ...StyleSheet.absoluteFillObject,
    },
    modalContent: {
      width: "100%",
      maxWidth: 380,
      alignSelf: "center",
    },
    optionPanel: {
      backgroundColor: theme.surface,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 8,
      shadowColor: theme.mode === "dark" ? "#020617" : "#94a3b8",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: theme.mode === "dark" ? 0.14 : 0.1,
      shadowRadius: 10,
      elevation: 4,
    },
    optionList: {
      gap: 6,
    },
    optionButton: {
      minHeight: OPTION_HEIGHT,
      borderRadius: 16,
      justifyContent: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    optionButtonSelected: {
      backgroundColor: theme.accentSoft,
    },
    optionText: {
      color: theme.text,
      fontSize: 15,
      fontWeight: "600",
    },
    optionTextSelected: {
      color: theme.accent,
      fontWeight: "800",
    },
  });
