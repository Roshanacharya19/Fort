import * as Crypto from 'expo-crypto';
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import zxcvbn from 'zxcvbn';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Logo } from '../../components/Logo';
import { DatabaseService } from '../../services/database';
import { EncryptionService } from '../../services/encryption';
import { SecureStorageService } from '../../services/secureStorage';
import { useAuthStore } from '../../store/authStore';
import { theme } from '../../theme';

export const SetupScreen = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const setAuthenticated = useAuthStore(state => state.setAuthenticated);
    const setSetup = useAuthStore(state => state.setSetup);
    const setKey = useAuthStore(state => state.setKey);

    const getStrength = (pass: string) => {
        if (!pass) return { score: 0, label: '' };
        const result = zxcvbn(pass);
        const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Excellent'];
        return { score: result.score, label: labels[result.score] };
    };

    const strength = getStrength(password);
    const strengthColors = ['#CF6679', '#FFB74D', '#FFEB3B', '#69F0AE', '#00C853']; // Red to Green

    const handleSetup = async () => {
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        if (password.length < 12) { // Requirement: 12 chars
            Alert.alert('Weak Password', 'Master password must be at least 12 characters long.');
            return;
        }

        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

        if (!hasUpper || !hasLower || !hasNumber || !hasSymbol) {
            Alert.alert('Weak Password', 'Password must include uppercase, lowercase, number, and symbol.');
            return;
        }

        setLoading(true);
        try {
            // 1. Generate Salt
            const salt = await EncryptionService.generateSalt();

            // 2. Derive Master Key
            const key = await EncryptionService.deriveKey(password, salt);

            // 3. Create Verification Hash
            const keyHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, key);

            // 4. Save to Keychain
            await SecureStorageService.saveAuthData(salt, keyHash);

            // 5. Init DB
            const success = DatabaseService.init(key);
            if (!success) throw new Error('Failed to initialize database');

            // 6. Update State
            setKey(key); // Store key in memory
            setSetup(true);
            setAuthenticated(true);

        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to secure vault. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={{ alignItems: 'center', marginBottom: theme.spacing.l }}>
                    <Logo size={64} />
                </View>
                <Text style={styles.title}>Welcome to Fort</Text>
                <Text style={styles.subtitle}>Create a Master Password to secure your vault. This password is the only key to your data.</Text>

                <Input
                    label="Master Password (min 12 chars)"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter a strong password"
                />

                {/* Strength Meter */}
                <View style={styles.meterContainer}>
                    <View style={{ flexDirection: 'row', height: 4, borderRadius: 2, overflow: 'hidden', backgroundColor: theme.colors.surfaceVariant }}>
                        <View style={{ flex: strength.score + 1, backgroundColor: strengthColors[strength.score] || theme.colors.surfaceVariant }} />
                        <View style={{ flex: 4 - (strength.score), backgroundColor: 'transparent' }} />
                    </View>
                    <Text style={[styles.strengthLabel, { color: strengthColors[strength.score] }]}>{strength.label}</Text>
                </View>

                <Input
                    label="Confirm Password"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Repeat password"
                />

                <View style={styles.spacer} />

                <Button
                    title="Create Vault"
                    onPress={handleSetup}
                    loading={loading}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: theme.spacing.l,
        flexGrow: 1,
        justifyContent: 'center',
    },
    title: {
        ...theme.typography.h1,
        marginBottom: theme.spacing.m,
        textAlign: 'center',
        color: theme.colors.text,
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xl,
        textAlign: 'center',
    },
    spacer: {
        height: theme.spacing.xl,
    },
    meterContainer: {
        marginBottom: theme.spacing.m,
    },
    strengthLabel: {
        ...theme.typography.caption,
        textAlign: 'right',
        marginTop: 4,
    }
});
