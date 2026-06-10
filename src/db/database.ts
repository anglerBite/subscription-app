import { normalizeSubscriptionCategory } from "../constants/subscriptionCategories";
import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

const DATABASE_NAME = "subscription-manager.db";

type TableInfoRow = {
  name: string;
};

type SubscriptionIdRow = {
  id: string;
};

type SubscriptionCategoryRow = {
  category: string;
  id: string;
};

const CREATE_SUBSCRIPTIONS_TABLE_STATEMENT = `
  CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    billing_cycle TEXT NOT NULL,
    next_payment_date TEXT NOT NULL,
    category TEXT NOT NULL,
    memo TEXT,
    is_active INTEGER NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`;

async function ensureDisplayOrderColumn(
  database: SQLiteDatabase,
): Promise<void> {
  const columns = await database.getAllAsync<TableInfoRow>(
    "PRAGMA table_info(subscriptions)",
  );
  const hasDisplayOrderColumn = columns.some(
    (column) => column.name === "display_order",
  );

  if (hasDisplayOrderColumn) {
    return;
  }

  await database.execAsync(`
    ALTER TABLE subscriptions
    ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0;
  `);

  const rows = await database.getAllAsync<SubscriptionIdRow>(
    `SELECT id
    FROM subscriptions
    ORDER BY datetime(created_at) ASC, id ASC`,
  );

  await database.withTransactionAsync(async () => {
    for (const [index, row] of rows.entries()) {
      await database.runAsync(
        "UPDATE subscriptions SET display_order = ? WHERE id = ?",
        index,
        row.id,
      );
    }
  });
}

async function normalizeStoredCategories(
  database: SQLiteDatabase,
): Promise<void> {
  const rows = await database.getAllAsync<SubscriptionCategoryRow>(
    "SELECT id, category FROM subscriptions",
  );

  await database.withTransactionAsync(async () => {
    for (const row of rows) {
      if (!row.category.trim()) {
        continue;
      }

      const normalizedCategory = normalizeSubscriptionCategory(row.category);

      if (normalizedCategory === row.category) {
        continue;
      }

      await database.runAsync(
        "UPDATE subscriptions SET category = ? WHERE id = ?",
        normalizedCategory,
        row.id,
      );
    }
  });
}

let databasePromise: Promise<SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = openDatabaseAsync(DATABASE_NAME);
  }

  return databasePromise;
}

export async function initializeDatabase(): Promise<SQLiteDatabase> {
  const database = await getDatabase();

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    ${CREATE_SUBSCRIPTIONS_TABLE_STATEMENT}
  `);
  await ensureDisplayOrderColumn(database);
  await normalizeStoredCategories(database);

  return database;
}
