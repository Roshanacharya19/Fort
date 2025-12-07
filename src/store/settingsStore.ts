
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
    biometricsEnabled: boolean;
    autoLockTimeout: number; // in seconds
    theme: 'dark' | 'light' | 'system';
    allowScreenshots: boolean;

    toggleBiometrics: (enabled: boolean) => void;
    setAutoLockTimeout: (seconds: number) => void;
    setTheme: (theme: 'dark' | 'light' | 'system') => void;
    setAllowScreenshots: (allowed: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            biometricsEnabled: false,
            autoLockTimeout: 60,
            theme: 'dark',
            allowScreenshots: false,

            toggleBiometrics: (enabled) => set({ biometricsEnabled: enabled }),
            setAutoLockTimeout: (seconds) => set({ autoLockTimeout: seconds }),
            setTheme: (theme) => set({ theme }),
            setAllowScreenshots: (allowed) => set({ allowScreenshots: allowed }),
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
