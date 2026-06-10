# Subrin Notification API

## Why the API is required

Subrin stores subscriptions in local SQLite on the device. A backend is required
for production email reminders because the server cannot read device-local data
unless the app synchronizes reminder metadata.

Production flow:

1. Subrin app saves subscriptions locally.
2. Subrin app synchronizes notification metadata to the backend API.
3. A scheduled backend job checks subscriptions due tomorrow.
4. The backend sends email through Resend.
5. The backend stores `last_notified_for_date` to avoid duplicate sends.

## Sync endpoint

`POST /api/notification-catalog/sync`

Used by the app whenever:

- a subscription is created
- a subscription is updated
- a subscription is deleted
- active/inactive state changes
- notification email changes
- language or currency changes

Request body:

```json
{
  "installationId": "subrin-123",
  "notificationEmail": "example@example.com",
  "language": "ja",
  "currency": "JPY",
  "syncedAt": "2026-06-08T01:23:45.000Z",
  "subscriptions": [
    {
      "subscriptionId": "abc",
      "serviceName": "Netflix",
      "price": 1490,
      "currency": "JPY",
      "category": "video",
      "nextPaymentDate": "2026-06-09",
      "isActive": true
    }
  ]
}
```

Behavior:

- if `notificationEmail` is blank, disable all reminder targets for that installation
- upsert every received subscription by `(installation_id, subscription_id)`
- mark records missing from the payload as deleted or inactive

## Daily reminder endpoint

`POST /api/payment-reminders/daily`

This endpoint is intended for a backend cron job, not for the mobile app.

Behavior:

- compute tomorrow in backend local time
- select active records where `next_payment_date = tomorrow`
- skip records where `last_notified_for_date = next_payment_date`
- send one email per due subscription
- after success, set `last_notified_for_date = next_payment_date`

## Example backend table

```sql
CREATE TABLE notification_subscriptions (
  installation_id TEXT NOT NULL,
  subscription_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  next_payment_date TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL,
  category TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  notification_email TEXT NOT NULL,
  last_notified_for_date TEXT,
  deleted_at TEXT,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (installation_id, subscription_id)
);
```

## Environment variables

App:

- `EXPO_PUBLIC_SUBRIN_NOTIFICATION_API_URL`

Backend:

- `RESEND_API_KEY`
- `EMAIL_FROM`
- `SUBRIN_CRON_SECRET`
