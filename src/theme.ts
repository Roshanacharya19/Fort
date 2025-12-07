
import { Platform } from 'react-native';

export const palette = {
    // Modern Deep Dark Theme
    background: '#0B0C15',      // Very deep blue-black
    surface: '#121421',         // Slightly lighter blue-black for cards
    surfaceVariant: '#1E2136',  // Lighter still for interactive elements
    primary: '#6C63FF',         // Modern Blurple
    primaryVariant: '#544DDB',
    secondary: '#00F0FF',       // Cyber Cyan
    textPrimary: '#FFFFFF',
    textSecondary: '#8F90A6',   // Cool grey
    error: '#FF4757',
    warning: '#FFA502',
    success: '#2ED573',
    divider: '#2C2E45',

    // Light Mode (Reference)
    lightBackground: '#F7F7F9',
    lightSurface: '#FFFFFF',
    lightPrimary: '#6C63FF',
};

export const theme = {
    colors: {
        background: palette.background,
        surface: palette.surface,
        surfaceVariant: palette.surfaceVariant,
        primary: palette.primary,
        primaryVariant: palette.primaryVariant,
        secondary: palette.secondary,
        text: palette.textPrimary,
        textSecondary: palette.textSecondary,
        error: palette.error,
        warning: palette.warning,
        success: palette.success,
        border: palette.divider,
    },
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        xxl: 48,
    },
    typography: {
        h1: {
            fontSize: 28,
            fontWeight: 'bold' as 'bold',
            color: palette.textPrimary,
        },
        h2: {
            fontSize: 22,
            fontWeight: '600' as '600',
            color: palette.textPrimary,
        },
        body: {
            fontSize: 16,
            fontWeight: 'normal' as 'normal',
            color: palette.textPrimary,
        },
        bodySmall: {
            fontSize: 14,
            fontWeight: 'normal' as 'normal',
            color: palette.textSecondary,
        },
        caption: {
            fontSize: 12,
            fontWeight: 'normal' as 'normal',
            color: palette.textSecondary,
        },
        monospace: {
            fontFamily: Platform.select({ ios: 'Courier New', android: 'monospace' }),
            fontSize: 16,
            color: palette.textPrimary,
        }
    },
    borderRadius: {
        s: 4,
        m: 8,
        l: 12,
        xl: 16,
        round: 999,
    }
};
