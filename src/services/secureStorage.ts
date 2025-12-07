import * as Keychain from 'react-native-keychain';

const SERVICE_NAME = 'com.fort.app.secure';
const BIOMETRIC_SERVICE_NAME = 'com.fort.app.secure.biometric';

export const SecureStorageService = {
    /**
     * Stores the master key salt or hash. We never store the actual password or derived key persistently if we can avoid it.
     * But usually we store a "verification hash" to check if password is correct.
     */
    saveAuthData: async (salt: string, verificationHash: string) => {
        // Store salt and verification hash as JSON in username/password fields of keychain
        // username: salt
        // password: verificationHash
        await Keychain.setGenericPassword(salt, verificationHash, { service: SERVICE_NAME });
    },

    getAuthData: async () => {
        const credentials = await Keychain.getGenericPassword({ service: SERVICE_NAME });
        if (credentials) {
            return {
                salt: credentials.username,
                verificationHash: credentials.password
            };
        }
        return null;
    },

    clearAuthData: async () => {
        await Keychain.resetGenericPassword({ service: SERVICE_NAME });
    },

    saveBiometricKey: async (key: string) => {
        await Keychain.setGenericPassword('biometric_key', key, {
            service: BIOMETRIC_SERVICE_NAME,
            accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
            accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            storage: Keychain.STORAGE_TYPE.RSA,
        });
    },

    getBiometricKey: async () => {
        try {
            const credentials = await Keychain.getGenericPassword({
                service: BIOMETRIC_SERVICE_NAME,
                authenticationPrompt: {
                    title: 'Unlock Fort',
                },
            });
            if (credentials) {
                return credentials.password;
            }
            return null;
        } catch (error) {
            console.log('Biometric retrieval failed', error);
            return null;
        }
    },

    clearBiometricKey: async () => {
        await Keychain.resetGenericPassword({ service: BIOMETRIC_SERVICE_NAME });
    }
};
