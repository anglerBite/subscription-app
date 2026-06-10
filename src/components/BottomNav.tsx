import React, { memo, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { AppTheme } from "../theme/theme";
import { useAppTheme } from "../theme/theme";
import { navigationLabels } from "../utils/localization";

const tabIcons = {
  Add: {
    active: "add-circle",
    inactive: "add-circle-outline",
  },
  Home: {
    active: "home",
    inactive: "home-outline",
  },
  Setting: {
    active: "settings",
    inactive: "settings-outline",
  },
  Stats: {
    active: "wallet",
    inactive: "wallet-outline",
  },
} as const;

export type BottomNavRouteName = keyof typeof tabIcons;

type StandaloneBottomNavProps = {
  activeRouteName?: BottomNavRouteName;
  onNavigate: (routeName: BottomNavRouteName) => void;
};

type BottomNavProps = BottomTabBarProps | StandaloneBottomNavProps;

type BottomNavItem = {
  key: string;
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  routeName: BottomNavRouteName;
  isFocused: boolean;
  accessibilityLabel?: string;
  onLongPress?: () => void;
  onPress: () => void;
};

function isTabBarProps(props: BottomNavProps): props is BottomTabBarProps {
  return "state" in props && "descriptors" in props && "navigation" in props;
}

function BottomNavInner(props: BottomNavProps) {
  const { language, theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const tabLabels = useMemo(() => navigationLabels[language], [language]);
  const routeNames = useMemo(
    () => Object.keys(tabLabels) as BottomNavRouteName[],
    [tabLabels],
  );
  const items: BottomNavItem[] = useMemo(
    () =>
      isTabBarProps(props)
        ? props.state.routes.map((route, index) => {
            const routeName = route.name as BottomNavRouteName;
            const isFocused = props.state.index === index;

            return {
              key: route.key,
              iconName: itemIconName(routeName, isFocused),
              label: tabLabels[routeName],
              routeName,
              isFocused,
              accessibilityLabel:
                props.descriptors[route.key].options.tabBarAccessibilityLabel,
              onLongPress: () => {
                props.navigation.emit({
                  type: "tabLongPress",
                  target: route.key,
                });
              },
              onPress: () => {
                const event = props.navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  props.navigation.navigate(routeName);
                }
              },
            };
          })
        : routeNames.map((routeName) => ({
            key: routeName,
            iconName: itemIconName(
              routeName,
              props.activeRouteName === routeName,
            ),
            label: tabLabels[routeName],
            routeName,
            isFocused: props.activeRouteName === routeName,
            onPress: () => props.onNavigate(routeName),
          })),
    [props, routeNames, tabLabels],
  );

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          paddingBottom: Math.max(insets.bottom, 16),
        },
      ]}
    >
      <View style={styles.container}>
        {items.map((item) => {
          return (
            <TouchableOpacity
              key={item.key}
              accessibilityLabel={item.accessibilityLabel}
              accessibilityRole="button"
              accessibilityState={item.isFocused ? { selected: true } : {}}
              activeOpacity={0.85}
              onLongPress={item.onLongPress}
              onPress={item.onPress}
              style={[styles.tabButton, item.isFocused && styles.tabButtonActive]}
            >
              <View
                style={[
                  styles.iconBubble,
                  item.isFocused && styles.iconBubbleActive,
                ]}
              >
                <Ionicons
                  color={item.isFocused ? theme.accent : theme.subtext}
                  name={item.iconName}
                  size={16}
                />
              </View>
              <Text
                numberOfLines={1}
                style={[
                  styles.tabLabel,
                  item.isFocused && styles.tabLabelActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export const BottomNav = memo(BottomNavInner);

function itemIconName(
  routeName: BottomNavRouteName,
  isFocused: boolean,
): keyof typeof Ionicons.glyphMap {
  return isFocused ? tabIcons[routeName].active : tabIcons[routeName].inactive;
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    wrapper: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 30,
      backgroundColor: "transparent",
      paddingHorizontal: 16,
      paddingTop: 0,
    },
    container: {
      backgroundColor: theme.bottomNav,
      borderRadius: 22,
      paddingVertical: 14,
      paddingHorizontal: 10,
      flexDirection: "row",
      gap: 6,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.mode === "dark" ? "#020617" : "#94a3b8",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: theme.mode === "dark" ? 0.18 : 0.1,
      shadowRadius: 10,
      elevation: 6,
    },
    tabButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 18,
      paddingVertical: 10,
      paddingHorizontal: 4,
      gap: 6,
    },
    tabButtonActive: {
      backgroundColor: theme.accentSoft,
    },
    iconBubble: {
      width: 28,
      height: 28,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.iconBubble,
    },
    iconBubbleActive: {
      backgroundColor: theme.activeBubble,
    },
    tabLabel: {
      color: theme.subtext,
      fontSize: 10,
      fontWeight: "700",
    },
    tabLabelActive: {
      color: theme.accent,
    },
  });
