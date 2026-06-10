# Resend backend example

Install on the backend project:

```bash
npm install resend
```

Example implementation:

```ts
import { Resend } from "resend";

type NotificationCatalogRecord = {
  category: string;
  currency: "JPY" | "USD" | "KRW" | "CNY";
  isActive: boolean;
  nextPaymentDate: string;
  price: number;
  serviceName: string;
  subscriptionId: string;
};

type NotificationCatalogSyncPayload = {
  currency: "JPY" | "USD" | "KRW" | "CNY";
  installationId: string;
  language: "ja" | "en" | "ko" | "zh";
  notificationEmail: string;
  subscriptions: NotificationCatalogRecord[];
  syncedAt: string;
};

type StoredNotificationRecord = {
  amount: number;
  category: string;
  currency: "JPY" | "USD" | "KRW" | "CNY";
  installationId: string;
  isActive: boolean;
  lastNotifiedForDate: string | null;
  nextPaymentDate: string;
  notificationEmail: string;
  serviceName: string;
  subscriptionId: string;
  updatedAt: string;
};

type NotificationRepository = {
  findDueTomorrow: (targetDate: string) => Promise<StoredNotificationRecord[]>;
  markDeletedForMissingSubscriptions: (
    installationId: string,
    activeSubscriptionIds: string[],
    updatedAt: string,
  ) => Promise<void>;
  markReminderSent: (
    installationId: string,
    subscriptionId: string,
    targetDate: string,
    updatedAt: string,
  ) => Promise<void>;
  replaceInstallationEmail: (
    installationId: string,
    notificationEmail: string,
    updatedAt: string,
  ) => Promise<void>;
  upsertCatalogRecord: (record: StoredNotificationRecord) => Promise<void>;
};

const resend = new Resend(process.env.RESEND_API_KEY);
const fromAddress =
  process.env.EMAIL_FROM ?? "Subrin <no-reply@example.com>";

function formatCurrency(
  amount: number,
  currency: StoredNotificationRecord["currency"],
): string {
  const symbolMap = {
    CNY: "¥",
    JPY: "¥",
    KRW: "₩",
    USD: "$",
  } as const;

  return `${symbolMap[currency]}${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Math.round(amount))}`;
}

function getTomorrowDateString(now: Date = new Date()): string {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildReminderEmail(record: StoredNotificationRecord) {
  const formattedDate = record.nextPaymentDate.replace(/-/g, "/");
  const formattedAmount = formatCurrency(record.amount, record.currency);
  const subject = "Subrin 支払い前日のお知らせ";
  const text = [
    "Subrinをご利用いただきありがとうございます。",
    "",
    "ご登録中のサブスクリプションの支払日が明日となりました。",
    "",
    `対象サービス： ${record.serviceName}`,
    `支払予定日： ${formattedDate}`,
    `金額： ${formattedAmount}`,
    "",
    "支払い忘れにご注意ください。",
    "",
    "※このメールはSubrinから自動送信されています。",
    "※本メールへの返信はできません。",
  ].join("\n");

  return {
    html: text.replace(/\n/g, "<br />"),
    subject,
    text,
  };
}

export async function syncNotificationCatalog(
  repository: NotificationRepository,
  payload: NotificationCatalogSyncPayload,
) {
  const updatedAt = new Date().toISOString();

  await repository.replaceInstallationEmail(
    payload.installationId,
    payload.notificationEmail.trim(),
    updatedAt,
  );

  const activeSubscriptionIds = payload.subscriptions.map(
    (subscription) => subscription.subscriptionId,
  );

  for (const subscription of payload.subscriptions) {
    await repository.upsertCatalogRecord({
      amount: subscription.price,
      category: subscription.category,
      currency: subscription.currency,
      installationId: payload.installationId,
      isActive: subscription.isActive,
      lastNotifiedForDate: null,
      nextPaymentDate: subscription.nextPaymentDate,
      notificationEmail: payload.notificationEmail.trim(),
      serviceName: subscription.serviceName,
      subscriptionId: subscription.subscriptionId,
      updatedAt,
    });
  }

  await repository.markDeletedForMissingSubscriptions(
    payload.installationId,
    activeSubscriptionIds,
    updatedAt,
  );
}

export async function sendDailyPaymentReminders(
  repository: NotificationRepository,
  now: Date = new Date(),
) {
  const targetDate = getTomorrowDateString(now);
  const dueRecords = await repository.findDueTomorrow(targetDate);

  for (const record of dueRecords) {
    if (!record.isActive || !record.notificationEmail.trim()) {
      continue;
    }

    if (record.lastNotifiedForDate === record.nextPaymentDate) {
      continue;
    }

    const email = buildReminderEmail(record);
    const { error } = await resend.emails.send({
      from: fromAddress,
      subject: email.subject,
      text: email.text,
      html: email.html,
      to: [record.notificationEmail],
    });

    if (error) {
      throw new Error(`Failed to send reminder: ${error.message}`);
    }

    await repository.markReminderSent(
      record.installationId,
      record.subscriptionId,
      record.nextPaymentDate,
      new Date().toISOString(),
    );
  }
}
```
