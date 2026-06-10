import AsyncStorage from "@react-native-async-storage/async-storage";

import { env } from "../config/env";
import type { CurrencyCode } from "../types/settings";

const EXCHANGE_RATE_STORAGE_KEY = "exchangeRates";
const EXCHANGE_RATE_TTL_MS = 12 * 60 * 60 * 1000;
const OPEN_ER_API_URL = env.exchangeRateApiUrl;
const FRANKFURTER_API_URL = env.exchangeRateFallbackApiUrl;

const currencySymbols: Record<CurrencyCode, string> = {
  CNY: "¥",
  JPY: "¥",
  KRW: "₩",
  USD: "$",
};

const currencyFractionDigits: Record<CurrencyCode, number> = {
  CNY: 2,
  JPY: 0,
  KRW: 0,
  USD: 2,
};

export type ExchangeRates = Record<CurrencyCode, number>;

export type ExchangeRatesCache = {
  baseCurrency: "JPY";
  fetchedAt: string;
  rates: ExchangeRates;
};

export type ExchangeRateLoadSource =
  | "cache"
  | "network"
  | "stale-cache"
  | "fallback";

export type ExchangeRateLoadResult = ExchangeRatesCache & {
  source: ExchangeRateLoadSource;
};

type OpenErApiRatesResponse = {
  base_code?: string;
  result?: string;
  rates?: Partial<Record<CurrencyCode, number>>;
  time_last_update_utc?: string;
};

type FrankfurterRatesResponse = {
  amount?: number;
  base?: string;
  date?: string;
  rates?: Partial<Record<CurrencyCode, number>>;
};

export const fallbackRates: ExchangeRates = {
  CNY: 0.047,
  JPY: 1,
  KRW: 9,
  USD: 0.0065,
};

function sanitizeRates(
  input: Partial<Record<CurrencyCode, unknown>>,
): ExchangeRates {
  return {
    CNY:
      typeof input.CNY === "number" && Number.isFinite(input.CNY) && input.CNY > 0
        ? input.CNY
        : fallbackRates.CNY,
    JPY: 1,
    KRW:
      typeof input.KRW === "number" && Number.isFinite(input.KRW) && input.KRW > 0
        ? input.KRW
        : fallbackRates.KRW,
    USD:
      typeof input.USD === "number" && Number.isFinite(input.USD) && input.USD > 0
        ? input.USD
        : fallbackRates.USD,
  };
}

function hasRequiredRates(rates: ExchangeRates): boolean {
  return rates.CNY > 0 && rates.KRW > 0 && rates.USD > 0 && rates.JPY === 1;
}

function normalizeCache(value: unknown): ExchangeRatesCache | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<ExchangeRatesCache>;

  if (
    candidate.baseCurrency !== "JPY" ||
    typeof candidate.fetchedAt !== "string" ||
    !candidate.rates ||
    typeof candidate.rates !== "object"
  ) {
    return null;
  }

  const normalizedRates = sanitizeRates(candidate.rates);

  if (!hasRequiredRates(normalizedRates)) {
    return null;
  }

  const fetchedAtTime = new Date(candidate.fetchedAt).getTime();

  if (!Number.isFinite(fetchedAtTime)) {
    return null;
  }

  return {
    baseCurrency: "JPY",
    fetchedAt: candidate.fetchedAt,
    rates: normalizedRates,
  };
}

function isCacheFresh(fetchedAt: string): boolean {
  const fetchedAtTime = new Date(fetchedAt).getTime();

  if (!Number.isFinite(fetchedAtTime)) {
    return false;
  }

  return Date.now() - fetchedAtTime < EXCHANGE_RATE_TTL_MS;
}

async function readCachedExchangeRates(): Promise<ExchangeRatesCache | null> {
  const serializedCache = await AsyncStorage.getItem(EXCHANGE_RATE_STORAGE_KEY);

  if (!serializedCache) {
    return null;
  }

  try {
    const parsedCache: unknown = JSON.parse(serializedCache);
    const normalizedCache = normalizeCache(parsedCache);

    if (!normalizedCache) {
      await AsyncStorage.removeItem(EXCHANGE_RATE_STORAGE_KEY);
      return null;
    }

    return normalizedCache;
  } catch (error) {
    console.error("Failed to parse exchange-rate cache.", error);
    await AsyncStorage.removeItem(EXCHANGE_RATE_STORAGE_KEY);
    return null;
  }
}

async function saveExchangeRatesCache(
  cache: ExchangeRatesCache,
): Promise<void> {
  await AsyncStorage.setItem(
    EXCHANGE_RATE_STORAGE_KEY,
    JSON.stringify(cache),
  );
}

