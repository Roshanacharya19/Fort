
export interface Entry {
    id: string;
    name: string;
    username?: string;
    password?: string;
    url?: string;
    notes?: string;
    categoryId?: string;
    tags?: string[];
    isFavorite: boolean;
    createdAt: number;
    modifiedAt: number;
    lastAccessedAt: number;
    lastCopiedAt: number;
    passwordHistory: PasswordHistoryItem[];
}

export interface PasswordHistoryItem {
    password: string; // Encrypted in DB, but decrypted in object? 
    // If we assume Entry object in memory is DECRYPTED, then yes string.
    changedAt: number;
}

// DB Row Structure (Encrypted)
export interface EntryRow {
    id: string;
    name: string; // Encrypted
    username: string; // Encrypted
    password: string; // Encrypted
    url: string; // Encrypted
    notes: string; // Encrypted
    category_id: string;
    tags: string; // Encrypted JSON
    is_favorite: number;
    created_at: number;
    modified_at: number;
    last_accessed_at: number;
    password_history: string; // Encrypted JSON
}

export interface Category {
    id: string;
    name: string;
    icon?: string;
    color?: string;
    sortOrder: number;
    isDefault: boolean;
}

export interface UserSettings {
    autoLockTimeout: number; // seconds
    clipboardClearTimeout: number; // seconds
    biometricsEnabled: boolean;
    darkModeEnabled: boolean;
    darkModeFollowSystem: boolean;
    // ... other settings
}
