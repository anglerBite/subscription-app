import { normalizeSubscriptionCategory } from "../constants/subscriptionCategories";
import { getDatabase } from "../db/database";
import type { BillingCycleValue, Subscription } from "../types/subscription";

type SubscriptionRow = {
  id: string;
  name: string;
  price: number;
  billing_cycle: BillingCycleValue;
  next_payment_date: string;
  category: string;
  memo: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
};

function mapRowToSubscription(row: SubscriptionRow): Subscription {
  const trimmedCategory = row.category?.trim() ?? "";

  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    billingCycle: row.billing_cycle,
    nextPaymentDate: row.next_payment_date,
    category: trimmedCategory
      ? normalizeSubscriptionCategory(trimmedCategory)
      : "",
    memo: row.memo ?? "",
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createSubscription(
  subscription: Subscription,
): Promise<void> {
  const database = await getDatabase();

  await database.runAsync(
    `INSERT INTO subscriptions (
      id,
      name,
      price,
      billing_cycle,
      next_payment_date,
      category,
      memo,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )`,
    subscription.id,
    subscription.name,
    subscription.price,
    subscription.billingCycle,
    subscription.nextPaymentDate,
    subscription.category,
    subscription.memo ?? "",
    subscription.isActive ? 1 : 0,
    subscription.createdAt,
    subscription.updatedAt,
  );
}

export async function getSubscriptions(): Promise<Subscription[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<SubscriptionRow>(
    `SELECT
      id,
      name,
      price,
      billing_cycle,
      next_payment_date,
      category,
      memo,
      is_active,
      created_at,
      updated_at
    FROM subscriptions
    ORDER BY datetime(created_at) DESC, id DESC`,
  );

  return rows.map(mapRowToSubscription);
}

export async function getSubscriptionById(
  subscriptionId: string,
): Promise<Subscription | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<SubscriptionRow>(
    `SELECT
      id,
      name,
      price,
      billing_cycle,
      next_payment_date,
      category,
      memo,
      is_active,
      created_at,
      updated_at
    FROM subscriptions
    WHERE id = ?`,
    subscriptionId,
  );

  return row ? mapRowToSubscription(row) : null;
}

export async function updateSubscription(
  subscription: Subscription,
): Promise<void> {
  const database = await getDatabase();

  await database.runAsync(
    `UPDATE subscriptions
    SET
      name = ?,
      price = ?,
      billing_cycle = ?,
      next_payment_date = ?,
      category = ?,
      memo = ?,
      is_active = ?,
      created_at = ?,
      updated_at = ?
    WHERE id = ?`,
    subscription.name,
    subscription.price,
    subscription.billingCycle,
    subscription.nextPaymentDate,
    subscription.category,
    subscription.memo ?? "",
    subscription.isActive ? 1 : 0,
    subscription.createdAt,
    subscription.updatedAt,
    subscription.id,
  );
}

export async function deleteSubscription(
  subscriptionId: string,
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    "DELETE FROM subscriptions WHERE id = ?",
    subscriptionId,
  );
}

export async function toggleSubscriptionActive(
  subscriptionId: string,
  updatedAt: string,
): Promise<void> {
  const database = await getDatabase();

  await database.runAsync(
    `UPDATE subscriptions
    SET
      is_active = CASE is_active WHEN 1 THEN 0 ELSE 1 END,
      updated_at = ?
    WHERE id = ?`,
    updatedAt,
    subscriptionId,
  );
}

export async function getSubscriptionCount(): Promise<number> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM subscriptions",
  );

  return Number(result?.count ?? 0);
}
