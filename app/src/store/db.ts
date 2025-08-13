import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabaseSync("quickscribe.db");

export function init() {
  db.execSync(`CREATE TABLE IF NOT EXISTS summaries(
    id TEXT PRIMARY KEY,
    createdAt INTEGER,
    title TEXT,
    tldr TEXT,
    medium TEXT,
    full TEXT,
    actions TEXT,
    sourceKind TEXT
  );`);
}

export function insertSummary(s: any) {
  db.runSync(
    "INSERT INTO summaries(id,createdAt,title,tldr,medium,full,actions,sourceKind) VALUES (?,?,?,?,?,?,?,?)",
    [s.id, s.createdAt, s.title, s.tldr, s.medium, s.full, s.actions, s.sourceKind]
  );
}

export function getSummary(id: string) {
  return db.getFirstSync("SELECT * FROM summaries WHERE id = ?", [id]);
}

export function listSummaries(q?: string) {
  if (q) {
    return db.getAllSync(
      "SELECT * FROM summaries WHERE title LIKE ? OR medium LIKE ? ORDER BY createdAt DESC",
      [`%${q}%`,`%${q}%`]
    );
  }
  return db.getAllSync("SELECT * FROM summaries ORDER BY createdAt DESC");
}

export function deleteSummary(id: string) {
  db.runSync("DELETE FROM summaries WHERE id = ?", [id]);
}
