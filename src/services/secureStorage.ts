import * as Keychain from 'react-native-keychain';

const SERVICE_NAME = 'com.fort.app.secure';

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
    }
};
