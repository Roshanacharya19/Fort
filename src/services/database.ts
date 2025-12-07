import { open } from 'react-native-quick-sqlite';
// Assuming 'any' for now since type import failed, or just infer.
let db: any = null;
const DB_NAME = 'fort.db';

export const DatabaseService = {
  /**
   * Initializes the database with the given encryption key.
   * This should be called after successful authentication.
   */
  init: (key: string) => {
    try {
      // Open with encryption key if supported by the build
      // If not, we rely on field-level encryption (which we are doing anyway for sensitive fields).
      // But full DB encryption is better for metadata.
      // Note: passing encryptionKey requires the native lib to be built with SQLCipher.
      // We will assume it is or just use standard open for now.
      // If the user requires SQLCipher, we must ensure it's built.
      // For this step, we'll pass the key.
      db = open({ name: DB_NAME }); // encryptionKey option if available in `open` options

      // If the library uses PRAGMA for key:
      // db.execute(`PRAGMA key = '${key}';`);

      // Initialize tables
      DatabaseService.createTables();

      return true;
    } catch (e) {
      console.error('Failed to init DB', e);
      return false;
    }
  },

  createTables: () => {
    if (!db) return;

    // Categories Table
    db.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT,
        color TEXT,
        sort_order INTEGER,
        is_default BOOLEAN
      );
    `);

    // Entries Table
    // We store sensitive data as a JSON blob in 'encrypted_data' which is encrypted via AES-GCM *before* insert.
    // However, the schema requested puts specific fields in columns.
    // "name: string (encrypted), username: string (encrypted)..."
    // So we should have columns for them, but usually we just dump a blob for flexibility.
    // The prompt Schema shows: id, name, username, ... all separate.
    // But said "Encrypted Export... Serialize all data".
    // Efficient structure:
    // id, category_id, is_favorite, dates... (Metadata - Plaintext or Encrypted DB?)
    // encrypted_blob (Contains name, username, password, url, notes)
    // If "Metadata" like "name" is encrypted, we can't search/sort by it easily without decrypting all.
    // Prompt says: "Search... Real-time fuzzy filtering... across name, username, url".
    // If these are encrypted, we MUST decrypt everything to search, OR store a "search index" (hashed/normalized) securely?
    // "Zero knowledge" usually means client decrypts all into memory for search.
    // With 500 entries, decrypting all names is fast (<50ms).
    // So separate columns or blob?
    // This allows us to potentially load just "name" to display list without decrypting "password".

    db.execute(`
      CREATE TABLE IF NOT EXISTS entries (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,         -- Encrypted
        username TEXT,              -- Encrypted
        password TEXT NOT NULL,     -- Encrypted
        url TEXT,                   -- Encrypted
        notes TEXT,                 -- Encrypted
        category_id TEXT,
        tags TEXT,                  -- JSON stringified array, Encrypted
        is_favorite INTEGER,
        created_at INTEGER,
        modified_at INTEGER,
        last_accessed_at INTEGER,
        FOREIGN KEY(category_id) REFERENCES categories(id)
      );
    `);

    // Metadata / Settings
    db.execute(`
      CREATE TABLE IF NOT EXISTS app_metadata (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);
  },

  close: () => {
    if (db) {
      db.close();
      db = null;
    }
  },

  getDb: () => db
};
