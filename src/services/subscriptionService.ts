import { normalizeSubscriptionCategory } from "../constants/subscriptionCategories";
import {
  createSubscription as createSubscriptionRecord,
  deleteSubscription as deleteSubscriptionRecord,
  getSubscriptionCount,
  getSubscriptionById as getSubscriptionByIdRecord,
  getSubscriptions as getSubscriptionRecords,
  toggleSubscriptionActive as toggleSubscriptionActiveRecord,
  updateSubscription as updateSubscriptionRecord,
} from "../repositories/subscriptionRepository";
import type {
  BillingCycleValue,
  Subscription,
} from "../types/subscription";

export type SubscriptionDraft = {
  billingCycle: BillingCycleValue;
  category: string;
  memo: string;
  name: string;
  nextPaymentDate: string;
  price: number;
};

export type SubscriptionValidationError =
  | "memoTooLong"
  | "nextPaymentDateInvalid"
  | "serviceNameRequired";

function createSubscriptionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isValidDateInput(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(parsedDate.getTime())) {
    return false;
  }

  return parsedDate.toISOString().slice(0, 10) === value;
}

function normalizePrice(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function normalizeDraft(input: SubscriptionDraft): SubscriptionDraft {
  const trimmedCategory = input.category.trim();

  return {
    ...input,
    price: normalizePrice(input.price),
    nextPaymentDate: input.nextPaymentDate.trim(),
    name: input.name.trim(),
    category: trimmedCategory,
    memo: input.memo?.trim() ?? "",
  };
}

export function validateSubscriptionDraft(
  input: SubscriptionDraft,
): SubscriptionValidationError | null {
  if (!input.name.trim()) {
    return "serviceNameRequired";
  }

  if (
    input.nextPaymentDate.trim() &&
    !isValidDateInput(input.nextPaymentDate.trim())
  ) {
    return "nextPaymentDateInvalid";
  }

  if ((input.memo?.length ?? 0) > 100) {
    return "memoTooLong";
  }

  return null;
}

function validateDraft(input: SubscriptionDraft): void {
  const validationError = validateSubscriptionDraft(input);

  if (validationError) {
    throw new Error(validationError);
  }
}

export async function createSubscription(
  input: SubscriptionDraft,
): Promise<Subscription> {
  const normalizedDraft = normalizeDraft(input);
  validateDraft(normalizedDraft);

  const timestamp = new Date().toISOString();
  const subscription: Subscription = {
    id: createSubscriptionId(),
    name: normalizedDraft.name,
    price: normalizedDraft.price,
    billingCycle: normalizedDraft.billingCycle,
    nextPaymentDate: normalizedDraft.nextPaymentDate,
    category: normalizedDraft.category
      ? normalizeSubscriptionCategory(normalizedDraft.category)
      : "",
    memo: normalizedDraft.memo,
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await createSubscriptionRecord(subscription);

  return subscription;
}

export async function getSubscriptions(): Promise<Subscription[]> {
  return getSubscriptionRecords();
}

export async function getSubscriptionById(
  subscriptionId: string,
): Promise<Subscription | null> {
  return getSubscriptionByIdRecord(subscriptionId);
}

export async function updateSubscription(
  subscription: Subscription,
): Promise<Subscription> {
  const draft: SubscriptionDraft = {
    billingCycle: subscription.billingCycle,
    category: subscription.category,
    memo: subscription.memo ?? "",
    name: subscription.name,
    nextPaymentDate: subscription.nextPaymentDate,
    price: subscription.price,
  };
  const normalizedDraft = normalizeDraft(draft);
  validateDraft(normalizedDraft);

  const nextSubscription: Subscription = {
    ...subscription,
    ...normalizedDraft,
    category: normalizedDraft.category
      ? normalizeSubscriptionCategory(normalizedDraft.category)
      : "",
    updatedAt: new Date().toISOString(),
  };

  await updateSubscriptionRecord(nextSubscription);

  return nextSubscription;
}

export async function deleteSubscription(
  subscriptionId: string,
): Promise<void> {
  await deleteSubscriptionRecord(subscriptionId);
}

export async function toggleSubscriptionActive(
  subscriptionId: string,
): Promise<void> {
  await toggleSubscriptionActiveRecord(
    subscriptionId,
    new Date().toISOString(),
  );
}

export async function hasSubscriptions(): Promise<boolean> {
  return (await getSubscriptionCount()) > 0;
}
