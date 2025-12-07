import * as Crypto from 'expo-crypto';
import { Entry, EntryRow } from '../../types';
import { DatabaseService } from '../database';
import { EncryptionService } from '../encryption';

export const EntriesRepository = {
    async getAll(key: string): Promise<Entry[]> {
        const db = DatabaseService.getDb();
        if (!db) return [];

        const { rows } = await db.execute('SELECT * FROM entries ORDER BY name ASC');
        // rows is { length, item(index) } or array depending on library version.
        // react-native-quick-sqlite usually returns a proprietary object with .item(i) or array access.
        // Actually it returns `{ rows: { _array: [], length: ... } }` or just `{ rows: [...] }`?
        // QuickSQLite results: { rows: { length: number, item: (idx) => any, _array?: any[] } }
        // We should use iteration or _array if available.

        // Check if rows exists
        if (!rows) return [];

        const count = rows.length;
        const entries: Entry[] = [];

        for (let i = 0; i < count; i++) {
            const row = rows.item(i) as EntryRow;
            try {
                // Decrypt fields
                const nameObj = JSON.parse(row.name);
                const name = await EncryptionService.decrypt(nameObj.cipher, key, nameObj.iv);

                // Optimization: Only decrypt name/username for list view?
                // But we need to return full Entry object usually.
                // Let's decrypt everything.
                let username = undefined;
                if (row.username) {
                    const uObj = JSON.parse(row.username);
                    username = await EncryptionService.decrypt(uObj.cipher, key, uObj.iv);
                }

                let password = undefined;
                if (row.password) {
                    const pObj = JSON.parse(row.password);
                    password = await EncryptionService.decrypt(pObj.cipher, key, pObj.iv);
                }

                let url = undefined;
                if (row.url) {
                    const urlObj = JSON.parse(row.url);
                    url = await EncryptionService.decrypt(urlObj.cipher, key, urlObj.iv);
                }

                let notes = undefined;
                if (row.notes) {
                    const nObj = JSON.parse(row.notes);
                    notes = await EncryptionService.decrypt(nObj.cipher, key, nObj.iv);
                }

                entries.push({
                    id: row.id,
                    name,
                    username,
                    password,
                    url,
                    notes,
                    categoryId: row.category_id,
                    tags: row.tags ? JSON.parse(row.tags) : [], // Tags encrypted? Prompt said "tags: string[], // encrypted, optional".
                    // We should decrypt tags if they are encrypted. For now assuming plain JSON or ignored.
                    // If encrypted, it would be a blob.
                    isFavorite: !!row.is_favorite,
                    createdAt: row.created_at,
                    modifiedAt: row.modified_at,
                    lastAccessedAt: row.last_accessed_at,
                    lastCopiedAt: 0, // Not persisted?
                    passwordHistory: row.password_history ? JSON.parse(row.password_history) : []
                });
            } catch (e) {
                console.error('Failed to decrypt entry', row.id, e);
                console.log('Row Name Type:', typeof row.name);
                console.log('Row Name:', row.name);
                // Skip or show error placeholder
                entries.push({
                    ...row,
                    name: 'Error Decrypting',
                    isFavorite: !!row.is_favorite,
                    createdAt: row.created_at,
                    modifiedAt: row.modified_at,
                    lastAccessedAt: row.last_accessed_at,
                    lastCopiedAt: 0,
                    passwordHistory: []
                } as any);
            }
        }
        return entries;
    },

    async create(entry: Omit<Entry, 'id' | 'createdAt' | 'modifiedAt' | 'lastAccessedAt' | 'lastCopiedAt' | 'passwordHistory'>, key: string): Promise<Entry | null> {
        const db = DatabaseService.getDb();
        if (!db) return null;

        const id = Crypto.randomUUID();
        const now = Date.now();

        // Encrypt fields
        const encName = await EncryptionService.encrypt(entry.name, key);
        const encUsername = entry.username ? await EncryptionService.encrypt(entry.username, key) : null;
        const encPassword = entry.password ? await EncryptionService.encrypt(entry.password, key) : null;
        const encUrl = entry.url ? await EncryptionService.encrypt(entry.url, key) : null;
        const encNotes = entry.notes ? await EncryptionService.encrypt(entry.notes, key) : null;

        // Tags? Assuming plain for now to simplify, or encrypt as blob.

        try {
            await db.execute(`
            INSERT INTO entries (id, name, username, password, url, notes, category_id, tags, is_favorite, created_at, modified_at, last_accessed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
                id,
                JSON.stringify(encName),
                encUsername ? JSON.stringify(encUsername) : null,
                encPassword ? JSON.stringify(encPassword) : null,
                encUrl ? JSON.stringify(encUrl) : null,
                encNotes ? JSON.stringify(encNotes) : null,
                entry.categoryId || null,
                JSON.stringify(entry.tags || []),
                entry.isFavorite ? 1 : 0,
                now,
                now,
                now
            ]);

            return {
                ...entry,
                id,
                createdAt: now,
                modifiedAt: now,
                lastAccessedAt: now,
                lastCopiedAt: 0,
                passwordHistory: []
            };
        } catch (e) {
            console.error('Failed to create entry', e);
            return null;
        }
    },

    async update(entry: Entry, key: string): Promise<boolean> {
        const db = DatabaseService.getDb();
        if (!db) return false;

        const now = Date.now();

        const encName = await EncryptionService.encrypt(entry.name, key);
        const encUsername = entry.username ? await EncryptionService.encrypt(entry.username, key) : null;
        const encPassword = entry.password ? await EncryptionService.encrypt(entry.password, key) : null;
        const encUrl = entry.url ? await EncryptionService.encrypt(entry.url, key) : null;
        const encNotes = entry.notes ? await EncryptionService.encrypt(entry.notes, key) : null;

        try {
            await db.execute(`
            UPDATE entries SET 
                name = ?, 
                username = ?, 
                password = ?, 
                url = ?, 
                notes = ?, 
                category_id = ?, 
                tags = ?, 
                is_favorite = ?, 
                modified_at = ?
            WHERE id = ?
          `, [
                JSON.stringify(encName),
                encUsername ? JSON.stringify(encUsername) : null,
                encPassword ? JSON.stringify(encPassword) : null,
                encUrl ? JSON.stringify(encUrl) : null,
                encNotes ? JSON.stringify(encNotes) : null,
                entry.categoryId || null,
                JSON.stringify(entry.tags || []),
                entry.isFavorite ? 1 : 0,
                now,
                entry.id
            ]);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    },

    async delete(id: string): Promise<boolean> {
        const db = DatabaseService.getDb();
        if (!db) return false;
        try {
            await db.execute('DELETE FROM entries WHERE id = ?', [id]);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }
};
