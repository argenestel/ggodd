import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "app.db");

function getDb(): Database.Database {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  return db;
}

export function initDb() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      steam_id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      avatar_url TEXT,
      created_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS steam_profiles (
      steam_id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      avatar_url TEXT,
      profile_url TEXT,
      last_updated INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS markets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      market_address TEXT UNIQUE NOT NULL,
      creator_steam_id TEXT NOT NULL,
      streamer_steam_id TEXT NOT NULL,
      streamer_name TEXT,
      achievement_id TEXT NOT NULL,
      achievement_name TEXT NOT NULL,
      achievement_description TEXT,
      deadline INTEGER NOT NULL,
      resolved INTEGER DEFAULT 0,
      outcome INTEGER,
      total_yes_sol REAL DEFAULT 0,
      total_no_sol REAL DEFAULT 0,
      created_at INTEGER DEFAULT (unixepoch())
    );

    CREATE INDEX IF NOT EXISTS idx_markets_streamer ON markets(streamer_steam_id);
    CREATE INDEX IF NOT EXISTS idx_markets_resolved ON markets(resolved);
  `);

  db.close();
}

export function getDbInstance(): Database.Database {
  return getDb();
}
