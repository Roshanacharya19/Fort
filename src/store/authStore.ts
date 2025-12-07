import { create } from 'zustand';
import { DatabaseService } from '../services/database';
import { SecureStorageService } from '../services/secureStorage';

interface AuthState {
    isAuthenticated: boolean;
    isLocked: boolean;
    isSetup: boolean; // True if user has created a master password
    encryptionKey: string | null;
    setAuthenticated: (status: boolean) => void;
    setLocked: (status: boolean) => void;
    setSetup: (status: boolean) => void;
    setKey: (key: string | null) => void;

    // Actions
    logout: () => void;
    checkSetup: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    isAuthenticated: false,
    isLocked: false,
    isSetup: false,
    encryptionKey: null,

    setAuthenticated: (status) => set({ isAuthenticated: status }),
    setLocked: (status) => set({ isLocked: status }),
    setSetup: (status) => set({ isSetup: status }),
    setKey: (key) => set({ encryptionKey: key }),

    logout: () => {
        // Clear keys from memory (handled by not storing them in global state explicitly,
        // but we should ensure DB is closed or keys dropped if we stored them).
        // In this store, we don't hold the key. The DB service holds the connection.
        // Ideally we close DB on logout.
        DatabaseService.close();
        set({ isAuthenticated: false, isLocked: true, encryptionKey: null }); // Clear key
    },

    checkSetup: async () => {
        // Check if salt/hash exists in keychain
        const data = await SecureStorageService.getAuthData();
        if (data) {
            set({ isSetup: true });
        } else {
            set({ isSetup: false });
        }
    }
}));
