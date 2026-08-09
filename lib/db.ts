import { createClient, type Client, type ResultSet } from '@libsql/client'

let client: Client | null = null

export function getDb(): Client {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL ?? 'file:garden.db',
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  }
  return client
}

// Convert libSQL ResultSet rows → plain objects
export function toObjects(result: ResultSet): Record<string, unknown>[] {
  return result.rows.map(row =>
    Object.fromEntries(result.columns.map((col, i) => [col, row[i]]))
  )
}

export function toObject(result: ResultSet): Record<string, unknown> | null {
  if (result.rows.length === 0) return null
  return Object.fromEntries(result.columns.map((col, i) => [col, result.rows[0][i]]))
}

export async function initSchema(): Promise<void> {
  const db = getDb()
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS plants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'other',
      variety TEXT,
      location TEXT,
      planted_date TEXT,
      sun_requirement TEXT DEFAULT 'full sun',
      water_frequency_days INTEGER DEFAULT 3,
      water_amount_liters REAL,
      auto_watered INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS watering_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plant_id INTEGER NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
      watered_at TEXT NOT NULL DEFAULT (datetime('now')),
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS pest_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plant_id INTEGER NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
      observed_at TEXT NOT NULL DEFAULT (datetime('now')),
      pest_or_disease TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'low',
      treatment TEXT,
      resolved INTEGER NOT NULL DEFAULT 0,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS harvest_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plant_id INTEGER NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
      harvested_at TEXT NOT NULL DEFAULT (datetime('now')),
      quantity TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS garden_areas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      location TEXT,
      status TEXT NOT NULL DEFAULT 'planned',
      target_date TEXT,
      plants TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      notes TEXT,
      category TEXT NOT NULL DEFAULT 'general',
      month TEXT NOT NULL,
      week INTEGER,
      done INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS heat_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      alert_date TEXT NOT NULL UNIQUE,
      max_temp_c REAL NOT NULL,
      task_id INTEGER REFERENCES tasks(id),
      resolved INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)

  try {
    await db.execute(`ALTER TABLE plants ADD COLUMN auto_watered INTEGER NOT NULL DEFAULT 0`)
  } catch {
    // column already exists
  }

  try {
    await db.execute(`ALTER TABLE pest_logs ADD COLUMN catalog_key TEXT`)
  } catch {
    // column already exists
  }
}
