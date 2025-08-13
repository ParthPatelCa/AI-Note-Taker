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
    sourceKind TEXT,
    isSynced INTEGER DEFAULT 0,
    lastModified INTEGER,
    sourceUri TEXT,
    rawContent TEXT
  );`);
  
  // Add new columns to existing tables if they don't exist
  try {
    db.execSync(`ALTER TABLE summaries ADD COLUMN isSynced INTEGER DEFAULT 0;`);
  } catch (e) {
    // Column already exists
  }
  try {
    db.execSync(`ALTER TABLE summaries ADD COLUMN lastModified INTEGER;`);
  } catch (e) {
    // Column already exists
  }
  try {
    db.execSync(`ALTER TABLE summaries ADD COLUMN sourceUri TEXT;`);
  } catch (e) {
    // Column already exists
  }
  try {
    db.execSync(`ALTER TABLE summaries ADD COLUMN rawContent TEXT;`);
  } catch (e) {
    // Column already exists
  }
}

export function insertSummary(s: any) {
  const timestamp = Date.now();
  db.runSync(
    "INSERT INTO summaries(id,createdAt,title,tldr,medium,full,actions,sourceKind,isSynced,lastModified,sourceUri,rawContent) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
    [
      s.id, 
      s.createdAt, 
      s.title, 
      s.tldr, 
      s.medium, 
      s.full, 
      s.actions, 
      s.sourceKind,
      s.isSynced || 0,
      s.lastModified || timestamp,
      s.sourceUri || null,
      s.rawContent || null
    ]
  );
}

export function updateSyncStatus(id: string, isSynced: number) {
  const timestamp = Date.now();
  db.runSync(
    "UPDATE summaries SET isSynced = ?, lastModified = ? WHERE id = ?",
    [isSynced, timestamp, id]
  );
}

export function updateSummary(id: string, updates: any) {
  const timestamp = Date.now();
  const fields = [];
  const values = [];
  
  Object.keys(updates).forEach(key => {
    if (key !== 'id') {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
  });
  
  if (fields.length > 0) {
    fields.push('lastModified = ?');
    values.push(timestamp);
    values.push(id);
    
    db.runSync(
      `UPDATE summaries SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }
}

export function getPendingSyncItems() {
  return db.getAllSync(
    "SELECT * FROM summaries WHERE isSynced = 0 ORDER BY createdAt ASC"
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