function buildCache(
  rates: Partial<Record<CurrencyCode, unknown>>,
  fetchedAt?: string,
): ExchangeRatesCache {
  return {
    baseCurrency: "JPY",
    fetchedAt: fetchedAt ?? new Date().toISOString(),
    rates: sanitizeRates(rates),
  };
}

async function fetchOpenErApiRates(): Promise<ExchangeRatesCache> {
  if (!OPEN_ER_API_URL) {
    throw new Error("EXPO_PUBLIC_EXCHANGE_RATE_API_URL is not configured.");
  }

  const response = await fetch(OPEN_ER_API_URL);

  if (!response.ok) {
    throw new Error(`Open ER API request failed: ${response.status}`);
  }

  const payload = (await response.json()) as OpenErApiRatesResponse;

  if (
    payload.result !== "success" ||
    payload.base_code !== "JPY" ||
    !payload.rates
  ) {
    throw new Error("Unexpected Open ER API response.");
  }

  return buildCache(
    {
      CNY: payload.rates.CNY,
      JPY: 1,
      KRW: payload.rates.KRW,
      USD: payload.rates.USD,
    },
    payload.time_last_update_utc
      ? new Date(payload.time_last_update_utc).toISOString()
      : new Date().toISOString(),
  );
}

async function fetchFrankfurterRates(): Promise<ExchangeRatesCache> {
  if (!FRANKFURTER_API_URL) {
    throw new Error(
      "EXPO_PUBLIC_EXCHANGE_RATE_FALLBACK_API_URL is not configured.",
    );
  }

  const response = await fetch(FRANKFURTER_API_URL);

  if (!response.ok) {
    throw new Error(`Frankfurter request failed: ${response.status}`);
  }

  const payload = (await response.json()) as FrankfurterRatesResponse;

  if (payload.base !== "JPY" || !payload.rates) {
    throw new Error("Unexpected Frankfurter response.");
  }

  return buildCache(
    {
      CNY: payload.rates.CNY,
      JPY: 1,
      KRW: payload.rates.KRW,
      USD: payload.rates.USD,
    },
    payload.date
      ? new Date(`${payload.date}T00:00:00.000Z`).toISOString()
      : new Date().toISOString(),
  );
}

async function fetchExchangeRatesFromApi(): Promise<ExchangeRatesCache> {
  try {
    return await fetchOpenErApiRates();
  } catch (openErApiError) {
    console.error("Open ER API fetch failed.", openErApiError);
    return fetchFrankfurterRates();
  }
}

export async function getExchangeRates(
  baseCurrency: "JPY" = "JPY",
): Promise<ExchangeRateLoadResult> {
  const cachedRates = await readCachedExchangeRates();

  if (
    cachedRates &&
    cachedRates.baseCurrency === baseCurrency &&
    isCacheFresh(cachedRates.fetchedAt)
  ) {
    return {
      ...cachedRates,
      source: "cache",
    };
  }

  try {
    const freshRates = await fetchExchangeRatesFromApi();
    await saveExchangeRatesCache(freshRates);

    return {
      ...freshRates,
      source: "network",
    };
  } catch (error) {
    if (cachedRates && cachedRates.baseCurrency === baseCurrency) {
      return {
        ...cachedRates,
        source: "stale-cache",
      };
    }

    console.error("Using fallback exchange rates.", error);

    return {
      baseCurrency,
      fetchedAt: new Date().toISOString(),
      rates: fallbackRates,
      source: "fallback",
    };
  }
}

export function convertFromJPY(
  amountJPY: number,
  targetCurrency: CurrencyCode,
  rates: ExchangeRates,
): number {
  if (targetCurrency === "JPY") {
    return amountJPY;
  }

  const rate = rates[targetCurrency];

  if (!Number.isFinite(rate) || rate <= 0) {
    return amountJPY;
  }

  return amountJPY * rate;
}

export function formatCurrency(
  amount: number,
  currency: CurrencyCode,
): string {
  const fractionDigits = currencyFractionDigits[currency];

  return `${currencySymbols[currency]}${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(amount)}`;
}

export function formatAmountFromJPY(
  amountJPY: number,
  targetCurrency: CurrencyCode,
  rates: ExchangeRates,
): string {
  if (targetCurrency === "JPY") {
    return formatCurrency(amountJPY, "JPY");
  }

  const rate = rates[targetCurrency];

  if (!Number.isFinite(rate) || rate <= 0) {
    return formatCurrency(amountJPY, "JPY");
  }

  return formatCurrency(convertFromJPY(amountJPY, targetCurrency, rates), targetCurrency);
}
