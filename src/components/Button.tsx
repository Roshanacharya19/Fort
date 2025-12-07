
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '../theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
}

export const Button = ({ title, onPress, variant = 'primary', loading, disabled, style }: ButtonProps) => {
    const isPrimary = variant === 'primary';
    const isSecondary = variant === 'secondary';
    const isDanger = variant === 'danger';

    let backgroundColor = isPrimary ? theme.colors.primary : isSecondary ? theme.colors.surfaceVariant : isDanger ? theme.colors.error : 'transparent';
    let textColor = isPrimary ? '#FFFFFF' : isSecondary ? theme.colors.text : isDanger ? '#FFFFFF' : theme.colors.primary;

    if (disabled) {
        backgroundColor = theme.colors.surfaceVariant;
        textColor = theme.colors.textSecondary;
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.container,
                { backgroundColor },
                style
            ]}
        >
            {loading ? (
                <ActivityIndicator color={textColor} />
            ) : (
                <Text style={[styles.text, { color: textColor }]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 50,
        borderRadius: theme.borderRadius.m,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.m,
    },
    text: {
        ...theme.typography.body,
        fontWeight: 'bold',
    }
});
