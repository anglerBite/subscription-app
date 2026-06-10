import AsyncStorage from "@react-native-async-storage/async-storage";

const INSTALLATION_ID_STORAGE_KEY = "subrin_installation_id";

function createInstallationId(): string {
  return `subrin-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function getOrCreateInstallationId(): Promise<string> {
  const storedInstallationId = await AsyncStorage.getItem(
    INSTALLATION_ID_STORAGE_KEY,
  );

  if (storedInstallationId) {
    return storedInstallationId;
  }

  const nextInstallationId = createInstallationId();
  await AsyncStorage.setItem(INSTALLATION_ID_STORAGE_KEY, nextInstallationId);

  return nextInstallationId;
}

