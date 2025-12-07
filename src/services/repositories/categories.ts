
import * as Crypto from 'expo-crypto';
import { Category } from '../../types';
import { DatabaseService } from '../database';
import { EncryptionService } from '../encryption';

export const CategoriesRepository = {
    async getAll(key: string): Promise<Category[]> {
        const db = DatabaseService.getDb();
        if (!db) return [];

        const { rows } = await db.execute('SELECT * FROM categories ORDER BY sort_order ASC');
        if (!rows) return [];

        const count = rows.length;
        const categories: Category[] = [];

        for (let i = 0; i < count; i++) {
            const row = rows.item(i);
            try {
                // prompt says name is encrypted
                const nameObj = JSON.parse(row.name);
                const name = await EncryptionService.decrypt(nameObj.cipher, key, nameObj.iv);

                categories.push({
                    id: row.id,
                    name,
                    icon: row.icon,
                    color: row.color,
                    sortOrder: row.sort_order,
                    isDefault: !!row.is_default
                });
            } catch (e) {
                categories.push({ ...row, name: 'Error', isDefault: !!row.is_default });
            }
        }
        return categories;
    },

    async create(category: Omit<Category, 'id'>, key: string): Promise<Category | null> {
        const db = DatabaseService.getDb();
        if (!db) return null;

        const id = Crypto.randomUUID();
        const encName = await EncryptionService.encrypt(category.name, key);

        try {
            await db.execute(`
            INSERT INTO categories (id, name, icon, color, sort_order, is_default)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
                id,
                JSON.stringify(encName),
                category.icon || 'folder',
                category.color || '#808080',
                category.sortOrder || 0,
                category.isDefault ? 1 : 0
            ]);
            return { ...category, id };
        } catch (e) {
            console.error(e);
            return null;
        }
    },

    // Default categories initialization
    async initDefaults(key: string) {
        const db = DatabaseService.getDb();
        if (!db) return;

        const { rows } = await db.execute('SELECT count(*) as c FROM categories');
        if (rows?.item(0).c > 0) return;

        const defaults = [
            { name: 'General', icon: 'folder', color: '#9E9E9E' },
            { name: 'Social Media', icon: 'share-2', color: '#2196F3' },
            { name: 'Banking', icon: 'landmark', color: '#4CAF50' },
            { name: 'Shopping', icon: 'shopping-cart', color: '#FF9800' },
            { name: 'Work', icon: 'briefcase', color: '#9C27B0' },
            { name: 'Entertainment', icon: 'play-circle', color: '#F44336' },
        ];

        for (let i = 0; i < defaults.length; i++) {
            await this.create({
                ...defaults[i],
                sortOrder: i,
                isDefault: true
            }, key);
        }
    }
};
