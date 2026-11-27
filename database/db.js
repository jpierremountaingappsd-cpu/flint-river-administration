
const Database = require("better-sqlite3");
const path = require("node:path");
const fs = require("node:fs");

// Choose the database directory based on the environment
const dataDir = process.env.DATA_DIR || (
  process.platform === "win32"
    ? __dirname
    : "/data/storage"
);

// Create the directory if it does not exist
fs.mkdirSync(dataDir, { recursive: true });

// Connect to the SQLite database
const db = new Database(
  path.join(dataDir, "flint-river.sqlite")
);

// Enable SQLite write-ahead logging
db.pragma("journal_mode = WAL");

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      position TEXT NOT NULL,
      department TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active',
      added_by TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS warnings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      moderator_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      subject_id TEXT,
      details TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS inbox_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id TEXT NOT NULL,
      username TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Open',
      assigned_to TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      closed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS inbox_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL,
      sender_id TEXT NOT NULL,
      message TEXT NOT NULL,
      direction TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES inbox_tickets(id)
    );
  `);
}

function logAction(action, actorId, subjectId = null, details = "") {
  db.prepare(
    `INSERT INTO audit_log
    (action, actor_id, subject_id, details)
    VALUES (?, ?, ?, ?)`
  ).run(action, actorId, subjectId, details);
}

module.exports = {
  db,
  initializeDatabase,
  logAction
};
