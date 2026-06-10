export const ALL_CATEGORY_KEY = "__all__";

export const SUBSCRIPTION_CATEGORIES = [
  "video",
  "music",
  "creative",
  "learning",
  "ai",
  "sns",
  "other",
] as const;

export type SubscriptionCategory = (typeof SUBSCRIPTION_CATEGORIES)[number];

export type SubscriptionCategoryValue = SubscriptionCategory | "";

export const HOME_CATEGORY_OPTIONS = [
  ALL_CATEGORY_KEY,
  ...SUBSCRIPTION_CATEGORIES,
] as const;

export function isSubscriptionCategory(
  value: string,
): value is SubscriptionCategory {
  return (SUBSCRIPTION_CATEGORIES as readonly string[]).includes(value);
}

const legacyCategoryAliasMap: Record<string, SubscriptionCategory> = {
  ai: "ai",
  AI: "ai",
  creative: "creative",
  Creative: "creative",
  learning: "learning",
  Learning: "learning",
  music: "music",
  Music: "music",
  other: "other",
  Other: "other",
  sns: "sns",
  SNS: "sns",
  video: "video",
  Video: "video",
  その他: "other",
  其他: "other",
  기타: "other",
  创作: "creative",
  制作: "creative",
  動画: "video",
  视频: "video",
  学习: "learning",
  学習: "learning",
  影音: "video",
  音乐: "music",
  音楽: "music",
  영상: "video",
  음악: "music",
  제작: "creative",
  학습: "learning",
};

export function normalizeSubscriptionCategory(
  value: string | null | undefined,
): SubscriptionCategory {
  const trimmedValue = value?.trim() ?? "";

  if (isSubscriptionCategory(trimmedValue)) {
    return trimmedValue;
  }

  const mappedValue =
    legacyCategoryAliasMap[trimmedValue] ??
    legacyCategoryAliasMap[trimmedValue.toLowerCase()];

  if (mappedValue) {
    return mappedValue;
  }

  return "other";
}
