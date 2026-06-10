import { getSubscriptions, updateSubscription } from "./subscriptionService";
import type {
  BillingCycleValue,
  Subscription,
} from "../types/subscription";

type DateParts = {
  day: number;
  month: number;
  year: number;
};

function parseDateString(dateString: string): DateParts | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return null;
  }

  const [yearText, monthText, dayText] = dateString.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }

  const candidateDate = new Date(Date.UTC(year, month - 1, day));

  if (
    candidateDate.getUTCFullYear() !== year ||
    candidateDate.getUTCMonth() + 1 !== month ||
    candidateDate.getUTCDate() !== day
  ) {
    return null;
  }

  return { day, month, year };
}

function formatDateParts({ day, month, year }: DateParts): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getLastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function addMonths(dateString: string, monthCount: number): string {
  const parsedDate = parseDateString(dateString);

  if (!parsedDate) {
    return dateString;
  }

  const zeroBasedMonth = parsedDate.month - 1;
  const totalMonths = zeroBasedMonth + monthCount;
  const nextYear = parsedDate.year + Math.floor(totalMonths / 12);
  const normalizedMonth = ((totalMonths % 12) + 12) % 12;
  const nextMonth = normalizedMonth + 1;
  const nextDay = Math.min(
    parsedDate.day,
    getLastDayOfMonth(nextYear, nextMonth),
  );

  return formatDateParts({
    day: nextDay,
    month: nextMonth,
    year: nextYear,
  });
}

function addDays(dateString: string, dayCount: number): string {
  const parsedDate = parseDateString(dateString);

  if (!parsedDate) {
    return dateString;
  }

  const nextDate = new Date(
    Date.UTC(parsedDate.year, parsedDate.month - 1, parsedDate.day + dayCount),
  );

  return formatDateParts({
    day: nextDate.getUTCDate(),
    month: nextDate.getUTCMonth() + 1,
    year: nextDate.getUTCFullYear(),
  });
}

function getTodayDateString(): string {
  const today = new Date();

  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate(),
  ).padStart(2, "0")}`;
}

export function getNextPaymentDate(
  date: string,
  billingCycle: BillingCycleValue,
): string {
  if (!billingCycle) {
    return date;
  }

  switch (billingCycle) {
    case "yearly":
      return addMonths(date, 12);
    case "weekly":
      return addDays(date, 7);
    case "monthly":
    default:
      return addMonths(date, 1);
  }
}

async function updateSubscriptionPaymentDateIfExpired(
  subscription: Subscription,
  todayDateString: string,
): Promise<boolean> {
  if (
    !subscription.isActive ||
    !subscription.billingCycle ||
    !subscription.nextPaymentDate.trim()
  ) {
    return false;
  }

  let nextPaymentDate = subscription.nextPaymentDate;
  let hasUpdated = false;
  let safetyCounter = 0;

  while (nextPaymentDate < todayDateString && safetyCounter < 600) {
    const advancedDate = getNextPaymentDate(
      nextPaymentDate,
      subscription.billingCycle,
    );

    if (advancedDate === nextPaymentDate) {
      break;
    }

    nextPaymentDate = advancedDate;
    hasUpdated = true;
    safetyCounter += 1;
  }

  if (!hasUpdated || nextPaymentDate === subscription.nextPaymentDate) {
    return false;
  }

  await updateSubscription({
    ...subscription,
    nextPaymentDate,
  });

  return true;
}

export async function updateExpiredPaymentDates(): Promise<number> {
  const subscriptions = await getSubscriptions();
  const todayDateString = getTodayDateString();
  let updatedCount = 0;

  for (const subscription of subscriptions) {
    const didUpdate = await updateSubscriptionPaymentDateIfExpired(
      subscription,
      todayDateString,
    );

    if (didUpdate) {
      updatedCount += 1;
    }
  }

  return updatedCount;
}
