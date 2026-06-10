import type { SubscriptionCategoryValue } from "../constants/subscriptionCategories";
import type { CurrencyCode, LanguageCode } from "./settings";

export type NotificationCatalogRecord = {
  category: SubscriptionCategoryValue;
  currency: CurrencyCode;
  isActive: boolean;
  nextPaymentDate: string;
  price: number;
  serviceName: string;
  subscriptionId: string;
};

export type NotificationCatalogSyncPayload = {
  currency: CurrencyCode;
  installationId: string;
  language: LanguageCode;
  notificationEmail: string;
  notificationEnabled: boolean;
  subscriptions: NotificationCatalogRecord[];
  syncedAt: string;
};

export type PaymentReminderPayload = {
  amount: number;
  currency: CurrencyCode;
  installationId: string;
  notificationEmail: string;
  serviceName: string;
  subscriptionId: string;
  targetDate: string;
};
