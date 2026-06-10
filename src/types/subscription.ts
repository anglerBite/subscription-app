import type { SubscriptionCategoryValue } from "../constants/subscriptionCategories";

export type BillingCycle = "monthly" | "yearly" | "weekly";
export type BillingCycleValue = BillingCycle | "";

export type Subscription = {
  id: string;
  name: string;
  price: number;
  billingCycle: BillingCycleValue;
  nextPaymentDate: string;
  category: SubscriptionCategoryValue;
  memo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
