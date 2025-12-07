// Mock Native Modules
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock Expo Crypto if needed (though jest-expo might handle some)
jest.mock('expo-crypto', () => ({
    getRandomBytesAsync: jest.fn(async (length) => {
        return new Uint8Array(length).fill(1); // Deterministic for tests
    }),
    randomUUID: jest.fn(() => 'test-uuid'),
}));

// Mock AES Crypto
jest.mock('react-native-aes-crypto', () => ({
    pbkdf2: jest.fn(async (password, salt, cost, length) => {
        return 'mock-derived-key-hex';
    }),
    encrypt: jest.fn(async (text, key, iv) => {
        return 'mock-encrypted-text';
    }),
    decrypt: jest.fn(async (cipher, key, iv) => {
        return 'mock-decrypted-text';
    }),
    randomKey: jest.fn(async (length) => {
        return 'mock-iv-hex';
    }),
}));

// Mock SecureStore
jest.mock('expo-secure-store', () => ({
    setItemAsync: jest.fn(),
    getItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));

// Mock Biometrics
jest.mock('react-native-biometrics', () => {
    return jest.fn().mockImplementation(() => {
        return {
            simplePrompt: jest.fn(() => Promise.resolve({ success: true })),
            isSensorAvailable: jest.fn(() => Promise.resolve({ available: true, biometryType: 'FaceID' })),
        };
    });
});
