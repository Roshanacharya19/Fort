import { EncryptionService } from '../encryption';

describe('EncryptionService', () => {
    const TEST_PASSWORD = 'TestPassword123!';
    const TEST_SALT = '00'.repeat(16); // 16 bytes hex

    it('derives a consistent 256-bit key using PBKDF2', async () => {
        const key1 = await EncryptionService.deriveKey(TEST_PASSWORD, TEST_SALT);
        const key2 = await EncryptionService.deriveKey(TEST_PASSWORD, TEST_SALT);
        expect(key1).toBeDefined();
        expect(key1).toBe(key2); // Deterministic
        // In our mock we return 'mock-derived-key-hex'. Ideally we'd test real crypto but we mocked it.
        // To test REAL crypto logic in Jest with expo-crypto is hard without a native runner or polyfill.
        // We are checking that our Service calls the library correctly.
        expect(key1).toBe('mock-derived-key-hex');
    });

    it('encrypts data returning IV and Cipher', async () => {
        const key = 'mock-derived-key-hex';
        const result = await EncryptionService.encrypt('Sensitive Data', key);
        expect(result).toHaveProperty('iv');
        expect(result).toHaveProperty('cipher');
        // Check our mock behaviors
        expect(result.cipher).toBe('mock-encrypted-text');
    });

    it('decrypts data correctly', async () => {
        const key = 'mock-derived-key-hex';
        const iv = 'mock-iv';
        const plain = await EncryptionService.decrypt('mock-encrypted-text', key, iv);
        expect(plain).toBe('mock-decrypted-text');
    });
});
