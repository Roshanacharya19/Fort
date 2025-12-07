
import { create } from 'zustand';
import { CategoriesRepository } from '../services/repositories/categories';
import { EntriesRepository } from '../services/repositories/entries';
import { Category, Entry } from '../types';
import { useAuthStore } from './authStore';

interface EntriesState {
    entries: Entry[];
    categories: Category[];
    loading: boolean;

    loadData: () => Promise<void>;
    addEntry: (entry: Omit<Entry, 'id' | 'createdAt' | 'modifiedAt' | 'lastAccessedAt' | 'lastCopiedAt' | 'passwordHistory'>) => Promise<boolean>;
    updateEntry: (entry: Entry) => Promise<boolean>;
    deleteEntry: (id: string) => Promise<boolean>;
}

export const useEntriesStore = create<EntriesState>((set, get) => ({
    entries: [],
    categories: [],
    loading: false,

    loadData: async () => {
        const key = useAuthStore.getState().encryptionKey;
        if (!key) return;

        set({ loading: true });
        try {
            // Init categories if needed
            await CategoriesRepository.initDefaults(key);

            const [entries, categories] = await Promise.all([
                EntriesRepository.getAll(key),
                CategoriesRepository.getAll(key)
            ]);
            set({ entries, categories });
        } catch (e) {
            console.error('Failed to load data', e);
        } finally {
            set({ loading: false });
        }
    },

    addEntry: async (entryData) => {
        const key = useAuthStore.getState().encryptionKey;
        if (!key) return false;

        const newEntry = await EntriesRepository.create(entryData, key);
        if (newEntry) {
            set(state => ({ entries: [...state.entries, newEntry] }));
            return true;
        }
        return false;
    },

    updateEntry: async (entry) => {
        const key = useAuthStore.getState().encryptionKey;
        if (!key) return false;

        const success = await EntriesRepository.update(entry, key);
        if (success) {
            set(state => ({
                entries: state.entries.map(e => e.id === entry.id ? entry : e)
            }));
            return true;
        }
        return false;
    },

    deleteEntry: async (id) => {
        const success = await EntriesRepository.delete(id);
        if (success) {
            set(state => ({ entries: state.entries.filter(e => e.id !== id) }));
            return true;
        }
        return false;
    }
}));
