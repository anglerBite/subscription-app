import { env } from "../config/env";
import { getOrCreateInstallationId } from "../repositories/installationRepository";
import type { AppSettings } from "../types/settings";
import type { NotificationCatalogSyncPayload } from "../types/notification";
import type { Subscription } from "../types/subscription";

function getNotificationApiBaseUrl(): string | null {
  const baseUrl = env.notificationApiUrl;

  return baseUrl ? baseUrl.replace(/\/+$/, "") : null;
}

function buildNotificationCatalogPayload(
  installationId: string,
  settings: AppSettings,
  subscriptions: Subscription[],
): NotificationCatalogSyncPayload {
  return {
    currency: settings.currency,
    installationId,
    language: settings.language,
    notificationEmail: settings.notificationEmail.trim(),
    notificationEnabled: settings.notificationEnabled,
    subscriptions: subscriptions.map((subscription) => ({
      category: subscription.category,
      currency: settings.currency,
      isActive: subscription.isActive,
      nextPaymentDate: subscription.nextPaymentDate,
      price: subscription.price,
      serviceName: subscription.name,
      subscriptionId: subscription.id,
    })),
    syncedAt: new Date().toISOString(),
  };
}

export async function syncNotificationCatalog(
  settings: AppSettings,
  subscriptions: Subscription[],
): Promise<void> {
  const baseUrl = getNotificationApiBaseUrl();

  if (!baseUrl) {
    return;
  }

  const installationId = await getOrCreateInstallationId();
  const payload = buildNotificationCatalogPayload(
    installationId,
    settings,
    subscriptions,
  );

  const response = await fetch(`${baseUrl}/api/notification-catalog/sync`, {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Notification sync failed: ${response.status}`);
  }
}
