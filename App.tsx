/* eslint-disable import/no-duplicates */
import "react-native-gesture-handler";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Platform, StatusBar, StyleSheet, Text, View } from "react-native";
import {
  NavigationContainer,
  type NavigatorScreenParams,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { BottomNav } from "./src/components/BottomNav";
import {
  CustomAlertHost,
  showCustomAlert,
} from "./src/components/CustomAlert";
import { initializeDatabase } from "./src/db/database";
import { AddScreen } from "./src/screens/AddScreen";
import { EditScreen } from "./src/screens/EditScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { SettingScreen } from "./src/screens/SettingScreen";
import { StatsScreen } from "./src/screens/StatsScreen";
import { SubscriptionDetailScreen } from "./src/screens/SubscriptionDetailScreen";
import {
  fallbackRates,
  formatAmountFromJPY as formatAmountFromJPYWithRates,
  getExchangeRates,
  type ExchangeRateLoadSource,
  type ExchangeRates,
} from "./src/services/exchangeRateService";
import {
  changeCurrency,
  changeLanguage,
  changeNotificationEmail,
  changeNotificationEnabled,
  changeTheme,
  loadSettings,
} from "./src/services/settingsService";
import { syncNotificationCatalog } from "./src/services/notificationSyncService";
import { updateExpiredPaymentDates } from "./src/services/paymentDateService";
import {
  createSubscription,
  deleteSubscription,
  getSubscriptions,
  toggleSubscriptionActive,
  updateSubscription,
  type SubscriptionDraft,
} from "./src/services/subscriptionService";
import {
  AppThemeProvider,
  getNavigationTheme,
  themes,
  useAppTheme,
} from "./src/theme/theme";
import {
  defaultSettings,
  type AppSettings,
  type CurrencyCode,
  type LanguageCode,
  type ThemeSetting,
} from "./src/types/settings";
import type { Subscription } from "./src/types/subscription";
import { appCopy } from "./src/utils/localization";

export type RootTabParamList = {
  Home: undefined;
  Add: undefined;
  Stats: undefined;
  Setting: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<RootTabParamList> | undefined;
  Detail: {
    subscriptionId: string;
  };
  Edit: {
    subscriptionId: string;
  };
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
const TAB_TRANSITION_SPEC = {
  animation: "timing" as const,
  config: {
    duration: 120,
  },
};

type MainTabsProps = {
  onCreateSubscription: (draft: SubscriptionDraft) => Promise<boolean>;
  subscriptions: Subscription[];
  onDeleteSubscription: (subscriptionId: string) => Promise<boolean>;
  onEditSubscription: (subscriptionId: string) => void;
  onOpenSubscriptionDetail: (subscriptionId: string) => void;
  onRefreshSubscriptions: () => Promise<void>;
  onToggleSubscriptionActive: (subscriptionId: string) => Promise<boolean>;
};

function MainTabs({
  onCreateSubscription,
  subscriptions,
  onDeleteSubscription,
  onEditSubscription,
  onOpenSubscriptionDetail,
  onRefreshSubscriptions,
  onToggleSubscriptionActive,
}: MainTabsProps) {
  const { theme } = useAppTheme();

  return (
    <Tab.Navigator
      detachInactiveScreens
      screenOptions={{
        animation: "fade",
        freezeOnBlur: true,
        headerShown: false,
        lazy: true,
        sceneStyle: {
          backgroundColor: theme.background,
        },
        transitionSpec: TAB_TRANSITION_SPEC,
      }}
      tabBar={(props) => <BottomNav {...props} />}
    >
      <Tab.Screen name="Home">
        {() => (
          <HomeScreen
            onDeleteSubscription={onDeleteSubscription}
            onEditSubscription={onEditSubscription}
            onOpenSubscriptionDetail={onOpenSubscriptionDetail}
            onRefreshSubscriptions={onRefreshSubscriptions}
            onToggleSubscriptionActive={onToggleSubscriptionActive}
            subscriptions={subscriptions}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Add">
        {() => <AddScreen onCreateSubscription={onCreateSubscription} />}
      </Tab.Screen>
      <Tab.Screen name="Stats">
        {() => <StatsScreen subscriptions={subscriptions} />}
      </Tab.Screen>
      <Tab.Screen name="Setting" component={SettingScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(fallbackRates);
  const [exchangeRateSource, setExchangeRateSource] =
    useState<ExchangeRateLoadSource>("fallback");
  const createInFlightRef = useRef(false);
  const updateInFlightRef = useRef(false);
  const deletingIdsRef = useRef<Set<string>>(new Set());
  const togglingIdsRef = useRef<Set<string>>(new Set());

  const theme = themes[settings.theme];
  const copy = appCopy[settings.language];

  const refreshSubscriptions = useCallback(async () => {
    const nextSubscriptions = await getSubscriptions();
    setSubscriptions(nextSubscriptions);
  }, []);

  const refreshExchangeRates = useCallback(
    async () => {
      try {
        const rateResult = await getExchangeRates("JPY");
        setExchangeRates(rateResult.rates);
        setExchangeRateSource(rateResult.source);
      } catch (error) {
        console.error("Failed to load exchange rates.", error);
        setExchangeRates(fallbackRates);
        setExchangeRateSource("fallback");
      }
    },
    [],
  );

  useEffect(() => {
    const bootstrapApp = async () => {
      try {
        await initializeDatabase();
        await updateExpiredPaymentDates();

        const storedSettings = await loadSettings();
        setSettings(storedSettings);

        const [storedSubscriptions] = await Promise.all([
          getSubscriptions(),
          refreshExchangeRates(),
        ]);

        setSubscriptions(storedSubscriptions);
      } catch (error) {
        console.error("Failed to initialize persistence.", error);
      } finally {
        setIsAppReady(true);
      }
    };

    void bootstrapApp();
  }, [refreshExchangeRates]);

  const handleSetThemePreference = useCallback(
    async (nextTheme: ThemeSetting) => {
      const previousSettings = settings;
      const nextSettings: AppSettings = {
        ...settings,
        theme: nextTheme,
      };

      setSettings(nextSettings);

      const persistedSettings = await changeTheme(nextTheme);

      if (persistedSettings) {
        setSettings(persistedSettings);
        return;
      }

      setSettings(previousSettings);
    },
    [settings],
  );

  const handleSetNotificationEmailPreference = useCallback(
    async (nextNotificationEmail: string): Promise<boolean> => {
      const previousSettings = settings;
      const nextSettings: AppSettings = {
        ...settings,
        notificationEmail: nextNotificationEmail.trim(),
      };

      setSettings(nextSettings);

      const persistedSettings = await changeNotificationEmail(
        nextNotificationEmail,
      );

      if (persistedSettings) {
        setSettings(persistedSettings);
        return true;
      }

      setSettings(previousSettings);
      return false;
    },
    [settings],
  );

  const handleSetNotificationEnabledPreference = useCallback(
    async (nextNotificationEnabled: boolean): Promise<boolean> => {
      const previousSettings = settings;
      const nextSettings: AppSettings = {
        ...settings,
        notificationEnabled: nextNotificationEnabled,
      };

      setSettings(nextSettings);

      const persistedSettings = await changeNotificationEnabled(
        nextNotificationEnabled,
      );

      if (persistedSettings) {
        setSettings(persistedSettings);
        return true;
      }

      setSettings(previousSettings);
      return false;
    },
    [settings],
  );

  const handleSetCurrencyPreference = useCallback(
    async (nextCurrency: CurrencyCode) => {
      const previousSettings = settings;
      const nextSettings: AppSettings = {
        ...settings,
        currency: nextCurrency,
      };

      setSettings(nextSettings);

      const persistedSettings = await changeCurrency(nextCurrency);

      if (persistedSettings) {
        setSettings(persistedSettings);
        return;
      }

      setSettings(previousSettings);
    },
    [settings],
  );

  const handleSetLanguagePreference = useCallback(
    async (nextLanguage: LanguageCode) => {
      const previousSettings = settings;
      const nextSettings: AppSettings = {
        ...settings,
        language: nextLanguage,
      };

      setSettings(nextSettings);

      const persistedSettings = await changeLanguage(nextLanguage);

      if (persistedSettings) {
        setSettings(persistedSettings);
        return;
      }

      setSettings(previousSettings);
    },
    [settings],
  );

  const formatAmountFromJPY = useCallback(
    (amountJPY: number, overrideCurrency?: CurrencyCode) =>
      formatAmountFromJPYWithRates(
        amountJPY,
        overrideCurrency ?? settings.currency,
        exchangeRates,
      ),
    [exchangeRates, settings.currency],
  );

  const handleCreateSubscription = useCallback(
    async (draft: SubscriptionDraft): Promise<boolean> => {
      if (createInFlightRef.current) {
        return false;
      }

      createInFlightRef.current = true;

      try {
        await createSubscription(draft);
        await refreshSubscriptions();
        return true;
      } catch (error) {
        console.error("Failed to create subscription.", error);
        return false;
      } finally {
        createInFlightRef.current = false;
      }
    },
    [refreshSubscriptions],
  );

  const handleDeleteSubscription = useCallback(
    async (subscriptionId: string): Promise<boolean> => {
      if (deletingIdsRef.current.has(subscriptionId)) {
        return false;
      }

      deletingIdsRef.current.add(subscriptionId);

      try {
        await deleteSubscription(subscriptionId);
        await refreshSubscriptions();
        return true;
      } catch (error) {
        console.error("Failed to delete subscription.", error);
        showCustomAlert({
          confirmText: copy.common.ok,
          title: copy.common.saveFailed,
        });
        return false;
      } finally {
        deletingIdsRef.current.delete(subscriptionId);
      }
    },
    [copy.common.ok, copy.common.saveFailed, refreshSubscriptions],
  );

  const handleUpdateSubscription = useCallback(
    async (subscription: Subscription): Promise<boolean> => {
      if (updateInFlightRef.current) {
        return false;
      }

      updateInFlightRef.current = true;

      try {
        await updateSubscription(subscription);
        await refreshSubscriptions();
        return true;
      } catch (error) {
        console.error("Failed to update subscription.", error);
        return false;
      } finally {
        updateInFlightRef.current = false;
      }
    },
    [refreshSubscriptions],
  );

  const handleToggleSubscriptionActive = useCallback(
    async (subscriptionId: string): Promise<boolean> => {
      if (togglingIdsRef.current.has(subscriptionId)) {
        return false;
      }

      togglingIdsRef.current.add(subscriptionId);

      try {
        await toggleSubscriptionActive(subscriptionId);
        await refreshSubscriptions();
        return true;
      } catch (error) {
        console.error("Failed to toggle subscription state.", error);
        showCustomAlert({
          confirmText: copy.common.ok,
          title: copy.common.saveFailed,
        });
        return false;
      } finally {
        togglingIdsRef.current.delete(subscriptionId);
      }
    },
    [copy.common.ok, copy.common.saveFailed, refreshSubscriptions],
  );

  useEffect(() => {
    if (!isAppReady || settings.currency === "JPY") {
      return;
    }

    if (exchangeRates[settings.currency] > 0) {
      return;
    }

    void refreshExchangeRates();
  }, [
    exchangeRates,
    isAppReady,
    refreshExchangeRates,
    settings.currency,
  ]);

  useEffect(() => {
    if (!isAppReady) {
      return;
    }

    void (async () => {
      try {
        await syncNotificationCatalog(settings, subscriptions);
      } catch (error) {
        console.error("Failed to sync notification catalog.", error);
      }
    })();
  }, [
    isAppReady,
    settings,
    subscriptions,
  ]);

  if (!isAppReady) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{copy.common.loading}</Text>
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView
      style={[styles.root, { backgroundColor: theme.background }]}
    >
      <SafeAreaProvider>
        <AppThemeProvider
          value={{
            colorMode: settings.theme,
            currency: settings.currency,
            exchangeRateSource,
            exchangeRates,
            formatAmountFromJPY,
            isDarkMode: settings.theme === "dark",
            language: settings.language,
            notificationEmail: settings.notificationEmail,
            notificationEnabled: settings.notificationEnabled,
            setCurrencyPreference: handleSetCurrencyPreference,
            setLanguagePreference: handleSetLanguagePreference,
            setNotificationEmailPreference: handleSetNotificationEmailPreference,
            setNotificationEnabledPreference:
              handleSetNotificationEnabledPreference,
            setThemePreference: handleSetThemePreference,
            theme,
          }}
        >
          <NavigationContainer theme={getNavigationTheme(theme)}>
            <StatusBar
              barStyle={theme.mode === "dark" ? "light-content" : "dark-content"}
              backgroundColor={theme.background}
            />
            <Stack.Navigator
              screenOptions={{
                animationDuration: 150,
                contentStyle: {
                  backgroundColor: theme.background,
                },
                freezeOnBlur: true,
                headerShown: false,
              }}
            >
              <Stack.Screen name="MainTabs">
                {({ navigation }) => (
                  <MainTabs
                    onCreateSubscription={handleCreateSubscription}
                    onDeleteSubscription={handleDeleteSubscription}
                    onEditSubscription={(subscriptionId) =>
                      navigation.navigate("Edit", { subscriptionId })
                    }
                    onOpenSubscriptionDetail={(subscriptionId) =>
                      navigation.navigate("Detail", { subscriptionId })
                    }
                    onRefreshSubscriptions={refreshSubscriptions}
                    onToggleSubscriptionActive={handleToggleSubscriptionActive}
                    subscriptions={subscriptions}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen
                name="Detail"
                options={{
                  animation:
                    Platform.OS === "android"
                      ? "simple_push"
                      : "slide_from_right",
                  animationDuration: 160,
                }}
              >
                {({ navigation, route }) => {
                  const subscription = subscriptions.find(
                    (currentSubscription) =>
                      currentSubscription.id === route.params.subscriptionId,
                  );

                  return (
                    <SubscriptionDetailScreen
                      onBackToHome={() => navigation.popToTop()}
                      onDeleteSubscription={handleDeleteSubscription}
                      onEditSubscription={(subscriptionId) =>
                        navigation.navigate("Edit", { subscriptionId })
                      }
                      onGoBack={() => navigation.goBack()}
                      subscription={subscription}
                    />
                  );
                }}
              </Stack.Screen>
              <Stack.Screen
                name="Edit"
                options={{
                  animation:
                    Platform.OS === "android"
                      ? "simple_push"
                      : "slide_from_right",
                  animationDuration: 160,
                }}
              >
                {({ navigation, route }) => {
                  const subscription = subscriptions.find(
                    (currentSubscription) =>
                      currentSubscription.id === route.params.subscriptionId,
                  );

                  return (
                    <EditScreen
                      onCancel={() => navigation.goBack()}
                      onGoBack={() => navigation.goBack()}
                      onSaveComplete={() => navigation.popToTop()}
                      onSaveSubscription={handleUpdateSubscription}
                      subscription={subscription}
                    />
                  );
                }}
              </Stack.Screen>
            </Stack.Navigator>
          </NavigationContainer>
          <CustomAlertHost />
        </AppThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: themes.dark.background,
  },
  loadingText: {
    color: themes.dark.text,
    fontSize: 16,
    fontWeight: "700",
  },
});
