function readEnvValue(value: string | undefined): string {
  return value?.trim() ?? "";
}

export const env = {
  appName: readEnvValue(process.env.EXPO_PUBLIC_APP_NAME) || "Subrin",
  exchangeRateApiUrl: readEnvValue(
    process.env.EXPO_PUBLIC_EXCHANGE_RATE_API_URL,
  ),
  exchangeRateFallbackApiUrl: readEnvValue(
    process.env.EXPO_PUBLIC_EXCHANGE_RATE_FALLBACK_API_URL,
  ),
  notificationApiUrl: readEnvValue(
    process.env.EXPO_PUBLIC_SUBRIN_NOTIFICATION_API_URL,
  ),
} as const;
