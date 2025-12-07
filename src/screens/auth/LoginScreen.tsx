import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';
import { Fingerprint } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Logo } from '../../components/Logo';
import { DatabaseService } from '../../services/database';
import { EncryptionService } from '../../services/encryption';
import { SecureStorageService } from '../../services/secureStorage';
import { useAuthStore } from '../../store/authStore';
import { theme } from '../../theme';



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
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (hasHardware && isEnrolled) {
            const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
            if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
                setBiometryType('FaceID');
            } else {
                setBiometryType('Fingerprint');
            }
        }
    };

    const promptBiometrics = async () => {
        try {
            const key = await SecureStorageService.getBiometricKey();
            if (key) {
                const dbSuccess = DatabaseService.init(key);
                if (dbSuccess) {
                    setKey(key);
                    setAuthenticated(true);
                } else {
                    Alert.alert('Error', 'Database init failed with biometric key.');
                }
            } else {
                // User cancelled or no key
            }
        } catch (e) {
            console.log('Biometric unlock failed', e);
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
                    <Text style={{ color: theme.colors.primary, marginTop: 8 }}>Use {biometryType === 'FaceID' ? 'Face ID' : 'Fingerprint'}</Text>
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
