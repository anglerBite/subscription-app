import type { LanguageCode } from "../types/settings";

const localeMap: Record<LanguageCode, string> = {
  en: "en-US",
  ja: "ja-JP",
  ko: "ko-KR",
  zh: "zh-CN",
};

type DateParts = {
  day: number;
  month: number;
  year: number;
};

function toPaddedNumber(value: number): string {
  return String(value).padStart(2, "0");
}

function toDateParts(date: Date): DateParts {
  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

export function formatDateForStorage(date: Date): string {
  const { day, month, year } = toDateParts(date);

  return `${year}-${toPaddedNumber(month)}-${toPaddedNumber(day)}`;
}

export function getTodayDateString(): string {
  return formatDateForStorage(new Date());
}

export function parseStoredDate(dateString: string): Date | null {
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

  const parsedDate = new Date(year, month - 1, day, 12, 0, 0, 0);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  const parts = toDateParts(parsedDate);

  if (parts.year !== year || parts.month !== month || parts.day !== day) {
    return null;
  }

  return parsedDate;
}

export function formatDateForDisplay(
  dateString: string,
  language: LanguageCode,
): string {
  const parsedDate = parseStoredDate(dateString);

  if (!parsedDate) {
    return dateString;
  }

  try {
    return new Intl.DateTimeFormat(localeMap[language], {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(parsedDate);
  } catch {
    const { day, month, year } = toDateParts(parsedDate);

    return `${year}/${toPaddedNumber(month)}/${toPaddedNumber(day)}`;
  }
}
