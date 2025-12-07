
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useAuthStore } from '../store/authStore';

const AUTO_LOCK_TIMEOUT = 2 * 60 * 1000; // 2 minutes default

export const useSessionManager = () => {
    const appState = useRef(AppState.currentState);
    const logout = useAuthStore(state => state.logout);
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const lastActive = useRef(Date.now());
    const timer = useRef<NodeJS.Timeout | null>(null);

    // Background Lock
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/active/) &&
                nextAppState.match(/inactive|background/)
            ) {
                // App going to background
                if (isAuthenticated) {
                    // "Immediately lock when app goes to background"
                    // But we might want a grace period? Prompt says "Immediately lock".
                    logout();
                }
            }

            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [isAuthenticated, logout]);

    // Foreground Inactivity (Placeholder: PanResponder or similar needed for real iteration)
    // For now, we rely on background lock.
    // Implementing true interaction tracking requires wrapping the App in a PanResponder.
};
