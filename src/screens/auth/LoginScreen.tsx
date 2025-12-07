import * as Crypto from 'expo-crypto';
import { Fingerprint } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Logo } from '../../components/Logo';
import { DatabaseService } from '../../services/database';
import { EncryptionService } from '../../services/encryption';
import { SecureStorageService } from '../../services/secureStorage';
import { useAuthStore } from '../../store/authStore';
import { theme } from '../../theme';

const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });

export const LoginScreen = () => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [biometryType, setBiometryType] = useState<string | undefined>(undefined);
    const setAuthenticated = useAuthStore(state => state.setAuthenticated);
    const setKey = useAuthStore(state => state.setKey);

    useEffect(() => {
        checkBiometrics();
    }, []);

    const checkBiometrics = async () => {
        const { available, biometryType } = await rnBiometrics.isSensorAvailable();
        if (available && biometryType) {
            setBiometryType(biometryType);
        }
    };

    const promptBiometrics = async () => {
        try {
            const { success } = await rnBiometrics.simplePrompt({ promptMessage: 'Unlock Fort' });
            if (success) {
                Alert.alert('Not Implemented', 'Biometric unlock requires Key storage setup which is pending.');
            }
        } catch (e) {
            console.log('Biometric failed', e);
        }
    };

    const handleLogin = async () => {
        setLoading(true);
        try {
            const authData = await SecureStorageService.getAuthData();
            if (!authData) {
                Alert.alert('Error', 'No setup found.');
                return;
            }

            const { salt, verificationHash } = authData;

            // Derive key
            const key = await EncryptionService.deriveKey(password, salt);

            // Hash check
            const keyHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, key);

            if (keyHash === verificationHash) {
                // Success
                const dbSuccess = DatabaseService.init(key);
                if (dbSuccess) {
                    setKey(key);
                    setAuthenticated(true);
                } else {
                    Alert.alert('Error', 'Database init failed.');
                }
            } else {
                Alert.alert('Error', 'Incorrect password.');
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', padding: theme.spacing.l }}>
            <View style={{ alignItems: 'center', marginBottom: theme.spacing.xl }}>
                <Logo size={80} />
                <View style={{ height: 16 }} />
                <Text style={{ ...theme.typography.h1, color: theme.colors.text }}>Fort</Text>
                <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary }}>Local-First Vault</Text>
            </View>

            <Input
                label="Master Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
            />

            <Button
                title="Unlock"
                onPress={handleLogin}
                loading={loading}
            />

            {biometryType && (
                <TouchableOpacity onPress={promptBiometrics} style={styles.biometricButton}>
                    <Fingerprint size={32} color={theme.colors.primary} />
                    <Text style={{ color: theme.colors.primary, marginTop: 8 }}>Use {biometryType === BiometryTypes.FaceID ? 'Face ID' : 'Fingerprint'}</Text>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    biometricButton: {
        alignItems: 'center',
        marginTop: theme.spacing.xl,
    }
});
