import type { Subscription } from "../types/subscription";

export const getMonthlyAmount = (subscription: Subscription): number => {
  // Normalize every billing cycle to a monthly amount for summaries and charts.
  switch (subscription.billingCycle) {
    case "yearly":
      return subscription.price / 12;
    case "weekly":
      return subscription.price * 4;
    case "monthly":
    default:
      return subscription.price;
  }
};

export const calculateMonthlyTotal = (
  subscriptionList: Subscription[],
): number =>
  subscriptionList
    .filter((subscription) => subscription.isActive)
    .reduce(
      (total, subscription) => total + getMonthlyAmount(subscription),
      0,
    );

export const calculateAnnualTotal = (
  subscriptionList: Subscription[],
): number => calculateMonthlyTotal(subscriptionList) * 12;

export const calculateCategoryTotals = (
  subscriptionList: Subscription[],
): { category: string; total: number }[] => {
  const totals = subscriptionList
    .filter((subscription) => subscription.isActive)
    .reduce<Record<string, number>>((accumulator, subscription) => {
      const categoryTotal = accumulator[subscription.category] ?? 0;

      accumulator[subscription.category] =
        categoryTotal + getMonthlyAmount(subscription);

      return accumulator;
    }, {});

  return Object.entries(totals)
    .map(([category, total]) => ({ category, total }))
    .sort((left, right) => right.total - left.total);
};
