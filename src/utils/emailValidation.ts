export function isValidEmailAddress(value: string): boolean {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedValue);
}

